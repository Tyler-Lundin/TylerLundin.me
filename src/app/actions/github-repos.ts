'use server';

import { createServiceClient } from '@/lib/supabase/server';
import { listUserRepositories, GitHubRepo } from '@/lib/github';

export interface EnrichedRepo extends GitHubRepo {
  existingProject?: {
    id: string;
    title: string;
    slug: string;
  };
}

export async function getImportableReposAction(): Promise<EnrichedRepo[]> {
  // 1. Fetch Repos from GitHub
  const repos = await listUserRepositories(100);
  if (!repos.length) return [];

  // 2. Fetch existing project links from DB
  const sb = await createServiceClient();
  const { data: links } = await sb
    .from('crm_project_links')
    .select('url, project:crm_projects(id, title, slug)')
    .eq('type', 'repo');

  // 3. Map links for O(1) lookup
  // Normalize URLs (trim trailing slash, ignore case) to ensure matching
  const linkedMap = new Map<string, { id: string; title: string; slug: string }>();
  
  links?.forEach((link: any) => {
    if (link.url && link.project) {
      const normalized = link.url.trim().toLowerCase().replace(/\/$/, '');
      linkedMap.set(normalized, link.project);
    }
  });

  // 4. Enrich repos
  return repos.map((repo) => {
    const normalizedRepoUrl = repo.html_url.trim().toLowerCase().replace(/\/$/, '');
    const existing = linkedMap.get(normalizedRepoUrl);
    
    return {
      ...repo,
      existingProject: existing,
    };
  });
}
