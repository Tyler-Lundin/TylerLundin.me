'use server';

import { 
  getLatestCommits, 
  getBranches, 
  getRepoInfo, 
  getWorkflowRuns,
  parseGitHubUrl,
  GitHubCommit
} from '@/lib/github';

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
