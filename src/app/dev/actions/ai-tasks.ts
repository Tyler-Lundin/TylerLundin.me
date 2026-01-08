'use server';

import { createClient, createServiceClient } from '@/lib/supabase/server';
import { getAuthUser } from '@/lib/auth';
import { AiTask } from '@/types/ai-tasks';
import { triggerWorkflowDispatch, parseGitHubUrl, createFile, getWorkflowRuns } from '@/lib/github';

const AI_AGENT_SCRIPT_CONTENT = `
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const TASK_TITLE = process.env.TASK_TITLE;
const TASK_DESC = process.env.TASK_DESC;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  console.error('Missing OPENAI_API_KEY');
  process.exit(1);
}

async function main() {
  console.log('Agent starting...');
  console.log('Task:', TASK_TITLE);
  
  // 1. Context Gathering
  let files = '';
  try {
    // List all files recursively, excluding node_modules and .git
    files = execSync('find . -maxdepth 3 -not -path "*/.*" -not -path "./node_modules*"').toString();
  } catch (e) {
    files = 'Could not list files.';
  }
  
  // 2. Prompt Engineering
  const prompt = \`You are an AI coding agent.
  Goal: \${TASK_TITLE}
  Instructions: \${TASK_DESC}
  
  Current File Structure (Partial):
  \${files}
  
  Return a JSON object with a single key "files" containing an array of file objects to create or update.
  Format: { "files": [{ "path": "path/to/file.ext", "content": "file content code..." }] }
  Do not include markdown formatting (like code fences), just the raw JSON string.\`;

  console.log('Sending prompt to OpenAI...');

  // 3. Call OpenAI
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': \`Bearer \${OPENAI_API_KEY}\`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2
    })
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(\`OpenAI API Error: \${res.status} \${res.statusText} - \${txt}\`);
  }

  const data = await res.json();
  const rawOutput = data.choices[0].message.content;
  console.log('AI Response received.');

  // 4. Parse & Execute
  let plan;
  try {
    // Simple cleanup for common markdown fences
    let cleanJson = rawOutput.trim();
    // Remove wrapping backticks if present (matches \`\`\` or \`\`\`json at start/end)
    cleanJson = cleanJson.replace(/^\\\`\\\`\\\`(json)?/, '').replace(/\\\`\\\`\\\`$/, '');
    plan = JSON.parse(cleanJson);
  } catch (e) {
    console.error('Failed to parse AI response as JSON:', rawOutput);
    process.exit(1);
  }

  if (!plan.files || !Array.isArray(plan.files)) {
    console.error('Invalid plan format (missing files array).');
    process.exit(1);
  }

  for (const file of plan.files) {
    // FIX: Remove leading slashes to ensure path is relative to current directory
    // Otherwise '/docs/...' tries to write to the hard drive root (Permission Denied)
    const relativePath = file.path.replace(/^[\\/]+/, '');
    const filePath = path.join(process.cwd(), relativePath);
    
    const dir = path.dirname(filePath);
    
    if (dir !== process.cwd()) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(filePath, file.content);
    console.log(\`Wrote \${filePath}\`);
  }
  
  console.log('Agent execution finished.');
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
`;

const AI_TASK_WORKFLOW_CONTENT = `name: AI Task Runner
on:
  repository_dispatch:
    types: [ai_task_run]

jobs:
  run-task:
    runs-on: ubuntu-latest
    permissions:
      contents: write
      pull-requests: write
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install Dependencies
        run: npm ci || npm install

      - name: Log Inputs
        env:
          TASK_TITLE: \${{ github.event.client_payload.title }}
          HAS_KEY: \${{ github.event.client_payload.openai_key != '' }}
        run: |
          echo "Processing task: $TASK_TITLE"
          echo "OpenAI Key in payload: $HAS_KEY"

      - name: Ensure Agent Script Exists
        run: |
          if [ ! -f "scripts/ai-agent.ts" ]; then
            echo "Agent script missing! This workflow expects scripts/ai-agent.ts to exist."
            echo "Listing scripts directory:"
            ls -R scripts || echo "scripts dir not found"
            exit 1
          fi

      - name: Execute Agent
        env:
          TASK_ID: \${{ github.event.client_payload.task_id }}
          TASK_TITLE: \${{ github.event.client_payload.title }}
          TASK_DESC: \${{ github.event.client_payload.description }}
          TASK_INPUTS: \${{ toJson(github.event.client_payload.inputs) }}
          OPENAI_API_KEY: \${{ github.event.client_payload.openai_key }}
        run: |
          npx --yes tsx scripts/ai-agent.ts

      - name: Commit and Push
        if: success()
        run: |
          git config --global user.name "ai-task-bot"
          git config --global user.email "ai-task-bot@users.noreply.github.com"
          git add .
          if ! git diff-index --quiet HEAD; then
            git commit -m "AI Task: \${{ github.event.client_payload.title }}"
            git push
          else
            echo "No changes to commit."
          fi
`;

export async function getProjectAiTasksAction(projectId: string): Promise<AiTask[]> {
  const sb = await createServiceClient();
  const { data, error } = await sb
    .from('crm_ai_tasks')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching AI tasks:', error);
    return [];
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data || []).map((t: any) => ({
    ...t,
    logs: t.logs ? (Array.isArray(t.logs) ? t.logs : []) : undefined
  })) as AiTask[];
}

export async function syncTaskStatusAction(taskId: string): Promise<AiTask | null> {
  const sb = await createServiceClient();

  // 1. Fetch Task
  const { data: task, error: taskError } = await sb
    .from('crm_ai_tasks')
    .select('*')
    .eq('id', taskId)
    .single();

  if (taskError || !task) return null;
  if (task.status === 'success' || task.status === 'failed') return task as AiTask; // Already final

  // 2. Get Repo Info
  const { data: link } = await sb
    .from('crm_project_links')
    .select('*')
    .eq('project_id', task.project_id)
    .eq('type', 'repo')
    .single();

  if (!link) return task as AiTask;

  const parsed = parseGitHubUrl(link.url);
  if (!parsed) return task as AiTask;

  try {
    // 3. Fetch Runs
    const runsData = await getWorkflowRuns(parsed.owner, parsed.repo, 'repository_dispatch');
    const runs = runsData.workflow_runs || [];

    // 4. Find matching run
    const taskTime = new Date(task.updated_at).getTime();
    
    // Filter runs started after task update (minus 1 min buffer for clock skew)
    const matchingRun = runs.find((r: any) => {
      const runTime = new Date(r.created_at).getTime();
      return runTime >= taskTime - 60000; 
    });

    if (matchingRun) {
      let newStatus: AiTask['status'] = task.status;
      let logsAdded = false;
      const currentLogs = Array.isArray(task.logs) ? task.logs : [];
      const newLogs = [...currentLogs];

      if (matchingRun.status === 'completed') {
        if (matchingRun.conclusion === 'success') {
          newStatus = 'success';
          newLogs.push(`[${new Date().toISOString()}] Workflow completed successfully.`);
          logsAdded = true;
        } else if (matchingRun.conclusion === 'failure' || matchingRun.conclusion === 'timed_out') {
          newStatus = 'failed';
          newLogs.push(`[${new Date().toISOString()}] Workflow failed with conclusion: \${matchingRun.conclusion}`);
          logsAdded = true;
        }
      }

      if (logsAdded) {
        newLogs.push(`[${new Date().toISOString()}] Run URL: \${matchingRun.html_url}`);
        
        const { data: updated, error: updateError } = await sb
          .from('crm_ai_tasks')
          .update({ 
            status: newStatus, 
            logs: newLogs,
            updated_at: new Date().toISOString()
          })
          .eq('id', taskId)
          .select()
          .single();
          
        if (!updateError) {
          return updated as AiTask;
        }
      }
    }
  } catch (e) {
    console.error('Failed to sync task status:', e);
  }

  return task as AiTask;
}

export async function createAiTaskAction(task: Partial<AiTask> & { project_id: string; title: string }): Promise<AiTask | null> {
  const user = await getAuthUser();
  
  if (!user || !user.id) {
    console.error('CreateAiTask: No authenticated user found via getAuthUser');
    return null;
  }

  const sb = await createServiceClient();
  const userId = String(user.id);

  // Verify Profile Exists
  const { data: profile } = await sb
    .from('users')
    .select('id')
    .eq('id', userId)
    .single();

  if (!profile) {
    // Check if user exists in Auth system
    const { data: { user: authUser } } = await sb.auth.admin.getUserById(userId);
    
    let userEmail = user.email;

    // If not in Auth system, check public.users to sync it
    if (!authUser) {
      const { data: publicUser } = await sb
        .from('users')
        .select('email')
        .eq('id', userId)
        .single();
      
      if (!publicUser) {
         throw new Error('User ID mismatch: User not found in public.users or auth.users.');
      }
      userEmail = publicUser.email;

      // Sync to auth.users to satisfy FK
      const { error: createAuthError } = await sb.auth.admin.createUser({
        id: userId as any,
        email: userEmail,
        password: 'TempPasswordForSync123!', 
        email_confirm: true,
        user_metadata: { source: 'sync_from_public_users' }
      });

      if (createAuthError) {
        console.error('Failed to sync auth user:', createAuthError);
        throw new Error('Failed to sync user to auth system.');
      }
    }

    // Create missing profile
    const { error: createProfileError } = await sb.from('users').insert({
      id: userId,
      email: userEmail || 'unknown@example.com',
      role: (user.role as any) || 'admin', 
      full_name: 'Dev User'
    });

    if (createProfileError) {
      console.error('Failed to auto-create profile:', createProfileError);
      throw new Error('Failed to create user profile. Please contact support.');
    }
  }
  
  const payload = {
    project_id: task.project_id,
    title: task.title,
    description: task.description,
    status: 'queued' as const,
    created_by: userId,
    template_id: task.template_id,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    inputs: (task as any).inputs 
  };

  const { data, error } = await sb
    .from('crm_ai_tasks')
    .insert(payload)
    .select()
    .single();

  if (error) {
    console.error('Error creating AI task:', error);
    throw new Error(`Failed to create task: ${error.message}`);
  }

  return data as AiTask;
}

export async function runAiTaskAction(taskId: string): Promise<AiTask> {
  const sb = await createServiceClient();

  // 1. Fetch Task
  const { data: task, error: taskError } = await sb
    .from('crm_ai_tasks')
    .select('*')
    .eq('id', taskId)
    .single();

  if (taskError || !task) {
    console.error('Task not found:', taskError);
    throw new Error('Task not found');
  }

  // 2. Find Project Repo
  const { data: links, error: linkError } = await sb
    .from('crm_project_links')
    .select('*')
    .eq('project_id', task.project_id);

  if (linkError) {
    console.error('Error fetching project links:', linkError);
    throw new Error('Failed to fetch project links');
  }

  const repoLink = links?.find(l => l.type === 'repo');

  if (!repoLink) {
    console.error('No repo link found for project:', task.project_id);
    const existingTypes = links?.map(l => l.type).join(', ');
    throw new Error(`No repository linked to this project (Project ID: ${task.project_id}). Found links of type: ${existingTypes || 'none'}. Please add a "Repo" link.`);
  }

  const repoUrl = repoLink.url;
  const parsed = parseGitHubUrl(repoUrl);
  if (!parsed) {
    throw new Error(`Invalid GitHub URL: ${repoUrl}`);
  }

  // 2.5 Ensure Workflow & Agent Script Exist
  const logs = [];
  try {
    logs.push(`[${new Date().toISOString()}] Checking workflow file...`);
    // Inject Workflow
    await createFile({
      owner: parsed.owner,
      repo: parsed.repo,
      path: '.github/workflows/ai-task-runner.yml',
      content: AI_TASK_WORKFLOW_CONTENT,
      message: 'Update AI Task Runner workflow'
    });
    logs.push(`[${new Date().toISOString()}] Workflow file ensured.`);

    logs.push(`[${new Date().toISOString()}] Checking agent script...`);
    // Inject Agent Script
    await createFile({
      owner: parsed.owner,
      repo: parsed.repo,
      path: 'scripts/ai-agent.ts',
      content: AI_AGENT_SCRIPT_CONTENT,
      message: 'Update AI Agent script'
    });
    logs.push(`[${new Date().toISOString()}] Agent script ensured.`);
  } catch (e: any) {
    console.warn('Failed to ensure workflow/agent files exist:', e);
    logs.push(`[${new Date().toISOString()}] Warning: Failed to inject files: ${e.message}`);
  }

  // 3. Trigger Dispatch
  try {
    logs.push(`[${new Date().toISOString()}] Dispatching workflow...`);
    
    const openaiKey = process.env.OPENAI_API_KEY;
    if (!openaiKey) {
      logs.push(`[${new Date().toISOString()}] WARNING: OPENAI_API_KEY not found in server env. Task may fail.`);
    } else {
      logs.push(`[${new Date().toISOString()}] Server confirmed OPENAI_API_KEY presence (starts with: ${openaiKey.substring(0, 7)}...)`);
    }

    await triggerWorkflowDispatch({
      owner: parsed.owner,
      repo: parsed.repo,
      eventType: 'ai_task_run',
      clientPayload: {
        task_id: task.id,
        title: task.title,
        description: task.description,
        inputs: task.inputs,
        openai_key: openaiKey
      }
    });
    logs.push(`[${new Date().toISOString()}] Dispatch sent.`);

    // 4. Update Status and Logs
    const currentLogs = Array.isArray(task.logs) ? task.logs : [];
    const newLogs = [...currentLogs, ...logs];

    const { data: updatedTask, error: updateError } = await sb
      .from('crm_ai_tasks')
      .update({ 
        status: 'running', 
        updated_at: new Date().toISOString(),
        logs: newLogs
      })
      .eq('id', task.id)
      .select()
      .single();

    if (updateError) throw updateError;
    return updatedTask as AiTask;
  } catch (e: any) {
    console.error('Failed to trigger workflow:', e);
    
    // Log failure
    const currentLogs = Array.isArray(task.logs) ? task.logs : [];
    const newLogs = [
      ...currentLogs,
      ...logs,
      `[${new Date().toISOString()}] Error triggering workflow: ${e.message || e}`
    ];
    const { data: failedTask } = await sb
      .from('crm_ai_tasks')
      .update({ 
        status: 'failed', 
        updated_at: new Date().toISOString(),
        logs: newLogs 
      })
      .eq('id', task.id)
      .select()
      .single();

    throw e;
  }
}

export async function stopAiTaskAction(taskId: string): Promise<AiTask> {
  const user = await getAuthUser();
  if (!user || !user.id) {
    throw new Error('Unauthorized');
  }

  const sb = await createServiceClient();

  // Fetch current logs to append to them
  const { data: task } = await sb
    .from('crm_ai_tasks')
    .select('logs')
    .eq('id', taskId)
    .single();

  const currentLogs = Array.isArray(task?.logs) ? task.logs : [];
  const newLog = `[${new Date().toISOString()}] Task manually stopped by user.`;

  const { data: updatedTask, error } = await sb
    .from('crm_ai_tasks')
    .update({ 
      status: 'failed', 
      updated_at: new Date().toISOString(),
      logs: [...currentLogs, newLog]
    })
    .eq('id', taskId)
    .select()
    .single();

  if (error) {
    console.error('Error stopping task:', error);
    throw new Error('Failed to stop task');
  }

  return updatedTask as AiTask;
}
