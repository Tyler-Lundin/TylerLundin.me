import { getZ } from '@/lib/ankr/zod-adapter'

export type ActionPlanContext = {
  project?: string
  projectSlug?: string
  interfaceName?: string | null
  snippetTitle?: string
  hasTS?: boolean
  hasSQL?: boolean
  docPath?: string
  docTitle?: string
  firstSentence?: string
  // Business content context
  businessField?: string
  businessHours?: string
  pageTargets?: string[]
  businessChanges?: Array<{ field: string; value?: string; current?: string; desired?: string; polarity?: string }>
}

export type ActionSpec = {
  // Schema for server-side execution params
  execSchema: (z: any) => any
  // Optional normalizer for server execution
  normalize?: (params: any) => any
  // Optional sample args for plan/proposal stage
  planSampleArgs?: (ctx: ActionPlanContext) => Record<string, any>
}

export const ACTION_SPECS: Record<string, ActionSpec> = {
  CreateTopic: {
    execSchema: (z: any) => z.object({ title: z.string().optional(), analysis: z.object({}).optional(), slug: z.string().optional(), kind: z.string().optional(), tags: z.array(z.string()).optional(), description: z.string().optional() }).optional(),
    planSampleArgs: (ctx) => ({ title: ctx.project || 'New Topic' }),
  },
  AttachTopicToThread: {
    execSchema: (z: any) => z.object({ topicId: z.string().optional(), topicSlug: z.string().optional(), topicTitle: z.string().optional(), slug: z.string().optional(), title: z.string().optional(), pinned: z.boolean().optional() }).optional(),
  },
  SaveNote: {
    execSchema: (z: any) => z.object({ noteType: z.enum(['goal','thought','decision','question','todo']), content: z.string().min(1), topicId: z.string().optional(), sourceRef: z.string().optional() }),
    normalize: (p) => ({ noteType: p.noteType || 'goal', content: p.content || 'Captured goal', topicId: p.topicId, sourceRef: p.sourceRef }),
    planSampleArgs: (ctx) => ({ noteType: 'goal', content: ctx.firstSentence || 'Captured goal' }),
  },
  SaveSnippet: {
    // Execution requires topicId + content; plan may include title/language
    execSchema: (z: any) => z.object({ topicId: z.string(), content: z.string(), sourceRef: z.string().optional() }),
    planSampleArgs: (ctx) => {
      const baseTitle = ctx.snippetTitle || 'Code Snippet'
      const title = ctx.interfaceName ? `${ctx.interfaceName} Interface` : baseTitle
      const tags = Array.from(new Set([
        ctx.project || undefined,
        /config/i.test(String(ctx.docTitle || '')) ? 'Config' : undefined,
        /mvp/i.test(String(ctx.firstSentence || '')) ? 'MVP' : undefined,
      ].filter(Boolean) as string[]))
      const args: any = { title, language: ctx.hasTS ? 'ts' : (ctx.hasSQL ? 'sql' : undefined), source: 'message' }
      if (tags.length > 0) args.tags = tags
      return args
    },
  },
  DraftNextSteps: {
    execSchema: (z: any) => z.object({ analysis: z.object({}).optional(), topic: z.string().optional() }).optional(),
    planSampleArgs: (ctx) => ({ topic: ctx.project ? `${ctx.project} next steps` : 'Next steps' }),
  },
  UpdateProject: {
    execSchema: (z: any) => z.object({}).optional(),
    planSampleArgs: (ctx) => ({ project: ctx.project || 'Current Project', summary: 'Per-site config interface + sample config' }),
  },
  OpenPRDraft: {
    execSchema: (z: any) => z.object({}).optional(),
    planSampleArgs: (ctx) => ({ title: `${ctx.project || 'Project'}: ${ctx.snippetTitle || 'Changes'}`, branch: `${ctx.projectSlug || 'project'}-site-config` }),
  },
  CreateIssue: {
    execSchema: (z: any) => z.object({}).optional(),
    planSampleArgs: (ctx) => ({ title: ctx.firstSentence || 'Follow-up task' }),
  },
  SearchRepo: {
    execSchema: (z: any) => z.object({}).optional(),
  },
  CreateDoc: {
    execSchema: (z: any) => z.object({}).optional(),
    planSampleArgs: (ctx) => ({ title: ctx.docTitle || 'Per-Site Configuration', path: ctx.docPath || `docs/${ctx.projectSlug || 'project'}/site-config.md` }),
  },
  UpdateDocs: {
    execSchema: (z: any) => z.object({}).optional(),
    planSampleArgs: (ctx) => ({ title: ctx.docTitle || 'Per-Site Configuration', path: ctx.docPath || `docs/${ctx.projectSlug || 'project'}/site-config.md` }),
  },
  CreateFile: {
    execSchema: (z: any) => z.object({}).optional(),
    planSampleArgs: (ctx) => ({ path: ctx.projectSlug ? `src/types/${ctx.projectSlug}/${ctx.interfaceName || 'AnkrSiteConfig'}.ts` : `src/types/${ctx.interfaceName || 'AnkrSiteConfig'}.ts` }),
  },
  GenerateType: {
    execSchema: (z: any) => z.object({}).optional(),
    planSampleArgs: (ctx) => ({ name: ctx.interfaceName || 'AnkrSiteConfig', language: 'ts' }),
  },
  // Business/content updates
  UpdateSiteHours: {
    execSchema: (z: any) => z.object({ hours: z.string(), location: z.string().optional() }),
    planSampleArgs: (ctx) => ({
      hours: ctx.businessHours || 'Mon–Fri 7–5',
      location: (ctx.pageTargets && ctx.pageTargets.length > 0 ? ctx.pageTargets.join('/') : 'global/footer/contact'),
    }),
  },
  PreviewChanges: {
    execSchema: (z: any) => z.object({ targets: z.array(z.string()), format: z.enum(['plain','diff']).optional() }),
    planSampleArgs: (ctx) => {
      let targets: string[] = []
      if (ctx.businessChanges && ctx.businessChanges.length > 0) {
        targets = Array.from(new Set(ctx.businessChanges.map(c => c.field)))
      } else if (ctx.pageTargets && ctx.pageTargets.length > 0) {
        targets = Array.from(new Set(ctx.pageTargets.map(t => `hours.${t}`)))
      } else if (ctx.businessField) {
        targets = [ctx.businessField]
      }
      return { targets, format: 'plain' }
    },
  },
  CreateChangeRequest: {
    execSchema: (z: any) => z.object({
      summary: z.string(),
      field: z.string().optional(),
      current: z.string().optional(),
      desired: z.string().optional(),
      polarity: z.string().optional(),
      changes: z.array(z.object({ field: z.string(), current: z.string().optional(), desired: z.string().optional(), polarity: z.string().optional() })).optional(),
    }),
    planSampleArgs: (ctx) => {
      const summary = ctx.firstSentence || 'Requested content change'
      if (ctx.businessChanges && ctx.businessChanges.length > 0) {
        // Prefer desired/current/polarity when present
        const changes = ctx.businessChanges.map((c) => ({ field: c.field, ...(c.desired ? { desired: c.desired } : {}), ...(c.current ? { current: c.current } : {}), ...(c.value ? { value: c.value } : {}), ...(c.polarity ? { polarity: c.polarity } : {}) }))
        return { summary, changes }
      }
      return { summary, field: ctx.businessField || 'Business Hours' }
    },
  },
}

export async function getExecSchema(name: string) {
  const z = await getZ()
  const spec = ACTION_SPECS[name]
  return spec ? spec.execSchema(z) : (await getZ()).object({}).optional()
}
