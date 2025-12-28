export type CrmProjectStatus = 'planned' | 'in_progress' | 'paused' | 'completed' | 'archived'
export type CrmPriority = 'low' | 'normal' | 'high' | 'urgent'
export type CrmLinkType = 'live' | 'staging' | 'repo' | 'docs' | 'design' | 'tracker' | 'other'
export type CrmItemStatus = 'open' | 'in_progress' | 'done'

export interface CrmClient {
  id: string
  name: string
  company?: string | null
  website_url?: string | null
  phone?: string | null
  billing_notes?: string | null
  created_at: string
}

export interface CrmProject {
  id: string
  client_id: string
  slug: string
  title: string
  description?: string | null
  status: CrmProjectStatus
  priority: CrmPriority
  created_at: string
  // In joined selects we often project only a subset (e.g., name)
  client?: { id?: string; name?: string }
}

export interface CrmProjectLink {
  id: string
  project_id: string
  type: CrmLinkType
  url: string
  label?: string | null
  is_client_visible: boolean
  created_at: string
}

export interface CrmProjectList {
  id: string
  project_id: string
  key: 'goals' | 'bugs' | 'tasks' | 'custom'
  title: string
  created_at: string
  items?: CrmProjectListItem[]
}

export interface CrmProjectListItem {
  id: string
  list_id: string
  title: string
  description?: string | null
  status: CrmItemStatus
  priority: CrmPriority
  due_at?: string | null
  is_client_visible: boolean
  created_at: string
}

export interface CrmProjectMessage {
  id: string
  project_id: string
  author_role: 'admin' | 'client'
  author_name: string
  text: string
  attachments?: any // Could be typed further if needed
  created_at: string
}

export interface CrmProjectDocument {
  id: string
  project_id: string
  kind: 'contract' | 'sow' | 'nda' | 'other'
  title: string
  status: 'signed' | 'pending' | 'draft'
  url?: string | null
  created_at: string
}

export interface Invoice {
  id: string
  project_id: string
  number: string
  status: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible' | 'overdue'
  amount_cents: number
  currency: string
  due_at?: string | null
  created_at: string
}
