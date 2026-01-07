'use server';

import { projectTemplates } from '@/config/templates';
import { createRepoFromTemplate, createEmptyRepo, createFile, parseGitHubUrl } from '@/lib/github';
import { createServiceClient } from '@/lib/supabase/server';
import { slugify } from '@/lib/utils';
import { getAuthUser } from '@/lib/auth';

export interface CreateProjectResult {
  success: boolean;
  repoUrl?: string;
  repoName?: string;
  slug?: string;
  error?: string;
}

const NEXTJS_BOOTSTRAP_WORKFLOW = `name: Bootstrap Next.js
on:
  push:
    paths:
      - .github/workflows/bootstrap.yml

jobs:
  init:
    runs-on: ubuntu-latest
    permissions:
      contents: write
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          token: \${{ secrets.GITHUB_TOKEN }}

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Create Next.js App
        run: |
          # Clean directory (remove README to avoid conflict)
          rm -f README.md
          
          # Run create-next-app in a temporary folder to avoid conflicts with existing .github folder
          npx create-next-app@latest temp-app \\
            --typescript \\
            --tailwind \\
            --eslint \\
            --no-src-dir \\
            --import-alias "@/*" \\
            --app \\
            --use-npm \\
            --yes
            
          # Move files to root (including hidden files)
          # We use rsync for robust moving or just standard mv with shopt
          shopt -s dotglob
          mv temp-app/* .
          shopt -u dotglob
          rmdir temp-app

      - name: Commit and Push
        run: |
          git config --global user.name "github-actions[bot]"
          git config --global user.email "github-actions[bot]@users.noreply.github.com"
          git add .
          git commit -m "Initialize Next.js project via npx"
          git push

      - name: Cleanup Workflow
        if: success()
        run: |
          # Remove this workflow file so it doesn't run again
          git rm .github/workflows/bootstrap.yml
          git commit -m "Cleanup bootstrap workflow"
          git push
`;

export async function createProjectAction(formData: FormData): Promise<CreateProjectResult> {
  const templateId = formData.get('templateId') as string;
  const projectName = formData.get('projectName') as string;
  const description = formData.get('description') as string;
  let clientId = formData.get('clientId') as string;
  const isPersonal = formData.get('isPersonal') === 'true';
  const repoUrlInput = formData.get('repoUrl') as string;

  if (!templateId || !projectName) {
    return { success: false, error: 'Missing templateId or projectName' };
  }

  // Personal Project Logic: Find or create "Personal Projects" client
  if (isPersonal) {
    const user = await getAuthUser();
    
    if (!user || !user.id) {
      return { success: false, error: 'Must be logged in to create a personal project' };
    }
    // Cast user.id to string to ensure type compatibility
    const userId = String(user.id);

    const sbService = await createServiceClient();
    
    // Check for existing "Personal Projects" client for this user
    const { data: existingClientUsers } = await sbService
      .from('crm_client_users')
      .select('client_id, clients:crm_clients(name)')
      .eq('user_id', userId);
      
    const personalClient = existingClientUsers?.find((cu: any) => cu.clients?.name === 'Personal Projects');

    if (personalClient) {
      clientId = personalClient.client_id;
    } else {
      // Create new "Personal Projects" client
      const { data: newClient, error: createError } = await sbService
        .from('crm_clients')
        .insert({ name: 'Personal Projects', company: 'Personal' })
        .select()
        .single();

      if (createError || !newClient) {
        return { success: false, error: 'Failed to create personal client context' };
      }

      // Add user as owner
      await sbService.from('crm_client_users').insert({
        client_id: newClient.id,
        user_id: userId,
        role: 'owner'
      });

      clientId = newClient.id;
    }
  }

  if (!clientId) {
    return { success: false, error: 'Missing clientId (and not a personal project)' };
  }

  const template = projectTemplates.find((t) => t.id === templateId);
  if (!template) {
    return { success: false, error: 'Invalid template ID' };
  }

  try {
    let repoUrl = '';
    let repoName = '';

    if (templateId === 'import-repo') {
       // IMPORT CASE
       if (!repoUrlInput) {
         return { success: false, error: 'Missing repository URL for import' };
       }
       // Validate URL structure
       const parsed = parseGitHubUrl(repoUrlInput);
       if (!parsed) {
         return { success: false, error: 'Invalid GitHub URL' };
       }
       repoUrl = repoUrlInput;
       repoName = `${parsed.owner}/${parsed.repo}`;

    } else if (templateId === 'fresh-nextjs') {
      // SPECIAL CASE: Fresh Next.js App (npx)
      // 1. Create empty repo
      const newRepo = await createEmptyRepo({
        name: projectName,
        description: description || 'Fresh Next.js application',
        private: true,
      });

      // 2. Inject the workflow file
      await createFile({
        owner: newRepo.owner.login,
        repo: newRepo.name,
        path: '.github/workflows/bootstrap.yml',
        content: NEXTJS_BOOTSTRAP_WORKFLOW,
        message: 'Add bootstrap workflow',
      });

      repoUrl = newRepo.html_url;
      repoName = newRepo.full_name;

    } else {
      // STANDARD CASE: Template Clone
      const repoInfo = parseGitHubUrl(template.repoUrl);
      if (!repoInfo) {
        return { success: false, error: 'Invalid template repository URL' };
      }

      const newRepo = await createRepoFromTemplate({
        templateOwner: repoInfo.owner,
        templateRepo: repoInfo.repo,
        name: projectName,
        description: description || template.description,
        private: true,
      });
      
      repoUrl = newRepo.html_url;
      repoName = newRepo.full_name;
    }

    // 3. Create Project Record in DB
    const sb = await createServiceClient();
    const slug = slugify(projectName);

    // Insert project
    const { data: project, error: projectError } = await sb
      .from('crm_projects')
      .insert({
        client_id: clientId,
        slug,
        title: projectName,
        description: description || template.description,
        status: 'planned',
        priority: 'normal',
      })
      .select()
      .single();

    if (projectError) {
      console.error('DB Error creating project:', projectError);
      return { 
        success: true, 
        repoUrl, 
        repoName,
        error: 'Repo created/linked but failed to save to DB. Please add manually.'
      };
    }

    // Insert Repo Link
    if (project) {
      await sb.from('crm_project_links').insert({
        project_id: project.id,
        type: 'repo',
        url: repoUrl,
        label: 'GitHub Repository',
        is_client_visible: true,
      });
    }

    return {
      success: true,
      repoUrl,
      repoName,
      slug,
    };

  } catch (err: unknown) {
    console.error('Failed to create project:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Failed to create repository' };
  }
}
