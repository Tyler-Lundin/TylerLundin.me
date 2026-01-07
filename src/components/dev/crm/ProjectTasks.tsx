'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { chatForTaskDraft, TaskChatResponse } from '@/app/dev/actions/task-chat';
import { createAiTaskAction, runAiTaskAction, stopAiTaskAction, getProjectAiTasksAction, syncTaskStatusAction } from '@/app/dev/actions/ai-tasks';
import { getRepoTree, FileNode, getDocContent, getDirectoryContent } from '@/app/dev/actions/repo-explorer';
import RepoExplorer from './RepoExplorer';
import { aiTaskTemplates } from '@/config/ai-task-templates';
import { AiTask, AiTaskTemplate } from '@/types/ai-tasks';
import { 
  Bot, 
  Play, 
  Square,
  RefreshCw,
  GitPullRequest, 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  Clock, 
  Plus,
  Sparkles,
  ArrowLeft,
  Send,
  Terminal,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  FileText,
  Folder,
  X
} from 'lucide-react';

export default function ProjectTasks({ projectId, tasks: initialTasks, repoUrl }: { projectId: string; tasks: AiTask[]; repoUrl?: string | null }) {
  const router = useRouter();
  const [tasks, setTasks] = useState<AiTask[]>(initialTasks);
  const [showWizard, setShowWizard] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const handleOpenWizard = () => setShowWizard(true);
    window.addEventListener('open-ai-task-wizard', handleOpenWizard);
    return () => window.removeEventListener('open-ai-task-wizard', handleOpenWizard);
  }, []);

  const handleTaskCreated = (newTask: AiTask) => {
    setTasks(prev => [newTask, ...prev]);
  };

  // Poll for updates on running tasks
  useEffect(() => {
    const runningTasks = tasks.filter(t => t.status === 'running');
    if (runningTasks.length === 0) return;

    const interval = setInterval(async () => {
      // Sync each running task
      await Promise.all(runningTasks.map(async (task) => {
        try {
          const updated = await syncTaskStatusAction(task.id);
          if (updated) {
            setTasks(prev => prev.map(t => t.id === updated.id ? updated : t));
            // If task finished, refresh the server components to show new commits
            if (updated.status === 'success' || updated.status === 'failed') {
              router.refresh();
            }
          }
        } catch (e) {
          console.error('Failed to sync task status', e);
        }
      }));
    }, 5000); // Poll every 5s

    return () => clearInterval(interval);
  }, [tasks, router]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const updatedTasks = await getProjectAiTasksAction(projectId);
      setTasks(updatedTasks);
    } catch (e) {
      console.error('Failed to refresh tasks:', e);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleRunTask = async (taskId: string) => {
    try {
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'running' } : t));
      const updatedTask = await runAiTaskAction(taskId);
      if (updatedTask) {
        setTasks(prev => prev.map(t => t.id === taskId ? updatedTask : t));
      }
    } catch (e) {
      console.error('Failed to run task:', e);
      // Status update might have happened in the catch block of the action too
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'failed' } : t));
      const message = e instanceof Error ? e.message : 'Failed to launch task. Ensure a GitHub Repository link is added to this project.';
      alert(message);
    }
  };

  const handleStopTask = async (taskId: string) => {
    try {
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'failed' } : t));
      const updatedTask = await stopAiTaskAction(taskId);
      if (updatedTask) {
        setTasks(prev => prev.map(t => t.id === taskId ? updatedTask : t));
      }
    } catch (e) {
      console.error('Failed to stop task:', e);
      alert('Failed to stop task.');
    }
  };

  const handleTaskUpdate = (updatedTask: AiTask) => {
    setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
  };

  return (
    <section className="rounded-xl border border-neutral-200 bg-white overflow-hidden shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
      <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between dark:border-neutral-800/50">
        <div className="flex items-center gap-2">
           <Bot className="size-4 text-neutral-400" />
           <h2 className="font-semibold text-neutral-900 dark:text-white">AI Tasks</h2>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-1.5 text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors disabled:opacity-50"
            title="Refresh Tasks"
          >
            <RefreshCw className={`size-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
          <button 
            onClick={() => setShowWizard(true)}
            className="flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-blue-500"
          >
            <Plus className="size-3" />
            New Task
          </button>
        </div>
      </div>

      <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
        {tasks.length === 0 ? (
          <div className="p-8 text-center">
            <Bot className="size-8 mx-auto text-neutral-200 dark:text-neutral-700 mb-2" />
            <p className="text-sm text-neutral-500">No active AI tasks.</p>
            <p className="text-xs text-neutral-400 mt-1">Launch a coding agent to handle work for you.</p>
          </div>
        ) : (
          tasks.map(task => (
            <TaskRow 
              key={task.id} 
              task={task} 
              repoUrl={repoUrl}
              onRun={() => handleRunTask(task.id)} 
              onStop={() => handleStopTask(task.id)}
            />
          ))
        )}
      </div>

      <AnimatePresence>
        {showWizard && (
          <TaskWizard 
            projectId={projectId} 
            repoUrl={repoUrl}
            onClose={() => setShowWizard(false)} 
            onCreated={handleTaskCreated}
            onUpdate={handleTaskUpdate}
          />
        )}
      </AnimatePresence>
    </section>
  );
}

function StatusIcon({ status }: { status: AiTask['status'] }) {
  switch (status) {
    case 'queued': return <Clock className="size-4 text-neutral-400" />;
    case 'running': return <Loader2 className="size-4 text-blue-500 animate-spin" />;
    case 'review': return <div className="size-2 rounded-full bg-amber-500" />;
    case 'success': return <CheckCircle2 className="size-4 text-emerald-500" />;
    case 'failed': return <XCircle className="size-4 text-red-500" />;
    default: return <div className="size-2 rounded-full bg-neutral-300" />;
  }
}

function TaskRow({ task, repoUrl, onRun, onStop }: { task: AiTask; repoUrl?: string | null; onRun: () => void; onStop: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const logsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (expanded && logsContainerRef.current) {
      logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight;
    }
  }, [task.logs, expanded]);

  return (
    <div className="group transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <StatusIcon status={task.status} />
          <div>
            <div className="font-medium text-sm text-neutral-900 dark:text-white">{task.title}</div>
            <div className="text-xs text-neutral-500 flex items-center gap-2">
              <span>{task.id.substring(0, 8)}</span>
              {task.branch_name && (
                <span className="flex items-center gap-1">
                  <GitPullRequest className="size-3" />
                  {task.branch_name}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {task.status === 'queued' && (
            <button 
              onClick={onRun}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg"
              title="Run Task"
            >
              <Play className="size-4" />
            </button>
          )}
          {task.status === 'running' && (
            <button 
              onClick={onStop}
              className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg transition-colors"
              title="Stop Task"
            >
              <Square className="size-4 fill-current" />
            </button>
          )}
          {(task.status === 'success' || task.status === 'failed' || task.status === 'review') && (
            <button 
              onClick={onRun}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg"
              title="Rerun Task"
            >
              <RefreshCw className="size-4" />
            </button>
          )}
          
          <button 
            onClick={() => setExpanded(!expanded)}
            className="p-1.5 text-neutral-400 hover:text-neutral-900 dark:hover:white transition-colors"
          >
            {expanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-neutral-100 dark:border-neutral-800"
          >
            <div className="p-4 bg-neutral-50/50 dark:bg-neutral-900/50">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 flex items-center gap-2">
                  <Terminal className="size-3" /> Logs
                </h4>
                {repoUrl && (
                  <a 
                    href={`${repoUrl}/actions`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-xs text-blue-600 hover:underline dark:text-blue-400 flex items-center gap-1"
                  >
                    View Live on GitHub <ExternalLink className="size-3" />
                  </a>
                )}
              </div>
              
              <div 
                ref={logsContainerRef}
                className="font-mono text-xs p-3 rounded-lg bg-neutral-900 text-neutral-300 overflow-auto max-h-[300px]"
              >
                {task.logs && task.logs.length > 0 ? (
                  task.logs.map((log, i) => (
                    <div key={i} className="mb-0.5 last:mb-0 border-b border-neutral-800/50 last:border-0 pb-0.5 last:pb-0">
                      {log}
                    </div>
                  ))
                ) : (
                  <div className="text-neutral-600 italic">No logs available. Check GitHub Actions for details.</div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function useAutosizeTextArea(textAreaRef: HTMLTextAreaElement | null, value: string) {
  useEffect(() => {
    if (textAreaRef) {
      textAreaRef.style.height = '0px';
      const scrollHeight = textAreaRef.scrollHeight;
      textAreaRef.style.height = Math.min(scrollHeight, 160) + 'px';
    }
  }, [textAreaRef, value]);
}

function TaskWizard({ projectId, repoUrl, onClose, onCreated, onUpdate }: { projectId: string; repoUrl?: string | null; onClose: () => void; onCreated: (t: AiTask) => void; onUpdate: (t: AiTask) => void }) {
  const [mode, setMode] = useState<'library' | 'chat'>('library');
  const [selectedTemplate, setSelectedTemplate] = useState<AiTaskTemplate | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Chat State
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isChatting, setIsChatting] = useState(false);
  const [proposedTask, setProposedTask] = useState<TaskChatResponse['proposedTask'] | null>(null);
  
  // Context & File Explorer State
  const [contextFiles, setContextFiles] = useState<{ name: string; path: string; content: string }[]>([]);
  const [docsList, setDocsList] = useState<FileNode[]>([]);
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [cursorPosition, setCursorPosition] = useState<number>(0);
  const [showDocsMobile, setShowDocsMobile] = useState(false);
  
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useAutosizeTextArea(inputRef.current, inputValue);

  // Keyboard Shortcuts for Tabs
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement || 
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement).isContentEditable
      ) {
        return;
      }

      if (e.key === '1') {
        setMode('library');
      } else if (e.key === '2') {
        setMode('chat');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Auto-scroll chat
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isChatting]);

  // Load flattened docs list for @ mentions
  useEffect(() => {
    async function loadDocs() {
      try {
        const tree = await getRepoTree(repoUrl);
        const flatten = (nodes: FileNode[]): FileNode[] => {
          return nodes.reduce((acc, node) => {
            acc.push(node); // Include both files and directories
            if (node.children) acc.push(...flatten(node.children));
            return acc;
          }, [] as FileNode[]);
        };
        setDocsList(flatten(tree));
      } catch (e) {
        console.error(e);
      }
    }
    loadDocs();
  }, [repoUrl]);

  // Filter docs based on mention query
  const filteredDocs = useMemo(() => {
    if (mentionQuery === null) return [];
    const q = mentionQuery.toLowerCase();
    const results = docsList
      .filter(doc => doc.name.toLowerCase().includes(q))
      .sort((a, b) => {
          // Prioritize files over directories? Or just by modified/name?
          // Let's sort directories first, then files? Or mix.
          // Let's stick to lastModified if available, else name
          const timeA = a.lastModified || 0;
          const timeB = b.lastModified || 0;
          if (timeA !== timeB) return timeB - timeA;
          return a.name.localeCompare(b.name);
      })
      .slice(0, 10); // Increase limit slightly
    return results;
  }, [mentionQuery, docsList]);

  // Reset selection when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredDocs]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setInputValue(val);
    const pos = e.target.selectionStart || 0;
    setCursorPosition(pos);

    const lastAt = val.lastIndexOf('@', pos - 1);
    if (lastAt !== -1) {
      const query = val.slice(lastAt + 1, pos);
      if (!query.includes(' ') && !query.includes('\n')) {
        setMentionQuery(query);
      } else {
        setMentionQuery(null);
      }
    } else {
      setMentionQuery(null);
    }
  };

  const handleSelectMention = async (doc: FileNode) => {
    try {
      if (doc.type === 'file') {
        if (!contextFiles.find(f => f.path === doc.path)) {
            const content = await getDocContent(doc.path, repoUrl);
            if (content) {
            setContextFiles(prev => [...prev, { name: doc.name, path: doc.path, content }]);
            }
        }
      } else {
          // Directory
          const files = await getDirectoryContent(doc.path, repoUrl);
          if (files.length > 0) {
              setContextFiles(prev => {
                  const newFiles = files.filter(f => !prev.find(p => p.path === f.path));
                  return [...prev, ...files.map(f => ({ name: f.path.split('/').pop() || '', path: f.path, content: f.content }))];
              });
          }
      }
    } catch (e) {
      console.error('Failed to fetch doc content', e);
    }

    if (mentionQuery !== null && inputRef.current) {
      const before = inputValue.substring(0, inputValue.lastIndexOf('@', cursorPosition - 1));
      const after = inputValue.substring(cursorPosition);
      const newValue = `${before}@${doc.name} ${after}`;
      setInputValue(newValue);
      setMentionQuery(null);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (mentionQuery !== null && filteredDocs.length > 0) {
      if (e.key === 'Tab') {
        e.preventDefault();
        if (e.shiftKey) {
            setSelectedIndex(prev => (prev - 1 + filteredDocs.length) % filteredDocs.length);
        } else {
            setSelectedIndex(prev => (prev + 1) % filteredDocs.length);
        }
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleSelectMention(filteredDocs[selectedIndex]);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredDocs.length) % filteredDocs.length);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % filteredDocs.length);
      }
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const handleAddContext = (files: { name: string; path: string; content: string }[]) => {
    setContextFiles(prev => {
        const newFiles = files.filter(f => !prev.find(p => p.path === f.path));
        return [...prev, ...newFiles];
    });
  };

  const removeContextFile = (path: string) => {
    setContextFiles(prev => prev.filter(f => f.path !== path));
  };

  // Handle standard template launch
  const handleCreateFromTemplate = async () => {
    if (!selectedTemplate) return;
    setIsSubmitting(true);
    
    try {
      const task = await createAiTaskAction({
        project_id: projectId,
        title: selectedTemplate.title,
        description: selectedTemplate.description,
        template_id: selectedTemplate.id,
      });

      if (task) {
        onCreated(task);
        try {
          const updatedTask = await runAiTaskAction(task.id);
          if (updatedTask) onUpdate(updatedTask);
        } catch (e) {
          console.warn('Task created but failed to run automatically', e);
        }
        onClose();
      }
    } catch (e) {
      console.error('Failed to create task', e);
      alert('Failed to create task');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle custom task launch from chat
  const handleCreateCustom = async () => {
    if (!proposedTask) return;
    setIsSubmitting(true);

    try {
      const task = await createAiTaskAction({
        project_id: projectId,
        title: proposedTask.title,
        description: proposedTask.description,
      });

      if (task) {
        onCreated(task);
        try {
          const updatedTask = await runAiTaskAction(task.id);
          if (updatedTask) onUpdate(updatedTask);
        } catch (e) {
          console.warn('Task created but failed to run automatically', e);
        }
        onClose();
      }
    } catch (e) {
      console.error('Failed to create custom task', e);
      alert('Failed to create task');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    const userMsg = inputValue.trim();
    
    let fullMessage = userMsg;
    if (contextFiles.length > 0) {
      fullMessage += '\n\n---\nAdditional Context:\n';
      contextFiles.forEach(f => {
        fullMessage += `\nFile: ${f.name}\n\`\`\`\n${f.content}\n\`\`\`\n`;
      });
    }

    setInputValue('');
    setContextFiles([]);
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsChatting(true);

    try {
      const { message, proposedTask } = await chatForTaskDraft(messages, fullMessage);
      setMessages(prev => [...prev, { role: 'assistant', content: message }]);
      if (proposedTask) {
        setProposedTask(proposedTask);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsChatting(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[1000] flex items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-md"
    >
      <motion.div 
        initial={{ scale: 0.98, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.98, opacity: 0, y: 10 }}
        className={`w-full h-full sm:h-[85vh] bg-white dark:bg-neutral-900 sm:rounded-2xl shadow-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800 flex flex-col transition-all duration-500 ease-in-out ${
          mode === 'chat' ? 'max-w-7xl' : 'max-w-2xl h-auto sm:max-h-[90vh]'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 dark:border-neutral-800 shrink-0 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl z-20">
          <div className="flex items-center gap-6">
            <div className="flex gap-4">
              <button 
                onClick={() => setMode('library')} 
                className={`text-sm font-bold pb-1 border-b-2 transition-all flex items-center gap-2 ${mode === 'library' ? 'text-neutral-900 dark:text-white border-blue-500' : 'text-neutral-400 border-transparent hover:text-neutral-600 dark:hover:text-neutral-200'}`}
              >
                Task Library
                <span className="text-[10px] px-1 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-400 font-black">1</span>
              </button>
              <button 
                onClick={() => setMode('chat')} 
                className={`text-sm font-bold pb-1 border-b-2 transition-all flex items-center gap-2 ${mode === 'chat' ? 'text-neutral-900 dark:text-white border-blue-500' : 'text-neutral-400 border-transparent hover:text-neutral-600 dark:hover:text-neutral-200'}`}
              >
                Draft with AI
                <span className="text-[10px] px-1 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-400 font-black">2</span>
              </button>
            </div>
          </div>
          <div className="flex items-center gap-3">
             {mode === 'chat' && (
               <button 
                 onClick={() => setShowDocsMobile(!showDocsMobile)}
                 className="lg:hidden p-2 text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
               >
                 <FileText className="size-5" />
               </button>
             )}
            <button onClick={onClose} className="p-1 text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors">
              <XCircle className="size-6" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden flex relative">
          {mode === 'library' ? (
            <div className="flex-1 overflow-y-auto p-8 bg-neutral-50/30 dark:bg-neutral-950/30">
              {!selectedTemplate ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {aiTaskTemplates.map(template => (
                    <button
                      key={template.id}
                      onClick={() => setSelectedTemplate(template)}
                      className="flex flex-col text-left p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/5 transition-all group relative overflow-hidden"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-bold text-neutral-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                          {template.title}
                        </span>
                        <span className="text-[10px] uppercase font-black tracking-widest text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded-md">
                          {template.category}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed mb-4">
                        {template.description}
                      </p>
                      <div className="flex items-center gap-2 mt-auto text-xs font-medium text-neutral-400">
                        <Clock className="size-3.5" />
                        <span>~{template.estimatedDuration}</span>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="max-w-xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <button 
                    onClick={() => setSelectedTemplate(null)}
                    className="text-xs font-bold text-neutral-400 hover:text-neutral-900 dark:hover:text-white flex items-center gap-2 transition-colors"
                  >
                    <ArrowLeft className="size-3.5" /> BACK TO LIBRARY
                  </button>

                  <div>
                    <h4 className="text-3xl font-black dark:text-white mb-2 tracking-tight">{selectedTemplate.title}</h4>
                    <p className="text-base text-neutral-500 dark:text-neutral-400 leading-relaxed">{selectedTemplate.description}</p>
                  </div>

                  {selectedTemplate.inputsSchema && selectedTemplate.inputsSchema.length > 0 && (
                    <div className="space-y-6 bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
                      <h5 className="text-[10px] font-black uppercase text-neutral-400 tracking-[0.2em]">Configuration</h5>
                      {selectedTemplate.inputsSchema.map(input => (
                        <div key={input.key}>
                          <label className="block text-sm font-bold text-neutral-700 dark:text-neutral-300 mb-2">
                            {input.label}
                          </label>
                          {input.type === 'select' ? (
                            <select className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm font-medium outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white transition-all">
                              {input.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                          ) : (
                            <input 
                              type="text" 
                              placeholder={input.placeholder}
                              defaultValue={String(input.defaultValue || '')}
                              className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm font-medium outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white transition-all"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex justify-end pt-4">
                    <button
                      onClick={handleCreateFromTemplate}
                      disabled={isSubmitting}
                      className="flex items-center gap-3 bg-blue-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-blue-500 disabled:opacity-50 transition-all shadow-xl shadow-blue-500/20 active:scale-95"
                    >
                      {isSubmitting ? <Loader2 className="size-5 animate-spin" /> : <Play className="size-5 fill-current" />}
                      Launch Task
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            // Premium Split Layout for Chat Mode
            <div className="flex w-full h-full lg:flex-row flex-col overflow-hidden">
              {/* Chat Column (1/2) */}
              <div className="lg:flex-1 flex flex-col min-w-0 bg-white dark:bg-neutral-900 relative z-10 h-full">
                <div 
                  ref={scrollRef}
                  className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth min-h-0"
                >
                  {messages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-center px-8 py-20">
                      <div className="size-16 rounded-3xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mb-6 border border-blue-100 dark:border-blue-800">
                        <Bot className="size-8 text-blue-600 dark:text-blue-400" />
                      </div>
                      <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">How can I help you today?</h3>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto leading-relaxed">
                        Describe a feature, fix, or refactor. Use <span className="font-mono bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded text-blue-600 dark:text-blue-400 font-bold">@</span> to pull context from your documentation.
                      </p>
                    </div>
                  )}
                  {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                      <div className={`max-w-[85%] rounded-2xl px-5 py-3.5 text-sm leading-relaxed shadow-sm ${
                        m.role === 'user' 
                          ? 'bg-blue-600 text-white font-medium' 
                          : 'bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200'
                      }`}>
                        <div className={`prose prose-sm max-w-none ${m.role === 'user' ? 'prose-invert text-white' : 'dark:prose-invert'}`}>
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {m.content}
                          </ReactMarkdown>
                        </div>
                      </div>
                    </div>
                  ))}
                  {isChatting && (
                    <div className="flex justify-start animate-pulse">
                      <div className="bg-neutral-100 dark:bg-neutral-800 rounded-2xl px-5 py-3.5">
                        <div className="flex gap-1">
                          <div className="size-1.5 rounded-full bg-neutral-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                          <div className="size-1.5 rounded-full bg-neutral-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                          <div className="size-1.5 rounded-full bg-neutral-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </div>
                  )}
                  {proposedTask && (
                    <div className="p-5 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200/50 dark:border-emerald-800/50 rounded-2xl animate-in zoom-in-95 duration-300 shadow-lg shadow-emerald-500/5">
                      <div className="flex items-center justify-between mb-4">
                        <div className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-2 text-xs tracking-wider uppercase">
                          <Sparkles className="size-4" />
                          Generated Proposal
                        </div>
                        <span className="text-[10px] font-black bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 px-2 py-1 rounded-md">
                          {proposedTask.estimatedDuration}
                        </span>
                      </div>
                      <h4 className="font-bold text-neutral-900 dark:text-white text-base mb-2 tracking-tight">{proposedTask.title}</h4>
                      <div className="prose prose-sm dark:prose-invert max-w-none text-neutral-600 dark:text-neutral-400 mb-5 leading-relaxed">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {proposedTask.description}
                        </ReactMarkdown>
                      </div>
                      <div className="flex gap-3">
                        <button 
                          onClick={handleCreateCustom}
                          disabled={isSubmitting}
                          className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 active:scale-[0.98]"
                        >
                          {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <Play className="size-4 fill-current" />}
                          Confirm & Launch
                        </button>
                        <button 
                          onClick={() => setProposedTask(null)}
                          className="px-4 py-3 text-xs font-bold text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Fixed Input Area */}
                <div className="p-4 border-t border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 shrink-0 relative">
                  {/* Context Files */}
                  {contextFiles.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {contextFiles.map(f => (
                        <div key={f.path} className="flex items-center gap-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 px-2.5 py-1.5 rounded-lg text-[10px] font-bold border border-blue-100 dark:border-blue-800 group animate-in slide-in-from-left-2">
                           <FileText className="size-3.5" />
                           <span className="truncate max-w-[120px]">{f.name}</span>
                           <button onClick={() => removeContextFile(f.path)} className="hover:text-blue-800 dark:hover:text-white transition-colors"><X className="size-3.5" /></button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Mention Popup */}
                  <AnimatePresence>
                    {mentionQuery !== null && filteredDocs.length > 0 && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute bottom-full left-4 right-4 mb-4 bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-700 overflow-hidden z-30"
                      >
                         <div className="text-[10px] font-black uppercase text-neutral-400 bg-neutral-50 dark:bg-neutral-900 px-4 py-2.5 border-b border-neutral-100 dark:border-neutral-700 tracking-widest flex justify-between">
                           <span>Reference Context</span>
                           <span className="text-[9px] opacity-70">TAB to navigate • ENTER to select</span>
                         </div>
                         <div className="max-h-60 overflow-y-auto">
                           {filteredDocs.map((doc, index) => (
                             <button
                               key={doc.path}
                               onClick={() => handleSelectMention(doc)}
                               className={`w-full text-left px-4 py-3 text-sm flex items-center justify-between group transition-colors ${
                                 index === selectedIndex 
                                   ? 'bg-blue-50 dark:bg-blue-900/30' 
                                   : 'hover:bg-neutral-50 dark:hover:bg-neutral-800'
                               }`}
                             >
                               <div className="flex items-center gap-3">
                                 {doc.type === 'directory' ? (
                                    <Folder className={`size-4 ${index === selectedIndex ? 'text-blue-500' : 'text-amber-400'}`} />
                                 ) : (
                                    <FileText className={`size-4 ${index === selectedIndex ? 'text-blue-500' : 'text-neutral-400'}`} />
                                 )}
                                 <span className={`font-bold ${index === selectedIndex ? 'text-blue-700 dark:text-blue-300' : 'text-neutral-700 dark:text-neutral-200'}`}>
                                   {doc.name}
                                 </span>
                               </div>
                               <span className="text-[10px] font-medium text-neutral-400 italic truncate max-w-[100px] ml-2">
                                 {doc.path}
                               </span>
                             </button>
                           ))}
                         </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="relative flex items-end gap-2 bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-2 focus-within:ring-4 focus-within:ring-blue-500/10 focus-within:border-blue-500 transition-all">
                    <textarea
                      ref={inputRef}
                      value={inputValue}
                      onChange={handleInputChange}
                      onKeyDown={handleInputKeyDown}
                      placeholder="Type your instructions... (@ for context)"
                      className="flex-1 bg-transparent border-0 px-3 py-2 text-sm focus:outline-none focus:ring-0 dark:text-white resize-none min-h-[44px] max-h-[160px]"
                      rows={1}
                    />
                    <button 
                      onClick={handleSendMessage}
                      disabled={!inputValue.trim() || isChatting}
                      className="p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/20 active:scale-90 mb-0.5"
                    >
                      <Send className="size-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Docs Column (1/2) */}
              <div className={`lg:flex-1 h-full min-w-0 lg:relative absolute inset-0 bg-white dark:bg-neutral-900 z-20 transition-transform duration-300 lg:translate-x-0 ${showDocsMobile ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}`}>
                 <div className="lg:hidden absolute top-4 left-4 z-30">
                    <button 
                      onClick={() => setShowDocsMobile(false)}
                      className="p-2 bg-neutral-100 dark:bg-neutral-800 rounded-full"
                    >
                      <ArrowLeft className="size-5" />
                    </button>
                 </div>
                <RepoExplorer onAddContext={handleAddContext} repoUrl={repoUrl} />
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
