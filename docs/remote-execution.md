End to end pipeline
0) Prereqs

Template repos per preset (Next.js + Supabase, Next.js marketing, etc.)

Vercel project pattern (auto-created or pre-wired) with Preview deployments enabled

GitHub App or fine-scoped token for your dashboard to:

create repos from templates

create branches, commits, PRs

dispatch workflows

1) Client creation

Goal: one client can have multiple projects.

Data model

Client { id, name, orgSlug, billingRef, githubOrg, vercelTeamId }

Project { id, clientId, name, slug, repoFullName, vercelProjectId, defaultBranch }

Flow

Create Client record

Optionally provision:

GitHub org or repo namespace conventions

Vercel team mapping

2) Project initialization wizard

Goal: pick a preset, spin up a working repo and deployment, store all identifiers.

Wizard steps

Choose template preset

Example: nextjs-supabase-saas, nextjs-marketing, nextjs-ecomm

Collect initial config

app name, domain, env var placeholders, Supabase project ref, roles list (if relevant)

“Spin it up”

Create repo from template

Create Vercel project and connect repo (or connect in Vercel UI once)

Set baseline env vars (Preview and Production)

Push initial commit if template requires customization

Smoke check

Dispatch a “bootstrap” workflow that runs install, lint, build

Confirm Vercel Preview URL responds

Output

Project is now “ready”

You have repoFullName and vercelProjectId stored

3) Tasks and a reusable task library

You want two things:

reusable “Task Templates” (library)

instantiated “Tasks” attached to a project

Task template (library)

Fields

TaskTemplate { id, slug, title, description, inputsSchema, defaultAgentPolicy, defaultChecks, tags }

Example templates

supabase-auth-roles

inputs: { roles: string[], policies: 'strict' | 'basic', ui: boolean }

route-public-private-split

inputs: { publicPrefix: '/(public)', privatePrefix: '/(private)' }

Task instance

Fields

Task { id, projectId, templateId?, title, prompt, inputsJson, status, priority, agentId, branchName, prUrl, previewUrl }

Statuses

queued -> running -> needs_review | failed | done

4) “Actions” and multi-agent execution model

Treat each provider as an Agent with a consistent interface.

Agent definition

Agent { id, provider, model, maxIterations, styleProfile, toolPolicyId, rateLimitClass }

Providers:

OpenAI (your “Codex style” worker can be GPT-based)

Gemini

Claude

Others later

Tool policy

Tool policy is what keeps this safe and predictable.

ToolPolicy { id, allowedTools, allowedCommands, allowedPaths, maxFileWrites, requireTests, requirePR }

Allowed tools (recommended minimum)

read_file(path)

search_repo(query)

apply_patch(unifiedDiff)

run_command(name) where name maps to an allowlist

git_create_branch(name)

git_commit(message)

git_push()

git_open_pr(title, body)

Allowed commands allowlist examples

install: npm ci

lint: npm run lint

typecheck: npm run typecheck

test: npm test

build: npm run build

No arbitrary shell.

5) Execution engine

This is where GitHub Actions fits cleanly.

Dispatcher

Your dashboard triggers work:

When a task is created, enqueue it

A “dispatcher” decides when to start the next task:

enforce concurrency = 1 per project

optionally allow parallel across projects and across agents

Worker

A GitHub Actions workflow run is a worker execution:

Checkout repo

Create branch for the task

Run agent loop

agent proposes patches

worker applies patches

worker runs checks

agent fixes failures until:

checks pass, or max iterations hit

Push branch

Open PR

Record PR URL and Vercel Preview URL in your DB

Mark task needs_review

Review and deploy

Human review merges PR to default branch

Vercel deploys production on merge (or you gate with an explicit “Deploy” action)

6) “Spread compute and get variations of styles”

Two knobs:

A) Scheduling strategy

Round-robin by provider

Provider selection per template

Example: “Route reorg” uses Gemini, “Auth policies” uses Claude, “UI copy” uses OpenAI

Per-client fairness

Cost caps per provider

B) Style profiles

Do not bake style into prompts ad hoc. Store profiles:

styleProfile: 'minimal' | 'verbose' | 'opinionated' | 'strict-types' | 'tailwind-heavy'

Then the same task template can run with different style profiles and produce different PRs.

7) Practical UI in your dashboard
Project wizard UI

template picker

env var checklist

“Run bootstrap” button

show preview URL

Task UI

Create from template

Show task queue

Show run logs

“Run with agent” selector

Result links:

PR link

Preview deployment link

Diff summary

Task library UI

searchable templates

versioning (template v1, v2)

tags and inputs form auto-generated from inputsSchema
