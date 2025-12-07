"use client";

import { useEffect, useMemo, useState, useTransition } from 'react';
import { sendInquiry } from '@/app/actions/sendInquiry';

type Step = 1 | 2 | 3 | 4;

const BUDGETS = ['< $2k', '$2k – $5k', '$5k – $10k', '$10k+'] as const;
const TIMELINES = ['ASAP', '2–4 weeks', '1–3 months', 'Flexible'] as const;
const PROJECT_TYPES = ['New website', 'Redesign', 'E‑commerce', 'Web app', 'Landing page'] as const;

export default function ContactWizard() {
  const [step, setStep] = useState<Step>(1);
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<'idle' | 'error' | 'success'>('idle');
  const [statusMsg, setStatusMsg] = useState<string>('');
  const [startedAt] = useState(() => Date.now());

  // Form data
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [website, setWebsite] = useState('');
  const [projectType, setProjectType] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState<string>('');
  const [timeline, setTimeline] = useState<string>('');
  const [heardFrom, setHeardFrom] = useState('');

  // Anti-spam
  const [nickname, setNickname] = useState(''); // honeypot
  const [challenge, setChallenge] = useState('');

  const emailValid = useMemo(() => /.+@.+\..+/.test(email), [email]);
  const canNext1 = useMemo(() => name.trim().length > 1 && emailValid, [name, emailValid]);
  const canNext2 = useMemo(() => description.trim().length >= 20, [description]);
  const canNext3 = useMemo(() => !!budget && !!timeline, [budget, timeline]);

  const toggleType = (t: string) => {
    setProjectType((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  };

  const next = () => setStep((s) => (s === 4 ? 4 : ((s + 1) as Step)));
  const prev = () => setStep((s) => (s === 1 ? 1 : ((s - 1) as Step)));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const elapsedMs = String(Date.now() - startedAt);
    const form = new FormData();
    form.set('name', name);
    form.set('email', email);
    if (phone) form.set('phone', phone);
    if (company) form.set('company', company);
    if (website) form.set('website', website);
    projectType.forEach((t) => form.append('projectType', t));
    form.set('description', description);
    if (budget) form.set('budget', budget);
    if (timeline) form.set('timeline', timeline);
    if (heardFrom) form.set('heardFrom', heardFrom);
    if (nickname) form.set('nickname', nickname);
    form.set('elapsedMs', elapsedMs);
    form.set('challenge', challenge);

    setStatus('idle');
    setStatusMsg('');
    startTransition(async () => {
      const res = await sendInquiry(form);
      if (res.ok) {
        setStatus('success');
        setStatusMsg(res.message || 'Sent');
      } else {
        setStatus('error');
        setStatusMsg(res.message || 'Failed to send. Please try again.');
      }
    });
  };

  return (
    <section className="py-12">
      <div className="max-w-3xl mx-auto px-4">
        {/* Progress */}
        <div className="flex items-center gap-2 mb-6 text-sm text-neutral-600 dark:text-neutral-300">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full ${i <= step ? 'bg-neutral-900 dark:bg-neutral-200' : 'bg-neutral-300/50 dark:bg-neutral-700/50'}`} />
          ))}
        </div>

        {status !== 'idle' && (
          <div className={`mb-4 rounded-md border p-3 text-sm ${status === 'success' ? 'border-emerald-500/40 text-emerald-700 dark:text-emerald-300 bg-emerald-500/5' : 'border-rose-500/40 text-rose-700 dark:text-rose-300 bg-rose-500/5'}`}>
            {statusMsg}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6" aria-busy={isPending}>
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Let’s start with the basics</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-1">Name</label>
                  <input className="w-full px-3 py-2 rounded-md border border-black/10 dark:border-white/10 bg-white/60 dark:bg-white/5" value={name} onChange={(e) => setName(e.target.value)} required aria-invalid={name.trim().length <= 1} />
                </div>
                <div>
                  <label className="block text-sm mb-1">Email</label>
                  <input type="email" className="w-full px-3 py-2 rounded-md border border-black/10 dark:border-white/10 bg-white/60 dark:bg-white/5" value={email} onChange={(e) => setEmail(e.target.value)} required aria-invalid={!emailValid} />
                  {!emailValid && email.length > 0 && <div className="mt-1 text-xs text-rose-600 dark:text-rose-400">Enter a valid email</div>}
                </div>
                <div>
                  <label className="block text-sm mb-1">Phone (optional)</label>
                  <input className="w-full px-3 py-2 rounded-md border border-black/10 dark:border-white/10 bg-white/60 dark:bg-white/5" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm mb-1">Company (optional)</label>
                  <input className="w-full px-3 py-2 rounded-md border border-black/10 dark:border-white/10 bg-white/60 dark:bg-white/5" value={company} onChange={(e) => setCompany(e.target.value)} />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm mb-1">Website (optional)</label>
                  <input className="w-full px-3 py-2 rounded-md border border-black/10 dark:border-white/10 bg-white/60 dark:bg-white/5" value={website} onChange={(e) => setWebsite(e.target.value)} />
                </div>
              </div>
              <div className="flex justify-between">
                <span />
                <button type="button" onClick={next} disabled={!canNext1} className="px-4 py-2 rounded-md bg-black text-white dark:bg-white dark:text-black disabled:opacity-50">Next</button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Tell me about the project</h3>
              <div>
                <label className="block text-sm mb-1">Project type</label>
                <div className="flex flex-wrap gap-2">
                  {PROJECT_TYPES.map((t) => (
                    <button
                      type="button"
                      key={t}
                      onClick={() => toggleType(t)}
                      className={`px-3 py-1.5 rounded-full text-sm border ${projectType.includes(t) ? 'bg-black text-white dark:bg-white dark:text-black border-black/0' : 'border-black/10 dark:border-white/10'}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm mb-1">Brief description</label>
                <textarea rows={5} className="w-full px-3 py-2 rounded-md border border-black/10 dark:border-white/10 bg-white/60 dark:bg-white/5" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What are we building? Who is it for? Any must‑haves?" />
                {description.trim().length > 0 && description.trim().length < 20 && (
                  <div className="mt-1 text-xs text-rose-600 dark:text-rose-400">Please add a bit more detail (20+ chars)</div>
                )}
              </div>
              <div className="flex justify-between">
                <button type="button" onClick={prev} className="px-4 py-2 rounded-md border border-black/10 dark:border-white/10">Back</button>
                <button type="button" onClick={next} disabled={!canNext2} className="px-4 py-2 rounded-md bg-black text-white dark:bg-white dark:text-black disabled:opacity-50">Next</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Budget & timeline</h3>
              <div>
                <label className="block text-sm mb-1">Max spend</label>
                <div className="flex flex-wrap gap-2">
                  {BUDGETS.map((b) => (
                    <button key={b} type="button" onClick={() => setBudget(b)} className={`px-3 py-1.5 rounded-full text-sm border ${budget === b ? 'bg-black text-white dark:bg-white dark:text-black border-black/0' : 'border-black/10 dark:border-white/10'}`}>{b}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm mb-1">Timeline</label>
                <div className="flex flex-wrap gap-2">
                  {TIMELINES.map((t) => (
                    <button key={t} type="button" onClick={() => setTimeline(t)} className={`px-3 py-1.5 rounded-full text-sm border ${timeline === t ? 'bg-black text-white dark:bg-white dark:text-black border-black/0' : 'border-black/10 dark:border-white/10'}`}>{t}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm mb-1">How did you hear about me? (optional)</label>
                <input className="w-full px-3 py-2 rounded-md border border-black/10 dark:border-white/10 bg-white/60 dark:bg-white/5" value={heardFrom} onChange={(e) => setHeardFrom(e.target.value)} />
              </div>
              <div className="flex justify-between">
                <button type="button" onClick={prev} className="px-4 py-2 rounded-md border border-black/10 dark:border-white/10">Back</button>
                <button type="button" onClick={next} disabled={!canNext3} className="px-4 py-2 rounded-md bg-black text-white dark:bg-white dark:text-black disabled:opacity-50">Review</button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Review & submit</h3>
              <div className="rounded-lg border border-black/10 dark:border-white/10 p-4 text-sm">
                <div><b>Name:</b> {name}</div>
                <div><b>Email:</b> {email}</div>
                {phone && <div><b>Phone:</b> {phone}</div>}
                {company && <div><b>Company:</b> {company}</div>}
                {website && <div><b>Website:</b> {website}</div>}
                {projectType.length > 0 && <div><b>Type:</b> {projectType.join(', ')}</div>}
                {budget && <div><b>Budget:</b> {budget}</div>}
                {timeline && <div><b>Timeline:</b> {timeline}</div>}
                <div className="mt-2 whitespace-pre-wrap"><b>Summary:</b> {description}</div>
              </div>
              {/* Anti-spam: honeypot + quick challenge */}
              <div className="hidden">
                <label>Nickname<input name="nickname" value={nickname} onChange={(e) => setNickname(e.target.value)} /></label>
              </div>
              <div>
                <label className="block text-sm mb-1">Quick check: 3 + 4 = ?</label>
                <input className="w-40 px-3 py-2 rounded-md border border-black/10 dark:border-white/10 bg-white/60 dark:bg-white/5" value={challenge} onChange={(e) => setChallenge(e.target.value)} placeholder="Enter 7" />
                {challenge && challenge.trim() !== '7' && (
                  <div className="mt-1 text-xs text-rose-600 dark:text-rose-400">That doesn’t look right</div>
                )}
              </div>
              <div className="flex justify-between">
                <button type="button" onClick={prev} className="px-4 py-2 rounded-md border border-black/10 dark:border-white/10">Back</button>
                <button type="submit" disabled={isPending} className="px-4 py-2 rounded-md bg-black text-white dark:bg-white dark:text-black disabled:opacity-50">{isPending ? 'Sending…' : 'Send Inquiry'}</button>
              </div>
            </div>
          )}
        </form>
      </div>
    </section>
  );
}
