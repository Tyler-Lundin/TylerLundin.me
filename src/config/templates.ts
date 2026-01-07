
export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  repoUrl: string; // Must be a repository marked as 'Template' on GitHub
  framework: 'nextjs' | 'other';
  tags: string[];
}

export const projectTemplates: ProjectTemplate[] = [
  {
    id: 'nextjs-supabase-saas',
    name: 'Next.js + Supabase SaaS',
    description: 'Full-stack SaaS starter with Auth, Stripe, and Supabase.',
    repoUrl: 'https://github.com/vercel/nextjs-subscription-payments', // Valid template
    framework: 'nextjs',
    tags: ['saas', 'supabase', 'stripe'],
  },
  {
    id: 'nextjs-marketing',
    name: 'Next.js Marketing Site (Placeholder)',
    description: 'Update this with a valid template repository URL.',
    repoUrl: 'https://github.com/vercel/nextjs-subscription-payments', // Fallback to valid template for now
    framework: 'nextjs',
    tags: ['marketing', 'cms', 'seo'],
  },
  {
    id: 'fresh-nextjs', // Special ID caught by the action
    name: 'Fresh Next.js App (npx)',
    description: 'Runs "npx create-next-app@latest" via GitHub Actions. No template required.',
    repoUrl: '', // Not used for this type
    framework: 'nextjs',
    tags: ['starter', 'minimal', 'npx'],
  },
  {
    id: 'import-repo',
    name: 'Import Repository',
    description: 'Import an existing GitHub repository as a project.',
    repoUrl: '', // URL will be provided by user
    framework: 'other',
    tags: ['import', 'existing'],
  },
];
