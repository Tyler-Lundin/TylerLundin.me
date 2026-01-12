export const dynamic = 'force-dynamic'
import { getSupabasePublic } from '@/lib/supabase/public';
import { redirect } from 'next/navigation';
import { CreditCard, FileText, Download, CheckCircle2, Clock, AlertCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Invoice } from '@/types/crm';

export default async function PortalBillingPage() {
  let supabase: any
  try { supabase = getSupabasePublic() } catch { supabase = null }
  const { data: { user } } = supabase ? await supabase.auth.getUser() : { data: { user: null } };

  if (!user) return redirect('/login');

  // 1. Fetch Invoices for all user's projects
  const { data: invoices } = supabase ? await supabase
    .from('invoices')
    .select(`
        *,
        crm_projects (
            title,
            slug
        )
    `)
    .order('created_at', { ascending: false }) : { data: [] };

  const typedInvoices = (invoices || []) as (Invoice & { crm_projects: { title: string; slug: string } })[];

  // 2. Summary stats
  const totalBilled = typedInvoices.reduce((sum, inv) => sum + inv.amount_cents, 0);
  const totalPaid = typedInvoices
    .filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.amount_cents, 0);
  const outstanding = typedInvoices
    .filter(inv => inv.status === 'open' || inv.status === 'overdue')
    .reduce((sum, inv) => sum + inv.amount_cents, 0);

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  const getStatusStyles = (status: Invoice['status']) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'open':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'overdue':
        return 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400';
      default:
        return 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400';
    }
  };

  const getStatusIcon = (status: Invoice['status']) => {
    switch (status) {
      case 'paid': return <CheckCircle2 className="size-3" />;
      case 'overdue': return <AlertCircle className="size-3" />;
      default: return <Clock className="size-3" />;
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <header className="mb-10">
        <h1 className="text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">Billing</h1>
        <p className="text-neutral-500 dark:text-neutral-400 mt-1">Manage your invoices, payments, and subscriptions.</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="p-6 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-sm">
            <div className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">Outstanding</div>
            <div className="text-3xl font-black text-neutral-900 dark:text-white">{formatCurrency(outstanding)}</div>
        </div>
        <div className="p-6 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-sm">
            <div className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">Total Paid</div>
            <div className="text-3xl font-black text-emerald-600 dark:text-emerald-500">{formatCurrency(totalPaid)}</div>
        </div>
        <div className="p-6 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-sm">
            <div className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">Total Billed</div>
            <div className="text-3xl font-black text-neutral-900 dark:text-white">{formatCurrency(totalBilled)}</div>
        </div>
      </div>

      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
            <h2 className="font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <FileText className="size-5 text-neutral-400" />
                Invoice History
            </h2>
        </div>

        {typedInvoices.length > 0 ? (
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-neutral-50 dark:bg-neutral-900/50">
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-neutral-500">Invoice</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-neutral-500">Project</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-neutral-500">Amount</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-neutral-500">Status</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-neutral-500 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                        {typedInvoices.map((inv) => (
                            <tr key={inv.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="font-bold text-neutral-900 dark:text-white text-sm">{inv.number || `INV-${inv.id.slice(0, 8)}`}</div>
                                    <div className="text-[10px] text-neutral-500">{new Date(inv.created_at).toLocaleDateString()}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <Link href={`/portal/projects/${inv.crm_projects.slug}`} className="text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                        {inv.crm_projects.title}
                                    </Link>
                                </td>
                                <td className="px-6 py-4 font-bold text-neutral-900 dark:text-white text-sm">
                                    {formatCurrency(inv.amount_cents)}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusStyles(inv.status)}`}>
                                        {getStatusIcon(inv.status)}
                                        {inv.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors" title="Download PDF">
                                        <Download className="size-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        ) : (
            <div className="p-12 text-center">
                <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CreditCard className="size-8 text-neutral-400" />
                </div>
                <h3 className="font-bold text-neutral-900 dark:text-white mb-1">No invoices found</h3>
                <p className="text-sm text-neutral-500 max-w-xs mx-auto">
                    When you have billed projects or subscriptions, your invoices will appear here.
                </p>
            </div>
        )}
      </div>
      
      <div className="mt-8 p-6 bg-blue-600 rounded-3xl text-white flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative group">
          <div className="absolute -right-8 -bottom-8 opacity-10 group-hover:scale-110 transition-transform duration-500">
              <CreditCard className="size-48" />
          </div>
          <div className="relative z-10 text-center md:text-left">
              <h3 className="text-xl font-black mb-1">Need help with billing?</h3>
              <p className="text-blue-100 text-sm max-w-md">Our team is available to help with payments, subscription changes, or any billing questions.</p>
          </div>
          <Link href="/portal/messages" className="relative z-10 px-6 py-3 bg-white text-blue-600 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-50 transition-colors whitespace-nowrap">
              Message Support <ArrowRight className="size-4" />
          </Link>
      </div>
    </div>
  );
}
