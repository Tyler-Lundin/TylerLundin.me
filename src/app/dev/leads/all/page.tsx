import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { requireRoles } from '@/lib/auth';
import Link from 'next/link';
import { ArrowLeft, Search, MapPin, Globe, Phone, Star, ExternalLink, Filter } from 'lucide-react';
import AllLeadsTable from './AllLeadsTable';
import NicheFilter from './NicheFilter';

export const dynamic = 'force-dynamic';

export default async function AllLeadsPage({ searchParams }: { searchParams: Promise<{ q?: string; page?: string; niche?: string }> }) {
  await requireRoles(['admin', 'owner']);
  const sp = await searchParams;
  const q = sp.q || '';
  const niche = sp.niche || '';
  const page = Math.max(1, Number(sp.page || '1'));
  const limit = 50;
  const offset = (page - 1) * limit;

  let sb: any
  try { sb = getSupabaseAdmin() } catch { sb = null }

  let query = sb ? sb
    .from('leads')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1) : null as any;

  if (query && q) query = query.or(`name.ilike.%${q}%,domain.ilike.%${q}%,formatted_address.ilike.%${q}%`);
  if (query && niche) query = query.eq('niche', niche);

  const { data: leads, count, error } = query ? await query : { data: [], count: 0, error: null } as any;

  // Get unique niches for filter
  type NicheRow = { niche: string | null }
  const { data: nichesData } = sb ? await sb.from('leads').select('niche') : { data: [] as NicheRow[] };
  const uniqueNiches = Array.from(new Set(((nichesData || []) as NicheRow[]).map((l: NicheRow) => l.niche).filter(Boolean))) as string[];
  uniqueNiches.sort();

  const totalPages = Math.ceil((count || 0) / limit);

  return (
    <div className="min-h-screen bg-neutral-50/50 dark:bg-neutral-950/50 pb-20 pt-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <Link href="/dev/leads" className="flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors mb-2">
              <ArrowLeft className="h-4 w-4" /> Back to Generator
            </Link>
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">All Leads</h1>
            <p className="text-sm text-neutral-500">Browsing {count || 0} total database records</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <form className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 group-focus-within:text-blue-500 transition-colors" />
              <input 
                name="q"
                defaultValue={q}
                placeholder="Search name, domain..."
                className="h-10 w-64 pl-10 pr-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
              />
            </form>
            
            <NicheFilter defaultValue={niche} niches={uniqueNiches} />
          </div>
        </div>

        {/* Leads Table */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-sm overflow-hidden">
          <AllLeadsTable initialLeads={leads || []} />
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 flex items-center justify-between">
              <p className="text-xs text-neutral-500">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Link 
                  href={`/dev/leads/all?page=${page - 1}${q ? `&q=${q}` : ''}${niche ? `&niche=${niche}` : ''}`}
                  className={`px-4 py-2 rounded-lg border text-xs font-bold transition-all ${page <= 1 ? 'pointer-events-none opacity-40' : 'hover:bg-white dark:hover:bg-neutral-800'}`}
                >
                  Previous
                </Link>
                <Link 
                  href={`/dev/leads/all?page=${page + 1}${q ? `&q=${q}` : ''}${niche ? `&niche=${niche}` : ''}`}
                  className={`px-4 py-2 rounded-lg border text-xs font-bold transition-all ${page >= totalPages ? 'pointer-events-none opacity-40' : 'hover:bg-white dark:hover:bg-neutral-800'}`}
                >
                  Next
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
