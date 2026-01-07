'use server';

import fs from 'fs/promises';
import path from 'path';
import { parseGitHubUrl } from '@/lib/github';

export type FileNode = {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileNode[];
  lastModified?: number;
};

const DOCS_ROOT = path.join(process.cwd(), 'docs');
const GITHUB_API_BASE = 'https://api.github.com';

const IGNORED_DIRS = ['.git', 'node_modules', '.next', 'dist', 'build', 'coverage'];

/**
 * Fetches the file tree from a remote GitHub repository.
 */
async function getGitHubTree(owner: string, repo: string, dirPath: string = ''): Promise<FileNode[]> {
  const token = process.env.GITHUB_ACCESS_TOKEN;
  if (!token) return [];

  // GitHub API handles root as empty string or path
  const url = `${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/${dirPath}`;
  
  try {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
      next: { revalidate: 60 } // Cache for 1 min
    });

    if (!res.ok) {
        return [];
    }

    const data = await res.json();
    if (!Array.isArray(data)) return [];

    const nodes = await Promise.all(data.map(async (item: any) => {
      if (IGNORED_DIRS.includes(item.name)) return null;

      const node: FileNode = {
        name: item.name,
        path: item.path,
        type: item.type === 'dir' ? 'directory' : 'file',
      };

      if (node.type === 'directory') {
        // Recursive fetch - might be slow for large repos. 
        // Ideally we load on demand, but for now we'll do deep fetch with a limit or shallow?
        // Let's keep it recursive but maybe limit depth if needed later.
        node.children = await getGitHubTree(owner, repo, item.path);
      }

      return node;
    }));

    // Filter out nulls from ignored dirs
    const validNodes = nodes.filter((n): n is FileNode => n !== null);

    return validNodes.sort((a, b) => {
        if (a.type === b.type) return a.name.localeCompare(b.name);
        return a.type === 'directory' ? -1 : 1;
    });
  } catch (error) {
    console.error('Error fetching GitHub tree:', error);
    return [];
  }
}

/**
 * Fetches file content from GitHub.
 */
async function getGitHubDocContent(owner: string, repo: string, filePath: string): Promise<string | null> {
    const token = process.env.GITHUB_ACCESS_TOKEN;
    if (!token) return null;

    const url = `${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/${filePath}`;
    
    try {
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
        next: { revalidate: 60 }
      });

      if (!res.ok) return null;
      const data = await res.json();
      
      if (data.content && data.encoding === 'base64') {
        return Buffer.from(data.content, 'base64').toString('utf-8');
      }
      return null;
    } catch (error) {
      console.error('Error fetching GitHub doc content:', error);
      return null;
    }
}

async function getFileTreeRecursive(currentPath: string, relativePath: string = ''): Promise<FileNode[]> {
  const entries = await fs.readdir(currentPath, { withFileTypes: true });
  
  const nodes = await Promise.all(entries.map(async (entry): Promise<FileNode | null> => {
    if (IGNORED_DIRS.includes(entry.name)) return null;

    const entryPath = path.join(currentPath, entry.name);
    const entryRelativePath = path.join(relativePath, entry.name);
    
    if (entry.isDirectory()) {
      return {
        name: entry.name,
        path: entryRelativePath,
        type: 'directory',
        children: await getFileTreeRecursive(entryPath, entryRelativePath)
      };
    } else {
      const stats = await fs.stat(entryPath);
      return {
        name: entry.name,
        path: entryRelativePath,
        type: 'file',
        lastModified: stats.mtimeMs
      };
    }
  }));

  const validNodes = nodes.filter((n): n is FileNode => n !== null);

  return validNodes.sort((a, b) => {
    if (a.type === b.type) {
        if (a.type === 'file' && a.lastModified && b.lastModified) {
            return b.lastModified - a.lastModified;
        }
        return a.name.localeCompare(b.name);
    }
    return a.type === 'directory' ? -1 : 1;
  });
}

/**
 * @deprecated Use getRepoTree instead for full access.
 */
export async function getDocsTree(repoUrl?: string | null): Promise<FileNode[]> {
  if (repoUrl) {
    const parsed = parseGitHubUrl(repoUrl);
    if (parsed) {
        return await getGitHubTree(parsed.owner, parsed.repo, 'docs');
    }
  }

  try {
    return await getFileTreeRecursive(DOCS_ROOT);
  } catch (error) {
    console.error('Error reading local docs directory:', error);
    return [];
  }
}

export async function getRepoTree(repoUrl?: string | null): Promise<FileNode[]> {
  if (repoUrl) {
    const parsed = parseGitHubUrl(repoUrl);
    if (parsed) {
        return await getGitHubTree(parsed.owner, parsed.repo, '');
    }
  }

  // Local repo (dev/crm project itself) is NOT supported for full tree in this demo context 
  // because we are running inside the project we are editing, but logically
  // we might want to edit *another* local project. 
  // For now, let's assume if no repoUrl, we just show the docs of current project 
  // OR we could show the current project root? 
  // Let's default to current project root but be careful about recursion.
  
  try {
    return await getFileTreeRecursive(process.cwd());
  } catch (error) {
    console.error('Error reading local root:', error);
    return [];
  }
}

export async function getDocContent(filePath: string, repoUrl?: string | null): Promise<string | null> {
  if (repoUrl) {
    const parsed = parseGitHubUrl(repoUrl);
    if (parsed) {
        return await getGitHubDocContent(parsed.owner, parsed.repo, filePath);
    }
  }

  try {
    // If it's a relative path from docs explorer, it might be just "docs/file.md"
    // But now we support full repo, so filePath is relative to root.
    const fullPath = path.resolve(process.cwd(), filePath);
    
    // Safety check: ensure we don't read outside cwd?
    if (!fullPath.startsWith(process.cwd())) {
       // Allow if it's explicitly in docs?
       // Actually for local dev tool, reading any file in project is fine.
       // But let's basic check.
    }

    const content = await fs.readFile(fullPath, 'utf-8');
    return content;
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return null;
  }
}

export async function getDirectoryContent(dirPath: string, repoUrl?: string | null): Promise<{ path: string; content: string }[]> {
  // Helper to flatten tree and get content
  const files: { path: string; content: string }[] = [];
  let count = 0;
  const MAX_FILES = 20;

  async function traverse(currentPath: string) {
    if (count >= MAX_FILES) return;

    if (repoUrl) {
      // For remote repo, we'd need to re-fetch tree or just assume we have the path?
      // Actually we can reuse getGitHubTree but that returns nodes, not content.
      // We would have to iterate nodes and fetch content.
      const parsed = parseGitHubUrl(repoUrl);
      if (!parsed) return;
      
      const nodes = await getGitHubTree(parsed.owner, parsed.repo, currentPath);
      for (const node of nodes) {
        if (count >= MAX_FILES) break;
        if (node.type === 'file') {
          const content = await getGitHubDocContent(parsed.owner, parsed.repo, node.path);
          if (content) {
            files.push({ path: node.path, content });
            count++;
          }
        } else if (node.type === 'directory') {
          await traverse(node.path);
        }
      }
    } else {
      // Local
      // dirPath is relative to root
      const fullPath = path.resolve(process.cwd(), currentPath);
      const entries = await fs.readdir(fullPath, { withFileTypes: true });

      for (const entry of entries) {
        if (count >= MAX_FILES) break;
        if (IGNORED_DIRS.includes(entry.name)) continue;
        
        const entryRelativePath = path.join(currentPath, entry.name);
        if (entry.isDirectory()) {
            await traverse(entryRelativePath);
        } else {
            const content = await fs.readFile(path.join(fullPath, entry.name), 'utf-8');
            files.push({ path: entryRelativePath, content });
            count++;
        }
      }
    }
  }

  try {
    await traverse(dirPath);
    return files;
  } catch (e) {
    console.error('Error fetching directory content', e);
    return [];
  }
}