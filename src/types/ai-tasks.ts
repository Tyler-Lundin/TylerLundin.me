export type AiTaskStatus = 'queued' | 'running' | 'review' | 'success' | 'failed';

export interface AiTaskTemplate {
  id: string;
  title: string;
  description: string;
  category: 'maintenance' | 'feature' | 'security' | 'testing' | 'refactor' | 'custom';
  estimatedDuration: string; // e.g. "2m"
  inputsSchema?: Array<{
    key: string;
    label: string;
    type: 'text' | 'select' | 'boolean';
    options?: string[];
    placeholder?: string;
    defaultValue?: string | boolean;
  }>;
  systemPrompt?: string; // The base prompt for the agent
}

export interface AiTask {
  id: string;
  project_id: string;
  template_id?: string; // If created from a template
  title: string;
  description?: string | null;
  status: AiTaskStatus;
  inputs?: any;
  branch_name?: string;
  pr_url?: string;
  run_id?: string;
  logs?: string[]; // Simplified log stream
  created_at: string;
  updated_at: string;
  created_by: string;
}
