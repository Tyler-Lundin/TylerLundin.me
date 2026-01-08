"use client"

import { useState, useActionState, useEffect } from 'react'
import { Plus, Check, ChevronRight, ChevronLeft, Building2, User, Globe, MapPin, Phone, Mail, Loader2, AlertCircle } from 'lucide-react'
import CrmModal from '@/app/dev/components/CrmModal'
import { createIndividualLeadAction } from '@/app/dev/actions/crm'
import { useRouter } from 'next/navigation'

const STEPS = [
  { id: 'business', title: 'Business', icon: Building2 },
  { id: 'details', title: 'Details', icon: Globe },
]

export default function IndividualLeadWizard() {
  const [isOpen, setIsOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const router = useRouter()
  
  const [formData, setFormData] = useState({
    name: '',
    niche: '',
    location: '',
    website: '',
    phone: '',
    email: ''
  })

  const [state, formAction, isPending] = useActionState(async (prev: any, _form: FormData) => {
    const final = new FormData()
    Object.entries(formData).forEach(([k, v]) => final.append(k, v))
    const res = await createIndividualLeadAction(prev, final)
    if (res?.success) {
      setIsOpen(false)
      router.push(`/dev/leads/${res.id}`)
    }
    return res
  }, null)

  const updateField = (k: string, v: string) => setFormData(p => ({ ...p, [k]: v }))

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) setCurrentStep(c => c + 1)
  }

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(c => c - 1)
  }

  const inputClasses = "w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm outline-none transition focus:border-neutral-900 focus:bg-white focus:ring-4 focus:ring-neutral-100 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white dark:focus:border-neutral-700 dark:focus:ring-neutral-800/50 dark:focus:bg-neutral-950"

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex h-10 items-center gap-2 rounded-full border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-4 text-xs font-bold text-neutral-700 dark:text-white hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-all shadow-sm"
      >
        <Plus className="size-3.5" />
        Add Specific Lead
      </button>

      <CrmModal 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
        title="Add Individual Lead"
        maxWidth="lg"
      >
        <div className="mb-8 flex items-center justify-between px-2">
          {STEPS.map((s, idx) => {
            const isActive = idx === currentStep
            const isDone = idx < currentStep
            return (
              <div key={s.id} className="flex flex-1 items-center last:flex-none">
                <div className="relative flex flex-col items-center gap-2">
                   <div className={`flex size-10 items-center justify-center rounded-full border-2 text-sm font-bold transition-all duration-300
                     ${isActive ? 'border-neutral-900 bg-neutral-900 text-white shadow-lg dark:border-white dark:bg-white dark:text-neutral-900' : 
                       isDone ? 'border-emerald-500 bg-emerald-500 text-white' : 
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
          {currentStep === 0 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
               <div>
                 <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-neutral-500">Business Name <span className="text-rose-500">*</span></label>
                 <div className="relative">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-neutral-400" />
                    <input 
                      required
                      value={formData.name}
                      onChange={e => updateField('name', e.target.value)}
                      placeholder="e.g. Skyline Dental"
                      className={`${inputClasses} pl-11`}
                    />
                 </div>
               </div>
               <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                 <div>
                   <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-neutral-500">Niche <span className="text-rose-500">*</span></label>
                   <input 
                     required
                     value={formData.niche}
                     onChange={e => updateField('niche', e.target.value)}
                     placeholder="e.g. dentist"
                     className={inputClasses}
                   />
                 </div>
                 <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-neutral-500">Location <span className="text-rose-500">*</span></label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-neutral-400" />
                      <input 
                        required
                        value={formData.location}
                        onChange={e => updateField('location', e.target.value)}
                        placeholder="e.g. Spokane, WA"
                        className={`${inputClasses} pl-11`}
                      />
                    </div>
                 </div>
               </div>
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
               <div>
                 <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-neutral-500">Website</label>
                 <div className="relative">
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-neutral-400" />
                    <input 
                      type="url"
                      value={formData.website}
                      onChange={e => updateField('website', e.target.value)}
                      placeholder="https://..."
                      className={`${inputClasses} pl-11`}
                    />
                 </div>
               </div>
               <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                 <div>
                   <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-neutral-500">Email</label>
                   <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-neutral-400" />
                      <input 
                        type="email"
                        value={formData.email}
                        onChange={e => updateField('email', e.target.value)}
                        placeholder="contact@business.com"
                        className={`${inputClasses} pl-11`}
                      />
                   </div>
                 </div>
                 <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-neutral-500">Phone</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-neutral-400" />
                      <input 
                        type="tel"
                        value={formData.phone}
                        onChange={e => updateField('phone', e.target.value)}
                        placeholder="(555) 000-0000"
                        className={`${inputClasses} pl-11`}
                      />
                    </div>
                 </div>
               </div>
            </div>
          )}

          {state?.error && (
             <div className="rounded-xl bg-rose-50 p-4 text-xs text-rose-600 dark:bg-rose-900/10 dark:text-rose-400 border border-rose-100 dark:border-rose-800/50 flex items-start gap-2">
               <AlertCircle className="size-4 shrink-0" />
               <div>{typeof state.error === 'string' ? state.error : 'Validation failed. Check required fields.'}</div>
             </div>
          )}

          <div className="mt-10 flex items-center justify-between border-t border-neutral-100 pt-6 dark:border-neutral-800/50">
             {currentStep > 0 ? (
               <button type="button" onClick={handleBack} className="flex items-center gap-2 text-sm font-bold text-neutral-500 transition-colors hover:text-neutral-900 dark:hover:text-white">
                  <ChevronLeft className="size-4" /> Back
               </button>
             ) : <div />}
             
             {currentStep < STEPS.length - 1 ? (
               <button 
                 type="submit" 
                 disabled={!formData.name || !formData.niche || !formData.location}
                 className="group flex items-center gap-2 rounded-full bg-neutral-900 px-8 py-3 text-sm font-bold text-white transition hover:scale-[1.02] hover:bg-neutral-800 disabled:opacity-50 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 shadow-xl shadow-neutral-200 dark:shadow-none"
               >
                  Next <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" />
               </button>
             ) : (
               <button 
                 type="submit" 
                 disabled={isPending}
                 className="flex items-center gap-2 rounded-full bg-blue-600 px-8 py-3 text-sm font-bold text-white transition hover:scale-[1.02] hover:bg-blue-700 disabled:opacity-50 shadow-xl shadow-blue-500/20"
               >
                  {isPending ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
                  {isPending ? 'Saving...' : 'Add Lead'}
               </button>
             )}
          </div>
        </form>
      </CrmModal>
    </>
  )
}
