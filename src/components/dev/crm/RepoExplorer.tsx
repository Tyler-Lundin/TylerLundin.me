'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Folder, 
  FolderOpen, 
  FileText, 
  ChevronRight, 
  ChevronDown, 
  ArrowLeft,
  Loader2,
  Plus,
  MoreVertical,
  FilePlus,
  FolderPlus
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { FileNode, getRepoTree, getDocContent, getDirectoryContent } from '@/app/dev/actions/repo-explorer';

type RepoExplorerProps = {
  onAddContext: (files: { name: string; path: string; content: string }[]) => void;
  repoUrl?: string | null;
  className?: string;
};

type ContextMenuState = {
  x: number;
  y: number;
  node: FileNode;
} | null;

export default function RepoExplorer({ onAddContext, repoUrl, className = '' }: RepoExplorerProps) {
  const [tree, setTree] = useState<FileNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'tree' | 'content'>('tree');
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [loadingContent, setLoadingContent] = useState(false);
  const [contextMenu, setContextMenu] = useState<ContextMenuState>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadTree();
    
    const handleClickOutside = () => setContextMenu(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, [repoUrl]);

  const loadTree = async () => {
    setLoading(true);
    try {
      const data = await getRepoTree(repoUrl);
      setTree(data);
    } catch (e) {
      console.error('Failed to load repo tree', e);
    } finally {
      setLoading(false);
    }
  };

  const handleFileClick = async (node: FileNode) => {
    setSelectedFile(node);
    setView('content');
    setLoadingContent(true);
    try {
      const content = await getDocContent(node.path, repoUrl);
      setFileContent(content || '');
    } catch (e) {
      console.error('Failed to load file content', e);
      setFileContent('Error loading content.');
    } finally {
      setLoadingContent(false);
    }
  };

  const handleContextMenu = (e: React.MouseEvent, node: FileNode) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Calculate position - ensure it doesn't go off screen
    // Simple implementation for now
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX;
    const y = e.clientY;

    setContextMenu({ x, y, node });
  };

  const handleAddFileToContext = async (node: FileNode) => {
    setContextMenu(null);
    try {
      const content = await getDocContent(node.path, repoUrl);
      if (content) {
        onAddContext([{ name: node.name, path: node.path, content }]);
      }
    } catch (e) {
      console.error('Failed to add file to context', e);
    }
  };

  const handleAddDirectoryToContext = async (node: FileNode) => {
    setContextMenu(null);
    try {
      // Show some loading state? For now relying on async
      const files = await getDirectoryContent(node.path, repoUrl);
      if (files.length > 0) {
        onAddContext(files.map(f => ({ name: f.path.split('/').pop() || '', path: f.path, content: f.content })));
      }
    } catch (e) {
      console.error('Failed to add directory to context', e);
    }
  };

  const handleAddToChatCurrent = () => {
    if (selectedFile && fileContent) {
      onAddContext([{ name: selectedFile.name, path: selectedFile.path, content: fileContent }]);
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-full text-neutral-400 ${className}`}>
        <Loader2 className="size-6 animate-spin" />
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`relative flex flex-col h-full overflow-hidden bg-neutral-50/50 dark:bg-neutral-900/50 border-l border-neutral-200 dark:border-neutral-800 min-w-0 ${className}`}>
      {view === 'tree' ? (
        <div className="flex-1 overflow-y-auto p-4 min-h-0">
          <h3 className="font-semibold text-xs uppercase tracking-wider text-neutral-500 mb-4 px-2">
            Files
          </h3>
          <FileTree 
            nodes={tree} 
            onFileClick={handleFileClick} 
            onContextMenu={handleContextMenu}
          />
        </div>
      ) : (
        <div className="flex flex-col h-full min-w-0">
          <div className="flex items-center justify-between p-3 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shrink-0">
            <button 
              onClick={() => setView('tree')}
              className="flex items-center gap-1 text-xs font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="size-3" /> Back
            </button>
            <div className="flex items-center gap-2">
               <span className="text-xs font-semibold text-neutral-900 dark:text-white truncate max-w-[150px]">
                 {selectedFile?.name}
               </span>
               <button
                 onClick={handleAddToChatCurrent}
                 className="flex items-center gap-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-1 rounded text-[10px] font-bold uppercase hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
               >
                 <Plus className="size-3" /> Context
               </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 bg-white dark:bg-neutral-900 overflow-x-hidden min-h-0">
             {loadingContent ? (
               <div className="flex justify-center py-10">
                 <Loader2 className="size-5 animate-spin text-neutral-400" />
               </div>
             ) : (
               <div className="prose prose-sm dark:prose-invert max-w-none overflow-x-auto">
                 {/* Only render markdown for md files, otherwise code block */}
                 {selectedFile?.name.endsWith('.md') ? (
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {fileContent}
                    </ReactMarkdown>
                 ) : (
                    <pre className="text-xs font-mono whitespace-pre-wrap break-all">
                        {fileContent}
                    </pre>
                 )}
               </div>
             )}
          </div>
        </div>
      )}

      {/* Context Menu */}
      {contextMenu && (
        <div 
          className="fixed z-50 bg-white dark:bg-neutral-800 rounded-lg shadow-xl border border-neutral-200 dark:border-neutral-700 py-1 min-w-[160px] animate-in fade-in zoom-in-95 duration-100"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={(e) => e.stopPropagation()}
        >
            <div className="px-3 py-1.5 border-b border-neutral-100 dark:border-neutral-700 mb-1">
                <p className="text-xs font-semibold text-neutral-900 dark:text-white truncate max-w-[140px]">{contextMenu.node.name}</p>
            </div>
            
            {contextMenu.node.type === 'file' ? (
                <button 
                    onClick={() => handleAddFileToContext(contextMenu.node)}
                    className="w-full text-left px-3 py-2 text-xs font-medium text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 flex items-center gap-2"
                >
                    <FilePlus className="size-3.5" /> Add to Context
                </button>
            ) : (
                <button 
                    onClick={() => handleAddDirectoryToContext(contextMenu.node)}
                    className="w-full text-left px-3 py-2 text-xs font-medium text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 flex items-center gap-2"
                >
                    <FolderPlus className="size-3.5" /> Add Folder to Context
                </button>
            )}
        </div>
      )}
    </div>
  );
}

function FileTree({ 
  nodes, 
  onFileClick, 
  onContextMenu,
  depth = 0 
}: { 
  nodes: FileNode[], 
  onFileClick: (n: FileNode) => void, 
  onContextMenu: (e: React.MouseEvent, n: FileNode) => void,
  depth?: number 
}) {
  return (
    <ul className="space-y-0.5">
      {nodes.map((node) => (
        <FileTreeNode 
          key={node.path} 
          node={node} 
          onFileClick={onFileClick} 
          onContextMenu={onContextMenu}
          depth={depth} 
        />
      ))}
    </ul>
  );
}

function FileTreeNode({ 
  node, 
  onFileClick, 
  onContextMenu,
  depth 
}: { 
  node: FileNode, 
  onFileClick: (n: FileNode) => void, 
  onContextMenu: (e: React.MouseEvent, n: FileNode) => void,
  depth: number 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const isDir = node.type === 'directory';

  return (
    <li>
      <div 
        className="relative group"
        onContextMenu={(e) => onContextMenu(e, node)}
      >
        <button
            onClick={() => isDir ? setIsOpen(!isOpen) : onFileClick(node)}
            className={`w-full flex items-center gap-1.5 px-2 py-1.5 rounded-md text-sm text-left transition-colors
            ${isDir ? 'font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800' : 'text-neutral-600 dark:text-neutral-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20'}
            `}
            style={{ paddingLeft: `${depth * 12 + 8}px` }}
        >
            {isDir ? (
            <>
                {isOpen ? <ChevronDown className="size-3.5 text-neutral-400" /> : <ChevronRight className="size-3.5 text-neutral-400" />}
                {isOpen ? <FolderOpen className="size-4 text-amber-400" /> : <Folder className="size-4 text-amber-400" />}
            </>
            ) : (
            <FileText className="size-4 text-neutral-400" />
            )}
            <span className="truncate">{node.name}</span>
        </button>
      </div>
      
      {isDir && isOpen && node.children && (
        <FileTree 
            nodes={node.children} 
            onFileClick={onFileClick} 
            onContextMenu={onContextMenu}
            depth={depth + 1} 
        />
      )}
    </li>
  );
}