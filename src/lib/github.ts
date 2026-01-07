export type GitHubCommit = {
  sha: string
  message: string
  url: string
  date: string
  author: {
    name: string
    avatar_url: string
  }
}

const GITHUB_API_BASE = 'https://api.github.com';

interface CreateRepoOptions {
  templateOwner: string;
  templateRepo: string;
  name: string;
  description?: string;
  private?: boolean;
}

/**
 * Parses a GitHub URL (e.g. https://github.com/owner/repo) 
 * into owner and repo strings.
 */
export function parseGitHubUrl(url: string) {
  try {
    const u = new URL(url)
    if (u.hostname !== 'github.com') return null
    const parts = u.pathname.split('/').filter(Boolean)
    if (parts.length < 2) return null
    return { owner: parts[0], repo: parts[1] }
  } catch {
    return null
  }
}

/**
 * Fetches latest commits from GitHub REST API.
 * Supports public repos by default. Private repos require GITHUB_TOKEN env var.
 */
export async function getLatestCommits(repoUrl: string, limit = 5): Promise<GitHubCommit[]> {
  const parsed = parseGitHubUrl(repoUrl)
  if (!parsed) return []

  const { owner, repo } = parsed
  const apiUrl = `${GITHUB_API_BASE}/repos/${owner}/${repo}/commits?per_page=${limit}`
  
  const headers: HeadersInit = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'TylerLundin-Portfolio-CRM'
  }

  const token = process.env.GITHUB_TOKEN || process.env.GITHUB_ACCESS_TOKEN;
  if (token) {
    headers['Authorization'] = `token ${token}`
  }

  try {
    const res = await fetch(apiUrl, { headers, next: { revalidate: 0 } }) // No cache to ensure live updates
    if (!res.ok) {
      console.warn(`[GitHub API] Failed to fetch commits for ${owner}/${repo}: ${res.status} ${res.statusText}`)
      return []
    }

    const data = await res.json()
    if (!Array.isArray(data)) return []

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return data.map((c: any) => ({
      sha: c.sha.substring(0, 7),
      message: c.commit.message.split('\n')[0], // First line only
      url: c.html_url,
      date: c.commit.author.date,
      author: {
        name: c.author?.login || c.commit.author.name,
        avatar_url: c.author?.avatar_url || ''
      }
    }))
  } catch (err) {
    console.error(`[GitHub API] Error fetching commits:`, err)
    return []
  }
}

/**
 * Creates a new repository from a template.
 * Requires GITHUB_ACCESS_TOKEN with 'public_repo' or 'repo' scope.
 */
export async function createRepoFromTemplate({
  templateOwner,
  templateRepo,
  name,
  description,
  private: isPrivate = true,
}: CreateRepoOptions) {
  const token = process.env.GITHUB_ACCESS_TOKEN;
  if (!token) {
    throw new Error('Missing GITHUB_ACCESS_TOKEN');
  }

  // If using an Organization, we target the org's endpoint, otherwise the authenticated user's
  const targetOrg = process.env.GITHUB_ORG;
  
  // NOTE: The endpoint for creating a repo from a template is:
  // POST /repos/{template_owner}/{template_repo}/generate
  const url = `${GITHUB_API_BASE}/repos/${templateOwner}/${templateRepo}/generate`;

  const body = {
    owner: targetOrg, // Optional: The organization or person who will own the new repository
    name,
    description,
    private: isPrivate,
    include_all_branches: false, // Usually we only want the default branch
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`GitHub API Error (${res.status}): ${errorBody}`);
  }

  return res.json();
}

interface CreateEmptyRepoOptions {
  name: string;
  description?: string;
  private?: boolean;
}

/**
 * Creates a blank repository (not from a template).
 */
export async function createEmptyRepo({
  name,
  description,
  private: isPrivate = true,
}: CreateEmptyRepoOptions) {
  const token = process.env.GITHUB_ACCESS_TOKEN;
  if (!token) throw new Error('Missing GITHUB_ACCESS_TOKEN');

  const targetOrg = process.env.GITHUB_ORG;
  
  // POST /user/repos (personal) or POST /orgs/{org}/repos (organization)
  const url = targetOrg 
    ? `${GITHUB_API_BASE}/orgs/${targetOrg}/repos`
    : `${GITHUB_API_BASE}/user/repos`;

  const body = {
    name,
    description,
    private: isPrivate,
    auto_init: true, // Important: Creates an initial commit (README) so we can push files immediately
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`GitHub API Error (${res.status}): ${errorBody}`);
  }

  return res.json();
}

interface CreateFileOptions {
  owner: string;
  repo: string;
  path: string;
  content: string; // Plain text, will be base64 encoded
  message: string;
}

/**
 * Gets a file from a repository. Returns null if not found.
 */
export async function getFile(owner: string, repo: string, path: string) {
  const token = process.env.GITHUB_ACCESS_TOKEN;
  if (!token) throw new Error('Missing GITHUB_ACCESS_TOKEN');

  const url = `${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/${path}`;
  console.log(`[GitHub] getFile: ${url}`);
  
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
    next: { revalidate: 0 } // Don't cache file checks
  });

  console.log(`[GitHub] getFile response: ${res.status}`);

  if (res.status === 404) return null;
  if (!res.ok) {
    const text = await res.text();
    console.error(`[GitHub] getFile failed: ${text}`);
    throw new Error(`Failed to get file: ${res.status}`);
  }
  return res.json();
}

/**
 * Creates or updates a file in a repository.
 */
export async function createFile({
  owner,
  repo,
  path,
  content,
  message,
}: CreateFileOptions) {
  const token = process.env.GITHUB_ACCESS_TOKEN;
  if (!token) throw new Error('Missing GITHUB_ACCESS_TOKEN');

  console.log(`[GitHub] createFile: ${owner}/${repo}/${path}`);

  // Check if file exists to get sha for update
  let sha: string | undefined;
  try {
    const existing = await getFile(owner, repo, path);
    if (existing && existing.sha) {
      sha = existing.sha;
      console.log(`[GitHub] File exists, sha: ${sha}`);
    } else {
      console.log(`[GitHub] File does not exist, creating new.`);
    }
  } catch (e) {
    // Ignore error, assume create
    console.warn('[GitHub] Error checking file existence, assuming create:', e);
  }

  const url = `${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/${path}`;
  const body = {
    message,
    content: Buffer.from(content).toString('base64'),
    sha,
  };

  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
    body: JSON.stringify(body),
  });

  console.log(`[GitHub] createFile PUT response: ${res.status}`);

  if (!res.ok) {
    const errorBody = await res.text();
    console.error(`[GitHub] createFile failed: ${errorBody}`);
    throw new Error(`GitHub API Error (${res.status}): ${errorBody}`);
  }

  return res.json();
}

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  html_url: string;
  description: string | null;
  updated_at: string;
  language: string | null;
  owner: {
    login: string;
    avatar_url: string;
  };
}

/**
 * Lists repositories accessible to the authenticated user.
 * Prioritizes the configured GITHUB_ORG if set, otherwise fetches user's repos.
 */
export async function listUserRepositories(limit = 100): Promise<GitHubRepo[]> {
  const token = process.env.GITHUB_ACCESS_TOKEN;
  if (!token) throw new Error('Missing GITHUB_ACCESS_TOKEN');

  // If ORG is set, we might want to list org repos specifically, 
  // but /user/repos with affiliation=owner,organization_member usually covers it.
  // Let's stick to /user/repos for broad visibility or /orgs/:org/repos if strict.
  // For "My Repos", /user/repos?sort=updated is best.
  
  const url = `${GITHUB_API_BASE}/user/repos?sort=updated&per_page=${limit}&type=all`;

  const headers: HeadersInit = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };

  try {
    const res = await fetch(url, { headers, next: { revalidate: 60 } }); // Cache for 60s
    if (!res.ok) {
      console.warn(`[GitHub API] Failed to list repos: ${res.status} ${res.statusText}`);
      return [];
    }
    return await res.json();
  } catch (err) {
    console.error(`[GitHub API] Error listing repos:`, err);
    return [];
  }
}

export async function getWorkflowRuns(owner: string, repo: string, event: string = 'repository_dispatch', limit = 5) {
  const token = process.env.GITHUB_ACCESS_TOKEN;
  if (!token) throw new Error('Missing GITHUB_ACCESS_TOKEN');

  const url = `${GITHUB_API_BASE}/repos/${owner}/${repo}/actions/runs?event=${event}&per_page=${limit}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
    next: { revalidate: 0 }
  });

  if (!res.ok) {
    throw new Error(`Failed to list workflow runs: ${res.status}`);
  }

  return res.json();
}

/**
 * Triggers a repository_dispatch event to start a workflow.
 */
export async function triggerWorkflowDispatch({
  owner,
  repo,
  eventType,
  clientPayload
}: {
  owner: string;
  repo: string;
  eventType: string;
  clientPayload: Record<string, unknown>;
}) {
  const token = process.env.GITHUB_ACCESS_TOKEN;
  if (!token) throw new Error('Missing GITHUB_ACCESS_TOKEN');

  const url = `${GITHUB_API_BASE}/repos/${owner}/${repo}/dispatches`;
  console.log(`[GitHub] triggerWorkflowDispatch: ${url} (event: ${eventType})`);
  console.log(`[GitHub] clientPayload keys: ${Object.keys(clientPayload).join(', ')}`);

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
    body: JSON.stringify({
      event_type: eventType,
      client_payload: clientPayload
    }),
  });

  console.log(`[GitHub] triggerWorkflowDispatch response: ${res.status}`);

  if (!res.ok) {
    const errorBody = await res.text();
    console.error(`[GitHub] dispatch failed: ${errorBody}`);
    throw new Error(`GitHub API Error (${res.status}): ${errorBody}`);
  }

  return true;
}
