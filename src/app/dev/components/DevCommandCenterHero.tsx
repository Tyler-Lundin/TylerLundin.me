"use client"

import { useEffect, useMemo, useState, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { useActiveProject } from '@/components/dev/ActiveProjectContext'

// --- Types ---

export type ActionId =
  | "new_project"
  | "add_task"
  | "open_repo"
  | "deploy_preview"
  | "view_logs"
  | "notes"
  | "client_email"

export type DevCommandCenterHeroProps = {
  onAction?: (action: ActionId, ctx: { projectId: string }) => void
  className?: string
  initialProjects?: {
    id: string
    name: string
    client: string
    branch: string
    env: 'preview' | 'prod' | 'dev'
    deploy: 'ready' | 'running' | 'failed'
    tasksDue: number
    lastActivity: string
  }[]
}

const ACTIVE_PROJECT_STORAGE_KEY = "dev.activeProject"

type ProjectMeta = {
  id: string
  name: string
  client: string
  branch: string
  env: "preview" | "prod" | "dev"
  deploy: "ready" | "running" | "failed"
  tasksDue: number
  lastActivity: string
}

// --- Helper: Time Ago ---
function timeAgo(dateStr: string | null) {
  if (!dateStr) return '—'
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

// --- Icons (Inline SVGs for portability) ---
const Icons = {
  Search: () => <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
  Cmd: () => <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>,
  Git: () => <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>,
  Zap: () => <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
  Alert: () => <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>,
  Check: () => <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>,
  ChevronDown: () => <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>,
  Plus: () => <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>,
}

// --- Components ---

import { CrmProject } from "@/types/crm"

// ... existing ProjectMeta definition ...

// ... existing timeAgo ...

export default function DevCommandCenterHero({ onAction, className, initialProjects }: DevCommandCenterHeroProps) {
  const [projects, setProjects] = useState<ProjectMeta[]>([])
  // Context-driven active project with local fallback
  const activeCtx = useActiveProject()
  const [localActiveProjectId, setLocalActiveProjectId] = useState<string>("")
  const [query, setQuery] = useState("")
  const [isProjectMenuOpen, setIsProjectMenuOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const menuRef = useRef<HTMLDivElement>(null)

  // Initial from server (if provided)
  useEffect(() => {
    if (initialProjects && initialProjects.length > 0) {
      setProjects(initialProjects)
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Ensure an active selection once projects are available
  useEffect(() => {
    if (!projects || projects.length === 0) return
    const current = activeCtx?.activeProjectId || localActiveProjectId
    if (!current) {
      const fallback = projects[0].id
      activeCtx?.setActiveProjectId?.(fallback)
      setLocalActiveProjectId(fallback)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projects])

  // Data Fetching (client refresh if no server data)
  useEffect(() => {
    if (initialProjects && initialProjects.length > 0) return
    async function fetchProjects() {
      const sb = createClient()
      
      // 1. Fetch Projects & Clients
      const { data: rawProjects } = await sb
        .from('crm_projects')
        .select('*, client:crm_clients(name)')
        .order('created_at', { ascending: false })
      
      if (!rawProjects) {
        setLoading(false)
        return
      }

      // 2. Fetch Open Tasks (Aggregation)
      const { data: rawLists } = await sb
        .from('crm_project_lists')
        .select('id, project_id')
      
      const { data: rawOpenItems } = await sb
        .from('crm_project_list_items')
        .select('list_id')
        .neq('status', 'done')

      // Count map: project_id -> count
      const tasksCountByProject = new Map<string, number>()
      
      if (rawLists && rawOpenItems) {
         const listProjectMap = new Map<string, string>() // list_id -> project_id
         rawLists.forEach(l => listProjectMap.set(l.id, l.project_id))
         
         rawOpenItems.forEach(item => {
            const pid = listProjectMap.get(item.list_id)
            if (pid) {
              tasksCountByProject.set(pid, (tasksCountByProject.get(pid) || 0) + 1)
            }
         })
      }

      // 3. Transform
      const mapped: ProjectMeta[] = (rawProjects as (CrmProject & { client: { name: string } })[]).map((p) => ({
        id: p.id,
        name: p.title,
        client: p.client?.name || 'Unknown',
        branch: 'main', 
        env: 'prod',   
        deploy: p.status === 'in_progress' ? 'running' : 'ready', 
        tasksDue: tasksCountByProject.get(p.id) || 0,
        lastActivity: timeAgo(p.created_at),
      }))

      setProjects(mapped)
      
      // Handle initial active project selection
      const selectedId = activeCtx?.activeProjectId || (typeof window !== 'undefined' ? window.localStorage.getItem(ACTIVE_PROJECT_STORAGE_KEY) : null) || ''
      if (selectedId && mapped.find(p => p.id === selectedId)) {
        activeCtx?.setActiveProjectId(selectedId)
        setLocalActiveProjectId(selectedId)
      } else if (mapped.length > 0) {
        activeCtx?.setActiveProjectId?.(mapped[0].id)
        setLocalActiveProjectId(mapped[0].id)
      }
      
      setLoading(false)
    }

    fetchProjects()
  }, [initialProjects])

  // Sync context -> local fallback and localStorage (for older code)
  useEffect(() => {
    const id = activeCtx?.activeProjectId
    if (id) {
      setLocalActiveProjectId(id)
      try { window.localStorage.setItem(ACTIVE_PROJECT_STORAGE_KEY, id) } catch {}
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCtx?.activeProjectId])

  // Derived state
  const activeProjectId = activeCtx?.activeProjectId || localActiveProjectId
  const activeProject = useMemo(() => 
    projects.find(p => p.id === activeProjectId) || projects[0] || null
  , [projects, activeProjectId])

  // Click outside to close menu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsProjectMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const actions = useMemo(() => {
    if (!activeProject) return []
    return [
      { id: "new_project" as const, label: "New Project", desc: "Create workspace", icon: <Icons.Plus />, shortcut: "N" },
      { id: "add_task" as const, label: "Add Task", desc: "To Active Project", icon: <Icons.Zap />, shortcut: "T" },
      { id: "open_repo" as const, label: "Open Repo", desc: activeProject.branch, icon: <Icons.Git />, shortcut: "R" },
      { id: "deploy_preview" as const, label: "Deploy", desc: `To ${activeProject.env}`, icon: <Icons.Cmd />, shortcut: "D" },
      // Conditional action example
      ...(activeProject.deploy === "failed" ? [{ id: "view_logs" as const, label: "View Logs", desc: "Build failed", icon: <Icons.Alert />, shortcut: "L", urgent: true }] : []),
    ]
  }, [activeProject])

  const filteredActions = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return actions
    return actions.filter((a) => `${a.label} ${a.desc}`.toLowerCase().includes(q))
  }, [actions, query])

  const handleAction = (id: ActionId) => {
    if (onAction && activeProjectId) onAction(id, { projectId: activeProjectId })
    else console.log("Action Triggered:", id, { projectId: activeProjectId })
    setQuery("") // Clear search on action
  }

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (["input", "textarea"].includes(target.tagName.toLowerCase())) return

      if (e.key === "/") {
        e.preventDefault()
        document.getElementById("cc-search")?.focus()
        return
      }

      // Action shortcuts
      const matched = actions.find(a => a.shortcut.toLowerCase() === e.key.toLowerCase())
      if (matched) {
        e.preventDefault()
        handleAction(matched.id)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [actions])

  if (loading) {
    return (
      <section className={`relative h-64 overflow-hidden rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-950 ${className || ""}`}>
        <div className="flex h-full items-center justify-center text-sm text-neutral-400">Loading Command Center...</div>
      </section>
    )
  }

  if (!activeProject) {
    return (
      <section className={`relative overflow-hidden rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-950 ${className || ""}`}>
         <div className="text-center">
            <h3 className="font-semibold text-neutral-900 dark:text-white">No Active Projects</h3>
            <p className="mt-1 text-sm text-neutral-500">Create a project in Supabase to get started.</p>
         </div>
      </section>
    )
  }

  return (
    <section
      className={[
        "relative overflow-hidden rounded-2xl border shadow-lg transition-all",
        "border-neutral-200 bg-white text-neutral-900",
        "dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100",
        className || "",
      ].join(" ")}
    >
      {/* Decorative top sheen */}
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-80" />

      {/* --- Top Bar: Search & Global Context --- */}
      <div className="relative border-b border-neutral-100 dark:border-neutral-800">
        <div className="flex items-center px-4 py-3 sm:px-6">
          <div className="mr-3 text-neutral-400">
            <Icons.Search />
          </div>
          <input
            id="cc-search"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command... (Press / to focus)"
            className="h-full w-full bg-transparent text-sm font-medium placeholder-neutral-400 focus:outline-none dark:placeholder-neutral-600"
            autoComplete="off"
          />
          <div className="hidden items-center gap-2 text-[10px] font-medium text-neutral-400 sm:flex">
             <span className="rounded bg-neutral-100 px-1.5 py-0.5 dark:bg-neutral-800">ESC</span> to cancel
          </div>
        </div>
      </div>

      <div className="flex flex-col md:grid md:grid-cols-12 md:divide-x dark:divide-neutral-800">
        
        {/* --- Left Column: Active Project & Context (Width: 5/12) --- */}
        <div className="bg-neutral-50/50 p-4 dark:bg-neutral-900/20 md:col-span-5 md:p-6">
          <label className="mb-3 block text-xs font-semibold uppercase tracking-wider text-neutral-500">
            Active Workspace
          </label>

          {/* Custom Dropdown Trigger */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setIsProjectMenuOpen(!isProjectMenuOpen)}
              className="flex w-full items-center justify-between rounded-xl border border-neutral-200 bg-white p-3 shadow-sm transition hover:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-900 dark:hover:border-neutral-600"
            >
              <div className="flex items-center gap-3">
                <div className={`flex size-10 items-center justify-center rounded-lg bg-gradient-to-br font-bold text-white shadow-inner
                  ${activeProject.deploy === 'failed' ? 'from-rose-500 to-rose-600' : 'from-neutral-800 to-neutral-950 dark:from-neutral-700 dark:to-neutral-800'}`}>
                  {activeProject.name.substring(0, 2).toUpperCase()}
                </div>
                <div className="text-left">
                  <div className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{activeProject.name}</div>
                  <div className="text-xs text-neutral-500">{activeProject.client}</div>
                </div>
              </div>
              <div className="text-neutral-400"><Icons.ChevronDown /></div>
            </button>

            {/* Custom Dropdown Menu */}
            {isProjectMenuOpen && (
              <div className="absolute left-0 right-0 top-full z-20 mt-2 flex flex-col gap-1 rounded-xl border border-neutral-200 bg-white p-1 shadow-xl dark:border-neutral-700 dark:bg-neutral-900">
                {projects.map(p => (
                  <button
                    key={p.id}
                    onClick={() => { activeCtx?.setActiveProjectId?.(p.id); setLocalActiveProjectId(p.id); setIsProjectMenuOpen(false) }}
                    className={`flex items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition
                      ${activeProjectId === p.id 
                        ? 'bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-white' 
                        : 'text-neutral-600 hover:bg-neutral-50 dark:text-neutral-400 dark:hover:bg-neutral-800'}`}
                  >
                    <span>{p.name}</span>
                    <span className={`h-2 w-2 rounded-full ${
                      p.deploy === 'ready' ? 'bg-emerald-500' : p.deploy === 'running' ? 'bg-amber-500' : 'bg-rose-500'
                    }`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Project Health / Stats */}
          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-neutral-200 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-900">
              <div className="text-[10px] text-neutral-500">Tasks Due</div>
              <div className="mt-1 flex items-baseline gap-1">
                <span className={`text-xl font-bold ${activeProject.tasksDue > 0 ? 'text-neutral-900 dark:text-white' : 'text-neutral-400'}`}>
                  {activeProject.tasksDue}
                </span>
                <span className="text-xs text-neutral-400">items</span>
              </div>
            </div>
            
            <div className="rounded-lg border border-neutral-200 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-900">
              <div className="text-[10px] text-neutral-500">Last Deploy</div>
              <div className="mt-1 flex items-center gap-2">
                <div className={`flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium border
                  ${activeProject.deploy === 'ready' ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/30 dark:bg-emerald-900/20 dark:text-emerald-400' : 
                    activeProject.deploy === 'running' ? 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/30 dark:bg-amber-900/20 dark:text-amber-400 animate-pulse' : 
                    'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/30 dark:bg-rose-900/20 dark:text-rose-400'
                  }`}>
                  {activeProject.deploy === 'ready' && <Icons.Check />}
                  <span className="capitalize">{activeProject.deploy}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between text-xs text-neutral-400">
             <span>Branch: <span className="font-mono text-neutral-600 dark:text-neutral-300">{activeProject.branch}</span></span>
             <span>Last Activity: {activeProject.lastActivity}</span>
          </div>
        </div>

        {/* --- Right Column: Action Grid (Width: 7/12) --- */}
        <div className="p-4 md:col-span-7 md:p-6">
          <div className="mb-3 flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
              Actions
            </label>
            <span className="text-[10px] text-neutral-400">
              {filteredActions.length} available
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
             {filteredActions.length === 0 && (
                 <div className="col-span-full py-8 text-center text-sm text-neutral-400">
                   No commands match "{query}"
                 </div>
             )}
             {filteredActions.map((action) => (
               <button
                 key={action.id}
                 onClick={() => handleAction(action.id)}
                 className={`group relative flex flex-col justify-between rounded-xl border p-3 text-left transition-all hover:-translate-y-0.5 hover:shadow-md
                 ${action.urgent 
                    ? 'border-rose-200 bg-rose-50 hover:border-rose-300 dark:border-rose-900/30 dark:bg-rose-900/10' 
                    : 'border-neutral-200 bg-white hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900/50 dark:hover:border-neutral-700'
                 }`}
               >
                 <div className="flex items-start justify-between">
                   <div className={`mb-3 flex size-8 items-center justify-center rounded-lg border shadow-sm
                     ${action.urgent 
                        ? 'border-rose-200 bg-white text-rose-600 dark:border-rose-800 dark:bg-rose-900 dark:text-rose-200' 
                        : 'border-neutral-100 bg-white text-neutral-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300'
                     }`}>
                     {action.icon}
                   </div>
                   <span className="hidden rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] font-bold text-neutral-400 opacity-0 transition-opacity group-hover:opacity-100 dark:bg-neutral-800 sm:inline-block">
                     {action.shortcut}
                   </span>
                 </div>
                 <div>
                   <div className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm">{action.label}</div>
                   <div className="truncate text-xs text-neutral-500">{action.desc}</div>
                 </div>
               </button>
             ))}
          </div>
        </div>
      </div>

      {/* --- Footer Status Bar --- */}
      <div className="flex items-center justify-between border-t border-neutral-100 bg-neutral-50 px-4 py-2 text-[10px] text-neutral-500 dark:border-neutral-800 dark:bg-neutral-950/50">
         <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
               <span className="size-2 rounded-full bg-emerald-500 animate-pulse"></span>
               Systems Operational
            </span>
            <span className="hidden sm:inline text-neutral-300 dark:text-neutral-700">|</span>
            <span className="hidden sm:inline">Database: Connected</span>
         </div>
         <div className="font-mono opacity-50">v2.4.0</div>
      </div>

    </section>
  )
}
