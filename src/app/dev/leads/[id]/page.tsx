import { getAdminClient } from '@/lib/leadgen/supabaseServer';
import Link from 'next/link';
import AddToGroupClient from './AddToGroupClient';
import InitializeClientProjectButton from './InitializeClientProjectButton';
import DeleteLeadButton from './DeleteLeadButton';
import LeadDetailBackConfirm from './LeadDetailBackConfirm';
import ContactLeadOnDetail from './ContactLeadOnDetail';
import { LeadNotes, LeadActivity, LeadAIInsights } from './MockComponents';
import { 
  ArrowLeft, 
  MapPin, 
  Phone, 
  Globe, 
  Star, 
  Building2, 
  DollarSign, 
  Layers,
  Filter,
  Briefcase,
  CheckCircle2
} from 'lucide-react';

async function fetchLead(id: string) {
  const supa = getAdminClient();
  if (!supa) return { lead: null, groups: [], filters: [], client: null, project: null };

  // 1) Fetch lead
  const { data: lead } = await supa
    .from('leads')
    .select('id, google_place_id, niche, location, name, formatted_address, lat, lng, phone, website, domain, rating, user_ratings_total, price_level, types, business_status, google_maps_url, created_at, updated_at')
    .eq('id', id)
    .maybeSingle();

  if (!lead) return { lead: null, groups: [], filters: [], client: null, project: null };

  // 2) Related groups and filters (can run in parallel)
  const [groupsRes, filtersRes] = await Promise.all([
    supa
      .from('lead_group_members')
      .select('group_id, added_at, lead_groups(id,name)')
      .eq('lead_id', id)
      .order('added_at', { ascending: false }),
    supa
      .from('lead_filter_results')
      .select('filter_key, decision, reason, created_at')
      .eq('lead_id', id)
      .order('created_at', { ascending: false })
      .limit(100),
  ]);

  // 3) Resolve existing client/project for disabling init
  let client: any = null;
  const { data: byLead } = await supa
    .from('crm_clients')
    .select('id, name, lead_id, domain')
    .eq('lead_id', lead.id)
    .maybeSingle();
  if (byLead) client = byLead;
  if (!client && lead.domain) {
    const { data: byDomain } = await supa
      .from('crm_clients')
      .select('id, name, lead_id, domain')
      .ilike('domain', String(lead.domain).toLowerCase())
      .maybeSingle();
    if (byDomain) client = byDomain;
  }

  let project: any = null;
  if (client) {
    const { data: active } = await supa
      .from('crm_projects')
      .select('id, title, slug, status')
      .eq('client_id', client.id)
      .in('status', ['planned', 'in_progress'])
      .maybeSingle();
    if (active) project = active;
  }

  return {
    lead,
    groups: groupsRes.data || [],
    filters: filtersRes.data || [],
    client,
    project,
  } as { lead: any; groups: any[]; filters: any[]; client: any | null; project: any | null };
}

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { lead, groups, filters, client, project } = await fetchLead(id);

  if (!lead) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <h1 className="text-2xl font-bold">Lead not found</h1>
        <Link href="/dev/leads" className="flex items-center gap-2 text-blue-600 hover:underline">
          <ArrowLeft className="h-4 w-4" /> Back to Leads
        </Link>
      </div>
    );
  }

  const hasClient = !!client;
  const hasProject = !!project;

  return (
    <div className="min-h-screen bg-neutral-50/50 dark:bg-neutral-950/50 pb-20">
      <LeadDetailBackConfirm />
      
      {/* Top Navigation Bar */}
      <div className="border-b bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/dev/leads" className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back to Leads</span>
          </Link>
          <div className="flex items-center gap-3">
             <Link href="/dev/leads/swipe" className="text-xs font-medium text-neutral-600 hover:text-blue-600">
               Swipe Mode
             </Link>
             <div className="h-4 w-px bg-neutral-300 dark:bg-neutral-700"></div>
             <ContactLeadOnDetail lead={lead} />
             <InitializeClientProjectButton 
                leadId={lead.id} 
                disabled={hasClient && hasProject}
                existingClientId={client?.id || null}
                existingProjectSlug={project?.slug || null}
              />
             <DeleteLeadButton leadId={lead.id} hasClientOrProject={hasClient || hasProject} />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        
        {/* Header Hero */}
        <div className="flex flex-col md:flex-row gap-6 md:items-start md:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2 items-center mb-1">
              {lead.niche && (
                <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 text-[10px] uppercase font-bold tracking-wider border border-indigo-100 dark:border-indigo-800">
                  {lead.niche}
                </span>
              )}
              {hasClient ? (
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 text-[10px] uppercase font-bold tracking-wider border border-emerald-100 dark:border-emerald-800 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Client
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400 text-[10px] uppercase font-bold tracking-wider border border-neutral-200 dark:border-neutral-700">
                   Propsect
                </span>
              )}
              {hasProject && (
                <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 text-[10px] uppercase font-bold tracking-wider border border-blue-100 dark:border-blue-800 flex items-center gap-1">
                  <Briefcase className="h-3 w-3" /> Project Active
                </span>
              )}
            </div>
            
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50">{lead.name || 'Unknown Lead'}</h1>
            
            <div className="flex flex-col gap-1 text-neutral-600 dark:text-neutral-400 text-sm">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-neutral-400 shrink-0" />
                <span>{lead.formatted_address || lead.location || 'No location provided'}</span>
              </div>
              {lead.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-neutral-400 shrink-0" />
                  <span>{lead.phone}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-4 pt-2">
              {lead.website && (
                <a 
                  href={lead.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  <Globe className="h-4 w-4" /> Visit Website
                </a>
              )}
              {lead.google_maps_url && (
                <a 
                  href={lead.google_maps_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  <MapPin className="h-4 w-4" /> View on Maps
                </a>
              )}
            </div>
          </div>

          <div className="flex md:flex-col gap-4 items-start md:items-end">
             {/* Rating Card */}
             <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 shadow-sm min-w-[140px]">
               <div className="flex items-center gap-1 mb-1 text-amber-500">
                 <Star className="h-4 w-4 fill-current" />
                 <span className="text-xs font-semibold uppercase text-neutral-500">Google Rating</span>
               </div>
               <div className="flex items-baseline gap-2">
                 <span className="text-3xl font-bold">{lead.rating || '—'}</span>
                 <span className="text-sm text-neutral-500">/ 5.0</span>
               </div>
               <div className="text-xs text-neutral-400 mt-1">
                 {lead.user_ratings_total || 0} reviews
               </div>
             </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Primary Details */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 shadow-sm">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Building2 className="h-5 w-5 text-neutral-400" />
                Business Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 text-sm">
                <div>
                  <label className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Business Status</label>
                  <p className="mt-1 font-medium">{lead.business_status || '—'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Business Types</label>
                  <p className="mt-1 font-medium capitalize">{Array.isArray(lead.types) ? lead.types.join(', ').replace(/_/g, ' ') : '—'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Price Level</label>
                  <div className="mt-1 flex text-neutral-300">
                    {[1,2,3,4].map(l => (
                      <DollarSign key={l} className={`h-4 w-4 ${l <= (lead.price_level || 0) ? 'text-green-600 dark:text-green-400' : ''}`} />
                    ))}
                    {!lead.price_level && <span className="text-neutral-400 ml-1">Unknown</span>}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Domain</label>
                  <p className="mt-1 font-mono text-neutral-600 dark:text-neutral-400">{lead.domain || '—'}</p>
                </div>
              </div>
            </div>

            {/* Notes Mock */}
            <LeadNotes />

            {/* Groups */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 shadow-sm">
               <div className="flex items-center justify-between mb-4">
                 <h2 className="text-lg font-semibold flex items-center gap-2">
                   <Layers className="h-5 w-5 text-neutral-400" />
                   Groups
                 </h2>
                 <AddToGroupClient leadId={lead.id} />
               </div>
               
               {groups.length === 0 ? (
                  <div className="text-sm text-neutral-500 italic py-2">Not assigned to any groups.</div>
                ) : (
                  <div className="space-y-2">
                    {groups.map((g: any) => (
                      <div key={g.group_id} className="flex items-center justify-between p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-800">
                        <Link href={`/dev/groups/${g.group_id}`} className="font-medium text-blue-600 hover:underline">
                          {g.lead_groups?.name || 'Unknown Group'}
                        </Link>
                        <span className="text-xs text-neutral-500">
                          Added {new Date(g.added_at).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
            </div>

          </div>

          {/* Sidebar Column */}
          <div className="space-y-6">
            
            <LeadAIInsights />

            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 shadow-sm">
              <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Filter className="h-4 w-4 text-neutral-400" />
                Filter History
              </h2>
              {filters.length === 0 ? (
                <div className="text-xs text-neutral-500">No automated filter decisions.</div>
              ) : (
                <ul className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {filters.map((r, i) => (
                    <li key={i} className="text-xs border-b border-neutral-100 dark:border-neutral-800 last:border-0 pb-2 last:pb-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded text-neutral-600 dark:text-neutral-300">
                          {r.filter_key}
                        </span>
                        <span className={`font-semibold ${r.decision === 'keep' ? 'text-emerald-600' : 'text-red-600'}`}>
                          {r.decision}
                        </span>
                      </div>
                      {r.reason && <p className="text-neutral-500 leading-tight mb-1">{r.reason}</p>}
                      <div className="text-neutral-400 text-[10px] text-right">
                        {new Date(r.created_at).toLocaleDateString()}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            
            <LeadActivity />

            {/* Metadata Card */}
            <div className="bg-neutral-50 dark:bg-neutral-900/30 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4">
              <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-3">System Data</h3>
              <div className="space-y-2 text-xs text-neutral-600 dark:text-neutral-400">
                <div className="flex justify-between">
                  <span>ID</span>
                  <span className="font-mono text-[10px]">{lead.id.substring(0, 8)}...</span>
                </div>
                <div className="flex justify-between">
                  <span>Created</span>
                  <span>{new Date(lead.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Updated</span>
                  <span>{new Date(lead.updated_at).toLocaleDateString()}</span>
                </div>
                <div className="pt-2 mt-2 border-t border-neutral-200 dark:border-neutral-800 text-center">
                  <span className="block text-[10px] text-neutral-400">Full ID: {lead.id}</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
