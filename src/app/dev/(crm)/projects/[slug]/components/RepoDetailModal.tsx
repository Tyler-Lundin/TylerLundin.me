'use client';

import { useState } from 'react';
import { 
  Github, 
  ExternalLink, 
  GitCommit, 
  GitBranch, 
  Activity, 
  X, 
  Loader2,
  Calendar,
  User,
  Hash
} from 'lucide-react';
import { FullRepoDetails, getFullRepoDetailsAction } from '@/app/dev/actions/repo';
import { motion, AnimatePresence } from 'framer-motion';

type RepoDetailModalProps = {
  repoUrl: string;
  projectName: string;
  children?: React.ReactNode;
};

export default function RepoDetailModal({ repoUrl, projectName, children }: RepoDetailModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState<FullRepoDetails | null>(null);
  const [activeTab, setActiveTab] = useState<'commits' | 'branches' | 'actions'>('commits');

  const handleOpen = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(true);
    setLoading(true);
    const data = await getFullRepoDetailsAction(repoUrl);
    setDetails(data);
    setLoading(false);
  };

  const handleClose = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setIsOpen(false);
  };

  return (
    <>
      {children ? (
        <div onClick={handleOpen} className="cursor-pointer">
          {children}
        </div>
      ) : (
        <button 
          onClick={handleOpen}
          className="text-[10px] font-bold uppercase tracking-wider text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
        >
          View Details
        </button>
      )}

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => handleClose()}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-4xl max-h-[90vh] bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800 flex flex-col"
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/50 dark:bg-neutral-900/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-neutral-900 dark:bg-white rounded-lg">
                    <Github className="size-5 text-white dark:text-neutral-900" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-neutral-900 dark:text-white leading-none">
                      {(details?.info as { name?: string })?.name || projectName}
                    </h2>
                    <p className="text-xs text-neutral-500 mt-1 flex items-center gap-1">
                      {repoUrl} <ExternalLink className="size-3" />
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => handleClose()}
                  className="p-2 text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
                >
                  <X className="size-5" />
                </button>
              </div>

              {/* Tabs */}
              <div className="px-6 border-b border-neutral-100 dark:border-neutral-800 flex items-center gap-6">
                {[
                  { id: 'commits', label: 'Commits', icon: GitCommit },
                  { id: 'branches', label: 'Branches', icon: GitBranch },
                  { id: 'actions', label: 'Actions', icon: Activity },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as 'commits' | 'branches' | 'actions')}
                    className={`flex items-center gap-2 py-4 text-sm font-bold border-b-2 transition-all ${
                      activeTab === tab.id 
                        ? 'text-blue-600 border-blue-600 dark:text-blue-400 dark:border-blue-400' 
                        : 'text-neutral-400 border-transparent hover:text-neutral-600 dark:hover:text-neutral-200'
                    }`}
                  >
                    <tab.icon className="size-4" />
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6 bg-neutral-50/30 dark:bg-neutral-950/30">
                {loading ? (
                  <div className="h-full flex flex-col items-center justify-center py-20">
                    <Loader2 className="size-8 text-blue-500 animate-spin mb-4" />
                    <p className="text-sm font-medium text-neutral-500">Fetching repository data...</p>
                  </div>
                ) : details ? (
                  <div className="space-y-6">
                    {activeTab === 'commits' && (
                      <div className="space-y-3">
                        {details.commits.map((commit) => (
                          <div key={commit.sha} className="group bg-white dark:bg-neutral-900 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm hover:border-blue-500/50 dark:hover:border-blue-500/50 transition-all">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex items-start gap-3">
                                <div className="size-10 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden shrink-0 border border-neutral-200 dark:border-neutral-700">
                                  {commit.author.avatar_url ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={commit.author.avatar_url} alt="" className="size-full object-cover" />
                                  ) : (
                                    <div className="size-full flex items-center justify-center"><User className="size-5 text-neutral-400" /></div>
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <h4 className="text-sm font-bold text-neutral-900 dark:text-white line-clamp-1">{commit.message}</h4>
                                  <div className="flex items-center gap-3 mt-1 text-xs text-neutral-500">
                                    <span className="font-semibold text-neutral-700 dark:text-neutral-300">{commit.author.name}</span>
                                    <span>•</span>
                                    <span className="flex items-center gap-1"><Calendar className="size-3" /> {new Date(commit.date).toLocaleDateString()}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex flex-col items-end gap-2">
                                <span className="text-[10px] font-mono bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded text-neutral-500 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors flex items-center gap-1">
                                  <Hash className="size-2.5" /> {commit.sha}
                                </span>
                                <a 
                                  href={commit.url} 
                                  target="_blank" 
                                  rel="noreferrer"
                                  className="text-[10px] font-bold text-neutral-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors flex items-center gap-0.5"
                                >
                                  View Commit <ExternalLink className="size-2.5" />
                                </a>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {activeTab === 'branches' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {details.branches.map((branch) => (
                          <div key={branch.name} className="bg-white dark:bg-neutral-900 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 flex items-center justify-between shadow-sm">
                            <div className="flex items-center gap-3">
                              <GitBranch className="size-4 text-blue-500" />
                              <div>
                                <h4 className="text-sm font-bold text-neutral-900 dark:text-white">{branch.name}</h4>
                                {branch.protected && (
                                  <span className="text-[10px] font-black uppercase text-amber-500 tracking-wider">Protected</span>
                                )}
                              </div>
                            </div>
                            <span className="text-[10px] font-mono text-neutral-400 bg-neutral-50 dark:bg-neutral-800 px-2 py-1 rounded">
                              {branch.commit.sha.substring(0, 7)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {activeTab === 'actions' && (
                      <div className="space-y-3">
                        {details.workflows?.workflow_runs?.length && details.workflows.workflow_runs.length > 0 ? (
                          details.workflows.workflow_runs.map((run) => (
                            <div key={run.id} className="bg-white dark:bg-neutral-900 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className={`size-3 rounded-full ${
                                  run.conclusion === 'success' ? 'bg-emerald-500' : 
                                  run.conclusion === 'failure' ? 'bg-red-500' : 'bg-amber-500 animate-pulse'
                                } shadow-lg shadow-current/20`} />
                                <div>
                                  <h4 className="text-sm font-bold text-neutral-900 dark:text-white">{run.name || run.display_title}</h4>
                                  <div className="flex items-center gap-3 mt-1 text-[10px] text-neutral-500 font-medium uppercase tracking-wider">
                                    <span>#{run.run_number}</span>
                                    <span>•</span>
                                    <span>{run.status}</span>
                                    <span>•</span>
                                    <span>{new Date(run.created_at).toLocaleDateString()}</span>
                                  </div>
                                </div>
                              </div>
                              <a 
                                href={run.html_url} 
                                target="_blank" 
                                rel="noreferrer"
                                className="p-2 text-neutral-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                              >
                                <ExternalLink className="size-4" />
                              </a>
                            </div>
                          ))
                        ) : (
                          <div className="py-20 text-center">
                            <Activity className="size-12 text-neutral-200 dark:text-neutral-800 mx-auto mb-4" />
                            <p className="text-sm font-medium text-neutral-500">No recent workflow runs found.</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-20 text-center">
                    <p className="text-sm font-medium text-red-500">Failed to load repository details.</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-neutral-50 dark:bg-neutral-900/50 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                <div className="flex items-center gap-6 text-xs font-bold text-neutral-400">
                   <div className="flex items-center gap-1.5">
                     <GitCommit className="size-3.5" />
                     {details?.commits?.length || 0} Commits
                   </div>
                   <div className="flex items-center gap-1.5">
                     <GitBranch className="size-3.5" />
                     {details?.branches?.length || 0} Branches
                   </div>
                </div>
                <a 
                  href={repoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 px-4 py-2 rounded-xl text-xs font-bold hover:opacity-90 transition-all flex items-center gap-2"
                >
                  <Github className="size-3.5" />
                  GitHub Repository
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
