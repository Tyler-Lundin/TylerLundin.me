'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { chatForTaskDraft, TaskChatResponse } from '@/app/dev/actions/task-chat';
import { createAiTaskAction, runAiTaskAction, stopAiTaskAction, getProjectAiTasksAction, syncTaskStatusAction } from '@/app/dev/actions/ai-tasks';
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
  ChevronUp
} from 'lucide-react';

export default function ProjectTasks({ projectId, tasks: initialTasks, repoUrl }: { projectId: string; tasks: AiTask[]; repoUrl?: string | null }) {
  const router = useRouter();
  const [tasks, setTasks] = useState<AiTask[]>(initialTasks);
  const [showWizard, setShowWizard] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

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
    } catch (e: any) {
      console.error('Failed to run task:', e);
      // Status update might have happened in the catch block of the action too
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'failed' } : t));
      alert(e.message || 'Failed to launch task. Ensure a GitHub Repository link is added to this project.');
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
            className="p-1.5 text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
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

function TaskWizard({ projectId, onClose, onCreated, onUpdate }: { projectId: string; onClose: () => void; onCreated: (t: AiTask) => void; onUpdate: (t: AiTask) => void }) {
  const [mode, setMode] = useState<'library' | 'chat'>('library');
  const [selectedTemplate, setSelectedTemplate] = useState<AiTaskTemplate | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Chat State
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isChatting, setIsChatting] = useState(false);
  const [proposedTask, setProposedTask] = useState<TaskChatResponse['proposedTask'] | null>(null);

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
        // inputs: ... would pass inputs here if we collected them
      });

      if (task) {
        onCreated(task);
        // Automatically try to run it
        try {
          const updatedTask = await runAiTaskAction(task.id);
          if (updatedTask) {
            // Update with latest state from server (includes logs/running status)
            onUpdate(updatedTask);
          }
        } catch (e) {
          console.warn('Task created but failed to run automatically', e);
          // It stays 'queued', user can run manually
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
        // inputs: proposedTask.inputs
      });

      if (task) {
        onCreated(task);
        // Automatically try to run it
        try {
          const updatedTask = await runAiTaskAction(task.id);
          if (updatedTask) {
            onUpdate(updatedTask);
          }
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
    setInputValue('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsChatting(true);

    try {
      const { message, proposedTask } = await chatForTaskDraft(messages, userMsg);
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
    >
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-2xl bg-white dark:bg-neutral-900 rounded-xl shadow-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800 flex flex-col max-h-[85vh]"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 dark:border-neutral-800 shrink-0">
          <div className="flex gap-4">
            <button 
              onClick={() => setMode('library')} 
              className={`text-sm font-semibold pb-1 border-b-2 transition-colors ${mode === 'library' ? 'text-neutral-900 dark:text-white border-blue-500' : 'text-neutral-500 border-transparent hover:text-neutral-700 dark:hover:text-neutral-300'}`}
            >
              Task Library
            </button>
            <button 
              onClick={() => setMode('chat')} 
              className={`text-sm font-semibold pb-1 border-b-2 transition-colors ${mode === 'chat' ? 'text-neutral-900 dark:text-white border-blue-500' : 'text-neutral-500 border-transparent hover:text-neutral-700 dark:hover:text-neutral-300'}`}
            >
              Draft with AI
            </button>
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-900 dark:hover:text-white">
            <XCircle className="size-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {mode === 'library' ? (
            !selectedTemplate ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {aiTaskTemplates.map(template => (
                  <button
                    key={template.id}
                    onClick={() => setSelectedTemplate(template)}
                    className="flex flex-col text-left p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-neutral-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                        {template.title}
                      </span>
                      <span className="text-[10px] uppercase font-bold text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded">
                        {template.category}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed mb-3">
                      {template.description}
                    </p>
                    <div className="flex items-center gap-2 mt-auto text-xs text-neutral-400">
                      <Clock className="size-3" />
                      <span>~{template.estimatedDuration}</span>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                <button 
                  onClick={() => setSelectedTemplate(null)}
                  className="text-xs font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-white flex items-center gap-1"
                >
                  <ArrowLeft className="size-3" /> Back to Library
                </button>

                <div>
                  <h4 className="text-xl font-bold dark:text-white mb-1">{selectedTemplate.title}</h4>
                  <p className="text-sm text-neutral-500">{selectedTemplate.description}</p>
                </div>

                {selectedTemplate.inputsSchema && selectedTemplate.inputsSchema.length > 0 && (
                  <div className="space-y-4 bg-neutral-50 dark:bg-neutral-800/50 p-4 rounded-lg border border-neutral-100 dark:border-neutral-800">
                    <h5 className="text-xs font-bold uppercase text-neutral-500 tracking-wider">Configuration</h5>
                    {selectedTemplate.inputsSchema.map(input => (
                      <div key={input.key}>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                          {input.label}
                        </label>
                        {input.type === 'select' ? (
                          <select className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white">
                            {input.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                          </select>
                        ) : (
                          <input 
                            type="text" 
                            placeholder={input.placeholder}
                            defaultValue={String(input.defaultValue || '')}
                            className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
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
                    className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-500 disabled:opacity-50 transition-colors"
                  >
                    {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <Play className="size-4" />}
                    Launch Task
                  </button>
                </div>
              </div>
            )
          ) : (
            // Chat Mode
            <div className="flex flex-col h-full">
              <div className="flex-1 space-y-4 overflow-y-auto mb-4 min-h-[300px]">
                {messages.length === 0 && (
                  <div className="text-center text-neutral-500 mt-10">
                    <Bot className="size-8 mx-auto mb-3 text-blue-500/50" />
                    <p className="text-sm">Describe what you want to build or change.</p>
                    <p className="text-xs mt-1">e.g., "Scaffold a new API route for user profile updates"</p>
                  </div>
                )}
                {messages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-xl px-4 py-2.5 text-sm ${
                      m.role === 'user' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200'
                    }`}>
                      {m.content}
                    </div>
                  </div>
                ))}
                {isChatting && (
                  <div className="flex justify-start">
                    <div className="bg-neutral-100 dark:bg-neutral-800 rounded-xl px-4 py-2.5">
                      <Loader2 className="size-4 animate-spin text-neutral-400" />
                    </div>
                  </div>
                )}
              </div>

              {proposedTask && (
                <div className="mb-4 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl animate-in fade-in slide-in-from-bottom-2">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-semibold text-emerald-900 dark:text-emerald-100 flex items-center gap-2">
                      <Sparkles className="size-4 text-emerald-500" />
                      Task Proposal
                    </div>
                    <span className="text-xs bg-emerald-100 dark:bg-emerald-800 text-emerald-700 dark:text-emerald-200 px-2 py-0.5 rounded-full">
                      ~{proposedTask.estimatedDuration}
                    </span>
                  </div>
                  <h4 className="font-bold text-neutral-900 dark:text-white text-sm mb-1">{proposedTask.title}</h4>
                  <p className="text-xs text-neutral-600 dark:text-neutral-300 mb-3">{proposedTask.description}</p>
                  <div className="flex gap-2">
                    <button 
                      onClick={handleCreateCustom}
                      disabled={isSubmitting}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? <Loader2 className="size-3 animate-spin" /> : <Play className="size-3" />}
                      Confirm & Launch
                    </button>
                    <button 
                      onClick={() => setProposedTask(null)}
                      className="px-3 py-2 text-xs font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              )}

              <div className="relative">
                <input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                  placeholder="Type your instructions..."
                  className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl pl-4 pr-12 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-white"
                  autoFocus
                />
                <button 
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isChatting}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors"
                >
                  <Send className="size-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
