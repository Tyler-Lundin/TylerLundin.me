export type ChatMessage = { role: 'user' | 'assistant' | 'system'; content: string }

export interface WizardState {
  step: number
  mode?: 'express' | 'advanced'
  topic: string
  goals: string
  audience: string
  keywords: string[]
  suggestions: { title: string; angle?: string; key_points?: string[] }[]
  messages: ChatMessage[]
  edit_messages?: ChatMessage[]
  draft: {
    title?: string
    excerpt?: string
    tags?: string[]
    content_md?: string
    reading_time_minutes?: number
  }
  cover_image_url?: string
}
