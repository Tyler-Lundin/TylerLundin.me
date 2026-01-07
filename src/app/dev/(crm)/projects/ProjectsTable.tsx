"use client"

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Folder, Calendar, Trash2, Edit } from 'lucide-react'
import { CrmProject } from '@/types/crm'
import { slugify } from '@/lib/utils'
import { deleteProjectAction } from '@/app/dev/actions/crm'

function StatusBadge({ value }: { value: string }) {
  const styles: Record<string, string> = {
    planned:    'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700',
    in_progress: 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    paused:     'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    completed:  'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    archived:   'bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-500 border-neutral-200 dark:border-neutral-700',
  }
  const style = styles[value] || styles.planned

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border capitalize ${style}`}>
      {value.replace('_', ' ')}
    </span>
  )
}

function PriorityPill({ value }: { value: string }) {
  const styles: Record<string, string> = {
    low:    'text-neutral-500',
    normal: 'text-neutral-700 dark:text-neutral-300',
    high:   'text-amber-600 dark:text-amber-400 font-medium',
    urgent: 'text-rose-600 dark:text-rose-400 font-bold',
  }
  const style = styles[value] || styles.normal

  return <span className={`text-xs capitalize ${style}`}>{value}</span>
}

type ProjectsTableProps = {
  initialProjects: CrmProject[]
}

type ContextMenuState = {
  visible: boolean
  x: number
  y: number
  projectId: string | null
}

export default function ProjectsTable({ initialProjects }: ProjectsTableProps) {
  const router = useRouter()
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({ visible: false, x: 0, y: 0, projectId: null })
  const menuRef = useRef<HTMLDivElement>(null)

  const handleRowClick = (slug: string) => {
    router.push(`/dev/projects/${slug}`)
  }

  const handleContextMenu = (e: React.MouseEvent, projectId: string) => {
    e.preventDefault()
    e.stopPropagation()
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      projectId
    })
  }

  const handleDelete = async () => {
    if (!contextMenu.projectId) return
    if (!confirm('Are you sure you want to delete this project?')) return

    const formData = new FormData()
    formData.append('id', contextMenu.projectId)
    await deleteProjectAction(null, formData)
    setContextMenu({ ...contextMenu, visible: false })
  }

  const handleEdit = () => {
    if (!contextMenu.projectId) return
    const project = initialProjects.find(p => p.id === contextMenu.projectId)
    if (project) {
      router.push(`/dev/projects/${project.slug}`)
    }
    setContextMenu({ ...contextMenu, visible: false })
  }

  // Close context menu on click outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setContextMenu({ ...contextMenu, visible: false })
      }
    }
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [contextMenu])

  return (
    <div className="overflow-x-auto relative min-h-[400px]">
      <table className="w-full text-left text-sm">
        <thead className="bg-neutral-50 text-neutral-500 dark:bg-neutral-900 dark:text-neutral-400">
          <tr>
            <th className="px-6 py-3 font-medium">Title</th>
            <th className="px-6 py-3 font-medium">Client</th>
            <th className="px-6 py-3 font-medium">Status</th>
            <th className="px-6 py-3 font-medium">Priority</th>
            <th className="px-6 py-3 font-medium text-right">Created</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
          {initialProjects.map((p) => (
            <tr 
              key={p.id} 
              onClick={() => handleRowClick(p.slug)}
              onContextMenu={(e) => handleContextMenu(e, p.id)}
              className="group cursor-pointer transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
            >
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
                    <Folder className="size-4" />
                  </div>
                  <span className="font-medium text-neutral-900 dark:text-white">
                    {p.title}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4">
                <span className="text-neutral-600 dark:text-neutral-300">
                  {p.client?.name || 'Unknown'}
                </span>
              </td>
              <td className="px-6 py-4">
                <StatusBadge value={p.status} />
              </td>
              <td className="px-6 py-4">
                <PriorityPill value={p.priority} />
              </td>
              <td className="px-6 py-4 text-right text-xs text-neutral-500 tabular-nums">
                <div className="flex items-center justify-end gap-1.5">
                  <Calendar className="h-3 w-3" />
                  {new Date(p.created_at).toLocaleDateString()}
                </div>
              </td>
            </tr>
          ))}
          {initialProjects.length === 0 && (
            <tr>
              <td colSpan={5} className="p-8 text-center text-neutral-500">No projects found.</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Context Menu */}
      {contextMenu.visible && (
        <div 
          ref={menuRef}
          className="fixed z-50 min-w-[160px] overflow-hidden rounded-lg border border-neutral-200 bg-white p-1 shadow-lg dark:border-neutral-800 dark:bg-neutral-900"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          <button 
            onClick={handleEdit}
            className="flex w-full items-center gap-2 rounded px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800"
          >
            <Edit className="size-4" />
            Edit
          </button>
          <button 
            onClick={handleDelete}
            className="flex w-full items-center gap-2 rounded px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-900/20"
          >
            <Trash2 className="size-4" />
            Delete
          </button>
        </div>
      )}
    </div>
  )
}
