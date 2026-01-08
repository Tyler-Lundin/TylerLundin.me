"use client"

import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  Mail, 
  MessageSquare, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  Send, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  Eye,
  PenTool,
  Settings
} from 'lucide-react'

interface Lead {
  id: string
  name: string
  email?: string | null
  phone?: string | null
  website?: string | null
  domain?: string | null
  strategy?: {
    hook: string
    pain_points: string[]
    value_prop: string
    suggested_cta: string
  }
}

type Step = 'channel' | 'compose' | 'preview' | 'success'

export default function LeadContactWizard({ 
  lead, 
  open, 
  onClose 
}: { 
  lead: Lead, 
  open: boolean, 
  onClose: () => void 
}) {
  const [step, setStep] = useState<Step>('channel')
  const [channel, setChannel] = useState<'email' | 'sms'>('email')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [includeLink, setIncludeLink] = useState(false)
  const [generatingLink, setGeneratingLink] = useState(false)
  const [inviteLink, setInviteLink] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Pre-fill logic when AI Strategy is available
  const draftWithAI = () => {
    if (!lead.strategy) return
    
    setSubject(`Quick question regarding ${lead.name}`)
    
    let aiBody = `Hi ${lead.name.split(' ')[0]},

${lead.strategy.hook}

I noticed a few things that might be holding you back:
${lead.strategy.pain_points.map(p => `• ${p}`).join('\n')}

${lead.strategy.value_prop}

${lead.strategy.suggested_cta}

Best,
Tyler`
    
    if (includeLink && inviteLink) {
      aiBody += `\n\nPS: I've actually already set up a private portal for you to see what I have in mind.`
    }

    setBody(aiBody)
    setStep('compose')
  }

  // Effect to handle link generation
  useEffect(() => {
    if (includeLink && !inviteLink && open) {
      const fetchLink = async () => {
        setGeneratingLink(true)
        try {
          const res = await fetch(`/api/dev/leads/${lead.id}/invite-link`, { method: 'POST' })
          const data = await res.json()
          if (data.link) setInviteLink(data.link)
          else throw new Error(data.error || 'Failed to generate link')
        } catch (e: any) {
          setError(e.message)
          setIncludeLink(false)
        } finally {
          setGeneratingLink(false)
        }
      }
      fetchLink()
    }
  }, [includeLink, inviteLink, lead.id, open])

  // Clear state on close
  useEffect(() => {
    if (!open) {
      setIncludeLink(false)
      setInviteLink(null)
      setError(null)
    }
  }, [open])

  const handleSend = async () => {
    setSending(true)
    setError(null)
    try {
      const payload = {
        channel,
        items: [{
          lead_id: lead.id,
          to: channel === 'email' ? lead.email : lead.phone,
          subject: channel === 'email' ? subject : undefined,
          body,
          ctaLink: includeLink ? inviteLink : undefined,
          useBranding: channel === 'email' // Auto-brand emails
        }]
      }

      const res = await fetch('/api/dev/leads/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!res.ok) throw new Error('Failed to send message')
      
      // Refresh activity feed
      window.dispatchEvent(new Event('lead-activity-refresh'));
      
      setStep('success')
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSending(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-neutral-950/40 backdrop-blur-md"
        onClick={onClose}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-4xl bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
              <Send className="size-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white tracking-tight">Contact {lead.name}</h2>
              <p className="text-xs text-neutral-500 font-medium uppercase tracking-widest">Outreach Wizard</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
            <X className="size-5 text-neutral-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <AnimatePresence mode="wait">
            
            {/* Step 1: Channel & Strategy */}
            {step === 'channel' && (
              <motion.div 
                key="channel"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-8 space-y-8"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Channel Selection */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-500">1. Select Channel</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <button 
                        onClick={() => setChannel('email')}
                        className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${channel === 'email' ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-900/20' : 'border-neutral-100 dark:border-neutral-800'}`}
                      >
                        <Mail className={`size-8 ${channel === 'email' ? 'text-blue-600' : 'text-neutral-400'}`} />
                        <span className="font-bold text-sm">Email</span>
                      </button>
                      <button 
                        onClick={() => setChannel('sms')}
                        className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${channel === 'sms' ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-900/20' : 'border-neutral-100 dark:border-neutral-800'}`}
                      >
                        <MessageSquare className={`size-8 ${channel === 'sms' ? 'text-blue-600' : 'text-neutral-400'}`} />
                        <span className="font-bold text-sm">SMS</span>
                      </button>
                    </div>
                  </div>

                  {/* Invite Link Toggle */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-500">2. Portal Access</h3>
                    <div 
                      onClick={() => !generatingLink && setIncludeLink(!includeLink)}
                      className={`p-6 rounded-2xl border-2 transition-all cursor-pointer relative overflow-hidden group ${includeLink ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-900/20' : 'border-neutral-100 dark:border-neutral-800'}`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`flex size-10 items-center justify-center rounded-xl transition-colors ${includeLink ? 'bg-emerald-600 text-white' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400'}`}>
                          {generatingLink ? <Loader2 className="size-5 animate-spin" /> : <Settings className="size-5" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-sm">Include Instant Access Link</span>
                            <div className={`w-10 h-5 rounded-full relative transition-colors ${includeLink ? 'bg-emerald-600' : 'bg-neutral-200 dark:bg-neutral-700'}`}>
                              <div className={`absolute top-1 size-3 bg-white rounded-full transition-all ${includeLink ? 'left-6' : 'left-1'}`} />
                            </div>
                          </div>
                          <p className="mt-1 text-xs text-neutral-500 leading-relaxed">
                            Automatically converts lead to client and logs them into their portal when clicked.
                          </p>
                        </div>
                      </div>
                      {inviteLink && includeLink && (
                        <div className="mt-4 p-3 bg-white dark:bg-black/40 rounded-xl border border-emerald-100 dark:border-emerald-900/50 text-[10px] font-mono text-emerald-700 dark:text-emerald-400 break-all animate-in fade-in slide-in-from-top-2">
                          {inviteLink}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Strategy Info */}
                  <div className="space-y-4 md:col-span-2">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-500">3. Outreach Intelligence</h3>
                    {lead.strategy ? (
                      <div className="p-6 rounded-2xl bg-purple-50 dark:bg-purple-900/10 border-2 border-purple-100 dark:border-purple-900/30 space-y-4">
                        <div className="flex items-center gap-2 text-purple-700 dark:text-purple-400">
                          <Sparkles className="size-4" />
                          <span className="font-bold text-sm">AI Strategy Ready</span>
                        </div>
                        <p className="text-xs text-purple-900/70 dark:text-purple-300/70 leading-relaxed italic">
                          "{lead.strategy.hook}"
                        </p>
                        <button 
                          onClick={draftWithAI}
                          className="w-full py-3 bg-purple-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-purple-600/20 hover:bg-purple-700 transition-all flex items-center justify-center gap-2"
                        >
                          <PenTool className="size-4" />
                          Draft with AI Strategy
                        </button>
                      </div>
                    ) : (
                      <div className="p-6 rounded-2xl border-2 border-dashed border-neutral-200 dark:border-neutral-800 text-center">
                        <p className="text-sm text-neutral-500 mb-4">No AI strategy generated for this lead yet.</p>
                        <button 
                          onClick={() => setStep('compose')}
                          className="w-full py-3 bg-neutral-900 dark:bg-white text-white dark:text-black rounded-xl font-bold text-sm"
                        >
                          Manual Composition
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Compose */}
            {step === 'compose' && (
              <motion.div 
                key="compose"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-8 space-y-6"
              >
                <div className="space-y-4">
                  {channel === 'email' && (
                    <div>
                      <label className="block text-xs font-bold text-neutral-500 uppercase mb-2">Subject Line</label>
                      <input 
                        value={subject}
                        onChange={e => setSubject(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
                        placeholder="Email subject..."
                      />
                    </div>
                  )}
                  <div>
                    <label className="block text-xs font-bold text-neutral-500 uppercase mb-2">Message Body</label>
                    <textarea 
                      value={body}
                      onChange={e => setBody(e.target.value)}
                      rows={10}
                      className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none font-medium leading-relaxed"
                      placeholder="Type your message..."
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <button onClick={() => setStep('channel')} className="flex items-center gap-2 text-sm font-bold text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors">
                    <ArrowLeft className="size-4" /> Back
                  </button>
                  <button 
                    disabled={!body.trim() || (channel === 'email' && !subject.trim())}
                    onClick={() => setStep('preview')}
                    className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    Preview Message <ArrowRight className="size-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Preview */}
            {step === 'preview' && (
              <motion.div 
                key="preview"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-8 space-y-8"
              >
                <div className="bg-neutral-50 dark:bg-black/20 rounded-3xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-sm">
                  {/* Realistic Email Header */}
                  <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="size-2 rounded-full bg-red-400" />
                      <div className="size-2 rounded-full bg-amber-400" />
                      <div className="size-2 rounded-full bg-green-400" />
                    </div>
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">{channel.toUpperCase()} PREVIEW</span>
                    <div className="size-4" />
                  </div>
                  
                  <div className="p-8 space-y-6">
                    {channel === 'email' && (
                      <div className="space-y-3 pb-6 border-b border-neutral-200 dark:border-neutral-800">
                        <div className="flex text-sm">
                          <span className="w-16 text-neutral-400 font-medium">From:</span>
                          <span className="text-neutral-900 dark:text-neutral-100 font-semibold">Tyler Lundin &lt;outreach@tylerlundin.me&gt;</span>
                        </div>
                        <div className="flex text-sm">
                          <span className="w-16 text-neutral-400 font-medium">To:</span>
                          <span className="text-neutral-900 dark:text-neutral-100 font-semibold">{lead.email || lead.name}</span>
                        </div>
                        <div className="flex text-sm">
                          <span className="w-16 text-neutral-400 font-medium">Subject:</span>
                          <span className="text-neutral-900 dark:text-neutral-100 font-bold">{subject}</span>
                        </div>
                      </div>
                    )}
                    
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <pre className="whitespace-pre-wrap font-sans text-base leading-relaxed text-neutral-700 dark:text-neutral-300">
                        {body}
                      </pre>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <button onClick={() => setStep('compose')} className="flex items-center gap-2 text-sm font-bold text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors">
                    <ArrowLeft className="size-4" /> Back to Edit
                  </button>
                  <button 
                    disabled={sending}
                    onClick={handleSend}
                    className="px-10 py-4 bg-emerald-600 text-white font-black rounded-2xl shadow-xl shadow-emerald-600/20 hover:bg-emerald-500 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-3 disabled:opacity-50"
                  >
                    {sending ? <Loader2 className="size-5 animate-spin" /> : <Send className="size-5" />}
                    {sending ? 'Sending Outreach...' : 'Send Message Now'}
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 4: Success */}
            {step === 'success' && (
              <motion.div 
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-16 text-center space-y-6"
              >
                <div className="inline-flex p-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 mb-4 border-4 border-white dark:border-neutral-800 shadow-xl">
                  <CheckCircle2 className="size-16" />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-neutral-900 dark:text-white mb-2 tracking-tight">Outreach Sent!</h2>
                  <p className="text-neutral-500 dark:text-neutral-400 max-w-md mx-auto">
                    Your message to <strong>{lead.name}</strong> has been successfully dispatched via {channel}.
                  </p>
                </div>
                <div className="pt-6">
                  <button 
                    onClick={onClose}
                    className="px-8 py-3 bg-neutral-900 dark:bg-white text-white dark:text-black font-bold rounded-xl hover:scale-105 transition-transform"
                  >
                    Back to Lead Profile
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Error State */}
        {error && (
          <div className="px-8 py-4 bg-rose-50 dark:bg-rose-900/20 border-t border-rose-100 dark:border-rose-800 flex items-center gap-3 text-rose-600 dark:text-rose-400">
            <AlertCircle className="size-5 shrink-0" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}
      </motion.div>
    </div>
  )
}
