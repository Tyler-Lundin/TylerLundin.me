"use client"

import { useState, useActionState } from 'react'
import { Plus, Check, ChevronRight, ChevronLeft, Building2, User } from 'lucide-react'
import CrmModal from '@/app/dev/components/CrmModal'
import { createClientAction } from '@/app/dev/actions/crm'

// Wizard Steps
const STEPS = [
  { id: 'org', title: 'Organization', icon: Building2 },
  { id: 'contact', title: 'Primary Contact', icon: User },
]

export default function NewClientWizard() {
  const [isOpen, setIsOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    website_url: '',
    phone: '',
    billing_notes: '',
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    contact_title: ''
  })

  const [state, formAction, isPending] = useActionState(async (prev: any, _formDataPayload: FormData) => {
    const finalData = new FormData()
    Object.entries(formData).forEach(([k, v]) => finalData.append(k, v))
    
    const result = await createClientAction(prev, finalData)
    if (result?.success) {
      setIsOpen(false)
      setFormData({
        name: '', company: '', website_url: '', phone: '', billing_notes: '',
        contact_name: '', contact_email: '', contact_phone: '', contact_title: ''
      })
      setCurrentStep(0)
    }
    return result
  }, null)

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) setCurrentStep(c => c + 1)
  }

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(c => c - 1)
  }

  const updateField = (k: string, v: string) => setFormData(prev => ({ ...prev, [k]: v }))

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex h-10 items-center gap-2 rounded-lg bg-neutral-900 px-4 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:opacity-60 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
      >
        <Plus className="h-4 w-4" />
        <span className="hidden sm:inline">New Client</span>
      </button>

      <CrmModal 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
        title="New Client Onboarding"
        maxWidth="lg"
      >
        {/* Progress Stepper */}
        <div className="mb-10 flex items-center justify-between px-2">
          {STEPS.map((s, idx) => {
            const isActive = idx === currentStep
            const isDone = idx < currentStep
            return (
              <div key={s.id} className="flex flex-1 items-center last:flex-none">
                <div className="relative flex flex-col items-center gap-2">
                   <div className={`flex size-10 items-center justify-center rounded-full border-2 text-sm font-bold transition-all duration-300
                     ${isActive ? 'border-neutral-900 bg-neutral-900 text-white shadow-lg dark:border-white dark:bg-white dark:text-neutral-900' : 
                       isDone ? 'border-emerald-500 bg-emerald-500 text-white shadow-md' : 
                       'border-neutral-200 bg-white text-neutral-400 dark:border-neutral-800 dark:bg-neutral-900'}
                   `}>
                     {isDone ? <Check className="size-5" /> : idx + 1}
                   </div>
                   <span className={`absolute top-12 whitespace-nowrap text-[10px] font-bold uppercase tracking-widest
                     ${isActive ? 'text-neutral-900 dark:text-white' : 'text-neutral-400'}
                   `}>{s.title}</span>
                </div>
                {idx !== STEPS.length - 1 && (
                  <div className={`mx-4 h-0.5 w-full flex-1 transition-colors duration-500 ${isDone ? 'bg-emerald-500' : 'bg-neutral-100 dark:bg-neutral-800'}`} />
                )}
              </div>
            )
          })}
        </div>

        {/* Form Content */}
        <form 
          action={formAction} 
          className="mt-12 space-y-6"
          onSubmit={(e) => {
            if (currentStep < STEPS.length - 1) {
              e.preventDefault()
              handleNext()
            }
          }}
        >
          {/* Step 1: Organization */}
          {currentStep === 0 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
               <div>
                 <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-neutral-500">Client Name <span className="text-rose-500">*</span></label>
                 <input 
                   required
                   value={formData.name}
                   onChange={e => updateField('name', e.target.value)}
                   placeholder="e.g. Zevlin Bike"
                   className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm outline-none transition focus:border-neutral-900 focus:bg-white focus:ring-4 focus:ring-neutral-100 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white dark:focus:border-neutral-700 dark:focus:ring-neutral-800/50"
                 />
                 {(() => {
                   const errs = state && typeof state.error !== 'string' ? (state.error as Record<string, string[] | undefined>) : null
                   const msg = errs?.name?.[0]
                   return msg ? <p className="mt-1 text-xs text-rose-500">{msg}</p> : null
                 })()}
               </div>
               <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                 <div>
                   <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-neutral-500">Legal Company Name</label>
                   <input 
                     value={formData.company}
                     onChange={e => updateField('company', e.target.value)}
                     placeholder="e.g. Zevlin Inc."
                     className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm outline-none transition focus:border-neutral-900 focus:bg-white focus:ring-4 focus:ring-neutral-100 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white dark:focus:border-neutral-700 dark:focus:ring-neutral-800/50"
                   />
                 </div>
                 <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-neutral-500">Website</label>
                    <input 
                      type="url"
                      value={formData.website_url}
                      onChange={e => updateField('website_url', e.target.value)}
                      placeholder="https://..."
                      className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm outline-none transition focus:border-neutral-900 focus:bg-white focus:ring-4 focus:ring-neutral-100 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white dark:focus:border-neutral-700 dark:focus:ring-neutral-800/50"
                    />
                 </div>
               </div>
               <div>
                 <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-neutral-500">Billing Notes</label>
                 <textarea 
                   rows={3}
                   value={formData.billing_notes}
                   onChange={e => updateField('billing_notes', e.target.value)}
                   placeholder="Address, VAT ID, etc."
                   className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm outline-none transition focus:border-neutral-900 focus:bg-white focus:ring-4 focus:ring-neutral-100 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white dark:focus:border-neutral-700 dark:focus:ring-neutral-800/50"
                 />
               </div>
            </div>
          )}

          {/* Step 2: Primary Contact */}
          {currentStep === 1 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
               <div>
                 <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-neutral-500">Contact Name</label>
                 <input 
                   value={formData.contact_name}
                   onChange={e => updateField('contact_name', e.target.value)}
                   placeholder="Jane Doe"
                   className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm outline-none transition focus:border-neutral-900 focus:bg-white focus:ring-4 focus:ring-neutral-100 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white dark:focus:border-neutral-700 dark:focus:ring-neutral-800/50"
                 />
               </div>
               <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                 <div>
                   <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-neutral-500">Email Address</label>
                   <input 
                     type="email"
                     value={formData.contact_email}
                     onChange={e => updateField('contact_email', e.target.value)}
                     placeholder="jane@example.com"
                     className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm outline-none transition focus:border-neutral-900 focus:bg-white focus:ring-4 focus:ring-neutral-100 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white dark:focus:border-neutral-700 dark:focus:ring-neutral-800/50"
                   />
                 </div>
                 <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-neutral-500">Phone Number</label>
                    <input 
                      type="tel"
                      value={formData.contact_phone}
                      onChange={e => updateField('contact_phone', e.target.value)}
                      placeholder="+1 (555)..."
                      className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm outline-none transition focus:border-neutral-900 focus:bg-white focus:ring-4 focus:ring-neutral-100 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white dark:focus:border-neutral-700 dark:focus:ring-neutral-800/50"
                    />
                 </div>
               </div>
               <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-neutral-500">Job Title</label>
                  <input 
                    value={formData.contact_title}
                    onChange={e => updateField('contact_title', e.target.value)}
                    placeholder="CEO, Marketing Lead..."
                    className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm outline-none transition focus:border-neutral-900 focus:bg-white focus:ring-4 focus:ring-neutral-100 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white dark:focus:border-neutral-700 dark:focus:ring-neutral-800/50"
                  />
               </div>
            </div>
          )}

          {state?.error && typeof state.error === 'string' && (
             <div className="rounded-xl bg-rose-50 p-4 text-xs text-rose-600 dark:bg-rose-900/10 dark:text-rose-400">
               {state.error}
             </div>
          )}

          {/* Navigation */}
          <div className="mt-10 flex items-center justify-between border-t border-neutral-100 pt-6 dark:border-neutral-800/50">
             {currentStep > 0 ? (
               <button type="button" onClick={handleBack} className="flex items-center gap-2 text-sm font-bold text-neutral-500 transition-colors hover:text-neutral-900 dark:hover:text-white">
                  <ChevronLeft className="size-4" /> Back
               </button>
             ) : <div />}
             
             {currentStep < STEPS.length - 1 ? (
               <button 
                 type="submit" 
                 disabled={!formData.name}
                 className="group flex items-center gap-2 rounded-full bg-neutral-900 px-8 py-3 text-sm font-bold text-white transition hover:scale-[1.02] hover:bg-neutral-800 disabled:opacity-50 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
               >
                  Next <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" />
               </button>
             ) : (
               <button 
                 type="submit" 
                 disabled={isPending}
                 className="flex items-center gap-2 rounded-full bg-neutral-900 px-8 py-3 text-sm font-bold text-white transition hover:scale-[1.02] hover:bg-neutral-800 disabled:opacity-50 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
               >
                  {isPending ? 'Creating...' : 'Create Client'}
               </button>
             )}
          </div>
        </form>
      </CrmModal>
    </>
  )
}
