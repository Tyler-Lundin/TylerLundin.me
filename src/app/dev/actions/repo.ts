'use server';

import { 
  getLatestCommits, 
  getBranches, 
  getRepoInfo, 
  getWorkflowRuns,
  getDeployments,
  getDeploymentStatuses,
  parseGitHubUrl,
  GitHubCommit
} from '@/lib/github';
import { createServiceClient } from '@/lib/supabase/server';

export type WorkflowRun = {
  id: number;
  name: string;
  display_title: string;
  run_number: number;
  status: string;
  conclusion: string | null;
  created_at: string;
  html_url: string;
};

export type FullRepoDetails = {
  info: Record<string, unknown> | null;
  commits: GitHubCommit[];
  branches: { name: string; protected: boolean; commit: { sha: string } }[];
  workflows: { workflow_runs: WorkflowRun[] } | null;
};

export async function getFullRepoDetailsAction(repoUrl: string): Promise<FullRepoDetails | null> {
  const parsed = parseGitHubUrl(repoUrl);
  if (!parsed) return null;

  try {
    const [info, commits, branches, workflows] = await Promise.all([
      getRepoInfo(repoUrl),
      getLatestCommits(repoUrl, 20),
      getBranches(repoUrl),
      getWorkflowRuns(parsed.owner, parsed.repo, 'push', 5).catch(() => null)
    ]);

    return {
      info: (info as Record<string, unknown>) || null,
      commits,
      branches: (branches || []) as FullRepoDetails['branches'],
      workflows: (workflows || null) as FullRepoDetails['workflows']
    };
  } catch (error) {
    console.error('Error fetching full repo details:', error);
    return null;
  }
}

export async function checkAndAttachDeploymentAction(projectId: string, repoUrl: string) {
  const parsed = parseGitHubUrl(repoUrl);
  if (!parsed) return { success: false, error: 'Invalid Repo URL' };

  try {
    const deployments = await getDeployments(parsed.owner, parsed.repo);
    // Find latest production deployment
    // Vercel usually uses environment 'Production' or 'production'
    const prodDeployment = deployments.find((d: any) => 
      d.environment?.toLowerCase() === 'production'
    );

    if (!prodDeployment) return { success: false, message: 'No production deployment found' };

    const statuses = await getDeploymentStatuses(parsed.owner, parsed.repo, prodDeployment.id);
    // Find success status with target_url
    const successStatus = statuses.find((s: any) => s.state === 'success' && s.target_url);

    if (!successStatus) return { success: false, message: 'No successful deployment status found' };

    const targetUrl = successStatus.target_url;
    
    // Check if already exists?
    const sb = await createServiceClient();
    const { data: existing } = await sb
        .from('crm_project_links')
        .select('id')
        .eq('project_id', projectId)
        .eq('type', 'live')
        .maybeSingle();
    
    if (existing) return { success: true, message: 'Deployment already attached' };

    await sb.from('crm_project_links').insert({
        project_id: projectId,
        type: 'live',
        url: targetUrl,
        label: 'Production Deployment',
        is_client_visible: true
    });

    return { success: true, url: targetUrl };

  } catch (e) {
    console.error('Error attaching deployment:', e);
    return { success: false, error: 'Failed to attach deployment' };
  }
}
