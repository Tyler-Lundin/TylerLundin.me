'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Rocket, 
  Code2, 
  Github, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  ArrowLeft,
  Loader2,
  Box,
  Layers,
  Globe,
  Search,
  Lock,
  ExternalLink
} from 'lucide-react';
import { ProjectTemplate } from '@/config/templates';
import { createProjectAction } from '@/app/actions/create-project';
import { getClientsAction } from '@/app/actions/clients';
import { getImportableReposAction, EnrichedRepo } from '@/app/actions/github-repos';
import { CrmClient } from '@/types/crm';

interface ProjectWizardProps {
  templates: ProjectTemplate[];
}

type Step = 'template' | 'config' | 'deploying' | 'success';

export function ProjectWizard({ templates }: ProjectWizardProps) {
  const [step, setStep] = useState<Step>('template');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [isPersonal, setIsPersonal] = useState(false);
  const [clients, setClients] = useState<CrmClient[]>([]);
  const [repoUrlInput, setRepoUrlInput] = useState('');
  
  // Import Flow State
  const [repos, setRepos] = useState<EnrichedRepo[]>([]);
  const [isLoadingRepos, setIsLoadingRepos] = useState(false);
  const [repoSearch, setRepoSearch] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ repoUrl?: string; repoName?: string; slug?: string } | null>(null);

  React.useEffect(() => {
    getClientsAction().then(setClients);
  }, []);

  const selectedTemplate = templates.find(t => t.id === selectedTemplateId);
  const isImport = selectedTemplateId === 'import-repo';

  // Fetch repos when entering import mode
  React.useEffect(() => {
    if (isImport && step === 'config' && repos.length === 0) {
      setIsLoadingRepos(true);
      getImportableReposAction()
        .then(setRepos)
        .catch(console.error)
        .finally(() => setIsLoadingRepos(false));
    }
  }, [isImport, step, repos.length]);

  // Auto-fill project name from Repo URL in import mode
  const handleRepoSelection = (repo: EnrichedRepo) => {
    setRepoUrlInput(repo.html_url);
    if (!projectName) {
      setProjectName(repo.name);
    }
    if (!description && repo.description) {
      setDescription(repo.description);
    }
  };

  const handleRepoUrlChange = (val: string) => {
    setRepoUrlInput(val);
    if (isImport && !projectName) {
      try {
        const url = new URL(val);
        const parts = url.pathname.split('/').filter(Boolean);
        if (parts.length >= 2) {
          setProjectName(parts[1]);
        }
      } catch {
        // ignore invalid urls while typing
      }
    }
  };

  const filteredRepos = repos.filter(r => 
    r.full_name.toLowerCase().includes(repoSearch.toLowerCase())
  );

  async function handleCreate() {
    if (!selectedTemplateId || !projectName) return;
    if (!isPersonal && !selectedClientId) return;
    if (isImport && !repoUrlInput) return;
    
    setIsSubmitting(true);
    setError(null);
    setStep('deploying');

    const formData = new FormData();
    formData.append('templateId', selectedTemplateId);
    formData.append('projectName', projectName);
    formData.append('description', description);
    
    if (isPersonal) {
      formData.append('isPersonal', 'true');
    } else {
      formData.append('clientId', selectedClientId);
    }

    if (isImport) {
      formData.append('repoUrl', repoUrlInput);
    }

    try {
      const res = await createProjectAction(formData);
      if (res.success) {
        setResult({ 
          repoUrl: res.repoUrl, 
          repoName: res.repoName, 
          slug: res.slug 
        });
        setStep('success');
      } else {
        setError(res.error || 'An unknown error occurred');
        setStep('config');
      }
    } catch (err) {
      setError('Failed to reach server');
      setStep('config');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="bg-white dark:bg-zinc-900/50 border border-neutral-200 dark:border-zinc-800 rounded-xl overflow-hidden backdrop-blur-sm shadow-xl dark:shadow-none">
      <AnimatePresence mode="wait">
        {step === 'template' && (
          <motion.div 
            key="template"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="p-8"
          >
            <div className="flex items-center gap-3 mb-6 text-blue-600 dark:text-indigo-400">
              <Box className="w-6 h-6" />
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">Choose a Template</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {templates.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTemplateId(t.id)}
                  className={`flex flex-col text-left p-5 rounded-lg border transition-all ${
                    selectedTemplateId === t.id 
                      ? 'bg-blue-50 dark:bg-indigo-500/10 border-blue-500 dark:border-indigo-500 ring-1 ring-blue-500 dark:ring-indigo-500 shadow-sm' 
                      : 'bg-neutral-50 dark:bg-zinc-800/50 border-neutral-200 dark:border-zinc-700 hover:border-blue-300 dark:hover:border-zinc-500'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`font-bold ${selectedTemplateId === t.id ? 'text-blue-700 dark:text-white' : 'text-neutral-900 dark:text-white'}`}>{t.name}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-200 dark:bg-zinc-700 text-neutral-600 dark:text-gray-300 uppercase tracking-wider font-semibold">
                      {t.framework}
                    </span>
                  </div>
                  <p className="text-sm text-neutral-600 dark:text-gray-400 flex-grow">{t.description}</p>
                  <div className="mt-4 flex gap-2 flex-wrap">
                    {t.tags.map(tag => (
                      <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-white dark:bg-zinc-900 text-neutral-500 dark:text-zinc-400 border border-neutral-200 dark:border-zinc-700">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </button>
              ))}
            </div>

            <div className="flex justify-end">
              <button
                disabled={!selectedTemplateId}
                onClick={() => setStep('config')}
                className="flex items-center gap-2 bg-neutral-900 dark:bg-white text-white dark:text-black px-6 py-2.5 rounded-lg font-semibold hover:bg-neutral-800 dark:hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Continue
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {step === 'config' && (
          <motion.div 
            key="config"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="p-8"
          >
            <button 
              onClick={() => setStep('template')}
              className="flex items-center gap-1.5 text-sm text-neutral-500 dark:text-gray-400 hover:text-neutral-900 dark:hover:text-white mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to templates
            </button>

            <div className="flex items-center gap-3 mb-6 text-blue-600 dark:text-indigo-400">
              <Code2 className="w-6 h-6" />
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">Project Configuration</h2>
            </div>

            <div className="space-y-6 max-w-lg mb-8">
              
              {/* Personal Project Toggle */}
              <div className="flex items-center gap-3 bg-neutral-50 dark:bg-zinc-800/50 p-3 rounded-lg border border-neutral-200 dark:border-zinc-700">
                <input 
                  type="checkbox" 
                  id="isPersonal"
                  checked={isPersonal}
                  onChange={(e) => setIsPersonal(e.target.checked)}
                  className="w-4 h-4 rounded border-neutral-300 dark:border-gray-600 text-blue-600 dark:text-indigo-600 focus:ring-blue-500 dark:focus:ring-indigo-500 bg-white dark:bg-zinc-700"
                />
                <label htmlFor="isPersonal" className="text-sm text-neutral-700 dark:text-gray-200 select-none cursor-pointer">
                  This is a <strong>Personal Project</strong> (no client attached)
                </label>
              </div>

              {/* Client Selector (Hidden if Personal) */}
              {!isPersonal && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <label className="block text-sm font-medium text-neutral-700 dark:text-gray-300 mb-1.5">Client</label>
                  <select
                    value={selectedClientId}
                    onChange={(e) => setSelectedClientId(e.target.value)}
                    className="w-full bg-white dark:bg-zinc-800 border border-neutral-200 dark:border-zinc-700 rounded-lg px-4 py-2 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-indigo-500"
                  >
                    <option value="">Select a client...</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </motion.div>
              )}

              {/* Import Mode: Repo Picker */}
              {isImport && (
                 <div className="bg-neutral-50 dark:bg-zinc-800/30 border border-neutral-200 dark:border-zinc-700 rounded-lg overflow-hidden">
                  <div className="p-3 border-b border-neutral-200 dark:border-zinc-700 flex items-center gap-2 bg-white dark:bg-transparent">
                    <Search className="w-4 h-4 text-neutral-400 dark:text-gray-400" />
                    <input 
                      type="text"
                      placeholder="Search your repositories..."
                      value={repoSearch}
                      onChange={(e) => setRepoSearch(e.target.value)}
                      className="bg-transparent border-none outline-none text-sm text-neutral-900 dark:text-white w-full placeholder-neutral-400 dark:placeholder-gray-500"
                    />
                  </div>
                  <div className="max-h-48 overflow-y-auto p-1 space-y-1">
                    {isLoadingRepos ? (
                      <div className="flex items-center justify-center p-4 text-neutral-400 dark:text-gray-500 gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-xs">Loading repos...</span>
                      </div>
                    ) : filteredRepos.length === 0 ? (
                      <div className="p-4 text-center text-xs text-neutral-400 dark:text-gray-500">No repositories found.</div>
                    ) : (
                      filteredRepos.map(repo => {
                        const isSelected = repoUrlInput === repo.html_url;
                        const isLinked = !!repo.existingProject;
                        
                        return (
                          <button
                            key={repo.id}
                            disabled={isLinked}
                            onClick={() => handleRepoSelection(repo)}
                            className={`w-full flex items-center justify-between p-2 rounded text-left text-sm transition-colors ${
                              isLinked 
                                ? 'opacity-50 cursor-not-allowed bg-neutral-100 dark:bg-zinc-800/50' 
                                : isSelected 
                                  ? 'bg-blue-100 dark:bg-indigo-500/20 text-blue-700 dark:text-indigo-300' 
                                  : 'hover:bg-neutral-200 dark:hover:bg-zinc-700/50 text-neutral-700 dark:text-gray-300'
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              {repo.private ? <Lock className="w-3 h-3 flex-shrink-0 opacity-70" /> : <Globe className="w-3 h-3 flex-shrink-0 opacity-70" />}
                              <span className="truncate">{repo.full_name}</span>
                            </div>
                            {isLinked ? (
                              <span className="flex items-center gap-1 text-[10px] bg-neutral-200 dark:bg-zinc-800 text-neutral-500 dark:text-zinc-400 px-1.5 py-0.5 rounded border border-neutral-300 dark:border-zinc-700">
                                <ExternalLink className="w-3 h-3" />
                                {repo.existingProject?.slug}
                              </span>
                            ) : isSelected && (
                              <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-indigo-500" />
                            )}
                          </button>
                        );
                      })
                    )}
                  </div>
                  {/* Manual fallback */}
                  <div className="p-2 border-t border-neutral-200 dark:border-zinc-700 bg-white dark:bg-transparent">
                    <input 
                      type="url"
                      placeholder="Or paste URL manually..."
                      value={repoUrlInput}
                      onChange={(e) => handleRepoUrlChange(e.target.value)}
                      className="w-full bg-neutral-50 dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-700 rounded px-2 py-1.5 text-xs text-neutral-900 dark:text-white focus:outline-none focus:border-blue-500 dark:focus:border-indigo-500"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-gray-300 mb-1.5">
                  {isImport ? 'Project Name (Internal)' : 'Project Name'}
                </label>
                <input 
                  type="text"
                  placeholder="e.g., my-awesome-saas"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full bg-white dark:bg-zinc-800 border border-neutral-200 dark:border-zinc-700 rounded-lg px-4 py-2 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-indigo-500"
                />
                {!isImport && <p className="text-xs text-neutral-500 dark:text-gray-500 mt-1">This will be the repository name on GitHub.</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-gray-300 mb-1.5">Description (Optional)</label>
                <textarea 
                  rows={3}
                  placeholder="Briefly describe what this project is about..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-white dark:bg-zinc-800 border border-neutral-200 dark:border-zinc-700 rounded-lg px-4 py-2 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-indigo-500"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-400/10 p-4 rounded-lg border border-red-200 dark:border-red-400/20">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p className="text-sm">{error}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <button
                disabled={!projectName || (!isPersonal && !selectedClientId) || (isImport && !repoUrlInput) || isSubmitting}
                onClick={handleCreate}
                className="flex items-center gap-2 bg-blue-600 dark:bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-500 dark:hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-blue-500/20"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {isImport ? 'Importing...' : 'Initializing...'}
                  </>
                ) : (
                  <>
                    <Rocket className="w-5 h-5" />
                    {isImport ? 'Import Project' : 'Spin it up'}
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}

        {step === 'deploying' && (
          <motion.div 
            key="deploying"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-16 flex flex-col items-center text-center"
          >
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full" />
              <div className="relative bg-white dark:bg-zinc-800 p-6 rounded-2xl border border-neutral-200 dark:border-zinc-700 shadow-xl">
                <Loader2 className="w-12 h-12 text-blue-600 dark:text-indigo-500 animate-spin" />
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">Executing Pipeline</h2>
            <p className="text-neutral-500 dark:text-gray-400 max-w-sm">
              We're creating your repository from <strong>{selectedTemplate?.name}</strong> and setting up the initial environment.
            </p>

            <div className="mt-10 w-full max-w-xs space-y-4">
              <div className="flex items-center gap-3 text-sm text-neutral-600 dark:text-gray-300 font-medium">
                <div className="w-2 h-2 rounded-full bg-blue-500 dark:bg-indigo-500 animate-pulse" />
                Creating GitHub Repository
              </div>
              <div className="flex items-center gap-3 text-sm text-neutral-400 dark:text-gray-500">
                <div className="w-2 h-2 rounded-full bg-neutral-200 dark:bg-zinc-700" />
                Pushing initial commit (template)
              </div>
              <div className="flex items-center gap-3 text-sm text-neutral-400 dark:text-gray-500">
                <div className="w-2 h-2 rounded-full bg-neutral-200 dark:bg-zinc-700" />
                Connecting to Vercel (Coming soon)
              </div>
            </div>
          </motion.div>
        )}

        {step === 'success' && (
          <motion.div 
            key="success"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-12 text-center"
          >
            <div className="inline-flex p-4 rounded-full bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-500 mb-6 border border-green-200 dark:border-green-500/20">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            
            <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">Project Ready!</h2>
            <p className="text-neutral-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
              Your new project <strong>{projectName}</strong> has been initialized successfully.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <a 
                href={result?.repoUrl} 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center justify-between p-4 bg-white dark:bg-zinc-800 hover:bg-neutral-50 dark:hover:bg-zinc-750 border border-neutral-200 dark:border-zinc-700 rounded-xl transition-colors group shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <Github className="w-5 h-5 text-neutral-400 dark:text-gray-400 group-hover:text-neutral-900 dark:group-hover:text-white" />
                  <div className="text-left">
                    <div className="text-sm font-semibold text-neutral-900 dark:text-white">GitHub Repo</div>
                    <div className="text-xs text-neutral-500 dark:text-gray-500">{result?.repoName}</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-neutral-300 dark:text-gray-600 group-hover:text-neutral-900 dark:group-hover:text-white" />
              </a>

              <div className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-zinc-800/50 border border-neutral-200 dark:border-zinc-700 rounded-xl grayscale opacity-50 cursor-not-allowed shadow-sm">
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-neutral-400 dark:text-gray-400" />
                  <div className="text-left">
                    <div className="text-sm font-semibold text-neutral-900 dark:text-white">Live Preview</div>
                    <div className="text-xs text-neutral-500 dark:text-gray-500">Deployment pending...</div>
                  </div>
                </div>
              </div>
            </div>

            <button 
              onClick={() => window.location.href = `/dev/projects/${result?.slug}`}
              className="inline-flex items-center gap-2 bg-neutral-900 dark:bg-white text-white dark:text-black px-8 py-3 rounded-lg font-bold hover:bg-neutral-800 dark:hover:bg-gray-200 transition-colors shadow-lg"
            >
              Go to Project Dashboard
              <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}