"use client"

import { useActionState, useEffect, useState } from 'react'
import { Check, Mail, Building2, User, ArrowRight, Loader2, AlertCircle } from 'lucide-react'
import { convertSignupAction } from '@/app/dev/actions/crm'
import { useRouter } from 'next/navigation'

interface Signup {
  id: string
  company_name: string
  company_website: string | null
  contact_name: string
  contact_email: string
  project_description: string | null
  promo_code: string | null
  need_logo: boolean | null
  status: string
  created_at: string
}

export default function PendingSignups({ initialSignups = [] }: { initialSignups: Signup[] }) {
  const [signups, setSignups] = useState<Signup[]>(initialSignups)
  const [state, formAction, isPending] = useActionState(convertSignupAction, null)
  const router = useRouter()

  useEffect(() => {
    if (state?.success && state.projectSlug) {
      router.push(`/dev/projects/${state.projectSlug}`)
    }
  }, [state, router])

  if (signups.length === 0) return null

  return (
    <div className="mb-10 space-y-4">
      <div className="flex items-center gap-2 px-1">
        <div className="flex size-5 items-center justify-center rounded-full bg-blue-500 text-[10px] font-bold text-white">
          {signups.length}
        </div>
        <h2 className="text-sm font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
          Pending Project Signups
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {signups.map((s) => (
          <div key={s.id} className="group relative flex flex-col rounded-2xl border border-blue-100 bg-blue-50/30 p-5 transition-all hover:border-blue-200 hover:bg-blue-50 dark:border-blue-900/30 dark:bg-blue-900/10 dark:hover:border-blue-800 dark:hover:bg-blue-900/20">
            <div className="mb-4 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-blue-100 dark:bg-neutral-900 dark:ring-blue-900/50">
                  <Building2 className="size-5 text-blue-500" />
                </div>
                <div>
                  <h3 className="font-bold text-neutral-900 dark:text-white line-clamp-1">{s.company_name}</h3>
                  <p className="text-[10px] font-medium uppercase tracking-wider text-blue-600 dark:text-blue-400">Public Signup</p>
                </div>
              </div>
            </div>

            <div className="space-y-2.5 mb-6">
              <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                <User className="size-3.5" />
                <span className="truncate">{s.contact_name}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                <Mail className="size-3.5" />
                <span className="truncate">{s.contact_email}</span>
              </div>
              {s.project_description && (
                <p className="mt-3 text-xs leading-relaxed text-neutral-500 line-clamp-3 italic">
                  &ldquo;{s.project_description}&rdquo;
                </p>
              )}
            </div>

            <div className="mt-auto pt-4 border-t border-blue-100 dark:border-blue-900/30">
              <form action={formAction}>
                <input type="hidden" name="signup_id" value={s.id} />
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-600/20 transition-all hover:bg-blue-700 active:scale-[0.98] disabled:opacity-50"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="size-3.5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Accept & Create Project
                      <ArrowRight className="size-3.5" />
                    </>
                  )}
                </button>
              </form>
            </div>

            {state?.error && (
              <div className="mt-3 flex items-center gap-1.5 text-[10px] font-bold text-rose-500">
                <AlertCircle className="size-3" />
                <span>Error: {typeof state.error === 'string' ? state.error : 'Failed to convert'}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
