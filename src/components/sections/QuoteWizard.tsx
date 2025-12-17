"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { sendInquiry } from "@/app/actions/sendInquiry";

type Step = 1 | 2 | 3 | 4;

const PROJECT_TYPES = [
  "New site",
  "Redesign",
  "Landing page",
  "E-commerce",
  "Web app / custom build",
  "Maintenance / SEO",
] as const;

const PAGES_ESTIMATE = ["1–3", "4–6", "7–10", "10+"] as const;

const FEATURES = [
  "Contact form",
  "Booking/calendar",
  "Payments",
  "Product catalog",
  "Blog",
  "Membership/login",
  "Integrations (CRM, email marketing, etc.)",
  "Analytics/SEO setup",
] as const;

const TIMELINES = ["ASAP", "2–4 weeks", "1–2 months", "Flexible"] as const;
const BUDGETS = ["$500–$1k", "$1k–$2.5k", "$2.5k–$5k", "$5k+"] as const;
const ONGOING = ["No", "Maintenance only", "SEO/content help", "Not sure—advise me"] as const;

export default function QuoteWizard() {
  const [step, setStep] = useState<Step>(1);
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<"idle" | "error" | "success">("idle");
  const [statusMsg, setStatusMsg] = useState<string>("");
  const [startedAt] = useState(() => Date.now());
  const [csrfToken, setCsrfToken] = useState<string>("");

  // Step 1
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [website, setWebsite] = useState("");

  // Step 2
  const [projectType, setProjectType] = useState<string>("");
  const [pages, setPages] = useState<string>("");
  const [features, setFeatures] = useState<string[]>([]);

  // Step 3
  const [timeline, setTimeline] = useState<string>("");
  const [budgetRange, setBudgetRange] = useState<string>("");
  const [ongoingHelp, setOngoingHelp] = useState<string>("");

  // Step 4
  const [assets, setAssets] = useState<string[]>([]);
  const [example1, setExample1] = useState("");
  const [example2, setExample2] = useState("");
  const [example3, setExample3] = useState("");
  const [notes, setNotes] = useState("");
  const [nickname, setNickname] = useState(""); // honeypot

  const emailValid = useMemo(() => /.+@.+\..+/.test(email), [email]);
  const canNext1 = useMemo(() => name.trim().length > 1 && emailValid, [name, emailValid]);
  const canNext2 = useMemo(() => !!projectType && !!pages, [projectType, pages]);
  const canNext3 = useMemo(() => !!timeline && !!budgetRange, [timeline, budgetRange]);

  const toggle = (arr: string[], setArr: (v: string[]) => void, v: string) => {
    setArr(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);
  };

  const next = () => setStep((s) => (s === 4 ? 4 : ((s + 1) as Step)));
  const prev = () => setStep((s) => (s === 1 ? 1 : ((s - 1) as Step)));

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/csrf", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as { token?: string };
        if (active && data?.token) setCsrfToken(data.token);
      } catch {}
    })();
    return () => {
      active = false;
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const elapsedMs = String(Date.now() - startedAt);
    const form = new FormData();
    form.set("name", name);
    form.set("email", email);
    if (phone) form.set("phone", phone);
    if (company) form.set("company", company);
    if (website) form.set("website", website);
    if (projectType) form.append("projectType", projectType);
    if (pages) form.set("pagesEstimate", pages);
    features.forEach((f) => form.append("features", f));
    if (timeline) form.set("timeline", timeline);
    if (budgetRange) {
      form.set("budgetRange", budgetRange);
      form.set("budget", budgetRange); // for compatibility
    }
    if (ongoingHelp) form.set("ongoingHelp", ongoingHelp);
    assets.forEach((a) => form.append("assets", a));
    const examples = [example1, example2, example3].filter(Boolean);
    examples.forEach((u) => form.append("exampleLinks", u));
    if (notes) form.set("notes", notes);
    form.set("elapsedMs", elapsedMs);
    form.set("nickname", nickname);
    form.set("csrf_token", csrfToken);

    setStatus("idle");
    setStatusMsg("");
    startTransition(async () => {
      const res = await sendInquiry(form);
      if (res.ok) {
        setStatus("success");
        setStatusMsg(res.message || "Sent");
      } else {
        setStatus("error");
        setStatusMsg(res.message || "Failed to send. Please try again.");
      }
    });
  };

  return (
    <section className="py-12">
      <div className="max-w-3xl mx-auto px-4">
        <div className="flex items-center gap-2 mb-6 text-sm text-neutral-600 dark:text-neutral-300">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full ${i <= step ? "bg-neutral-900 dark:bg-neutral-200" : "bg-neutral-300/50 dark:bg-neutral-700/50"}`}
            />
          ))}
        </div>

        {status !== "idle" && (
          <div
            className={`mb-4 rounded-md border p-3 text-sm ${
              status === "success"
                ? "border-emerald-500/40 text-emerald-700 dark:text-emerald-300 bg-emerald-500/5"
                : "border-rose-500/40 text-rose-700 dark:text-rose-300 bg-rose-500/5"
            }`}
          >
            {statusMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6" aria-busy={isPending}>
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Basics</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-1">Name</label>
                  <input className="w-full px-3 py-2 rounded-md border border-black/10 dark:border-white/10 bg-white/60 dark:bg-white/5" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div>
                  <label className="block text-sm mb-1">Email</label>
                  <input type="email" className="w-full px-3 py-2 rounded-md border border-black/10 dark:border-white/10 bg-white/60 dark:bg-white/5" value={email} onChange={(e) => setEmail(e.target.value)} required aria-invalid={!emailValid} />
                </div>
                <div>
                  <label className="block text-sm mb-1">Phone (optional)</label>
                  <input className="w-full px-3 py-2 rounded-md border border-black/10 dark:border-white/10 bg-white/60 dark:bg-white/5" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm mb-1">Business name</label>
                  <input className="w-full px-3 py-2 rounded-md border border-black/10 dark:border-white/10 bg-white/60 dark:bg-white/5" value={company} onChange={(e) => setCompany(e.target.value)} />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm mb-1">Current website (optional)</label>
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
              <h3 className="text-xl font-semibold">What you need</h3>
              <div>
                <label className="block text-sm mb-1">Project type</label>
                <div className="flex flex-wrap gap-2">
                  {PROJECT_TYPES.map((t) => (
                    <button key={t} type="button" onClick={() => setProjectType(t)} className={`px-3 py-1.5 rounded-full text-sm border ${projectType === t ? 'bg-black text-white dark:bg-white dark:text-black border-black/0' : 'border-black/10 dark:border-white/10'}`}>{t}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm mb-1">Pages/sections estimate</label>
                <div className="flex flex-wrap gap-2">
                  {PAGES_ESTIMATE.map((p) => (
                    <button key={p} type="button" onClick={() => setPages(p)} className={`px-3 py-1.5 rounded-full text-sm border ${pages === p ? 'bg-black text-white dark:bg-white dark:text-black border-black/0' : 'border-black/10 dark:border-white/10'}`}>{p}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm mb-1">Must‑have features</label>
                <div className="flex flex-wrap gap-2">
                  {FEATURES.map((f) => (
                    <button key={f} type="button" onClick={() => toggle(features, setFeatures, f)} className={`px-3 py-1.5 rounded-full text-sm border ${features.includes(f) ? 'bg-black text-white dark:bg-white dark:text-black border-black/0' : 'border-black/10 dark:border-white/10'}`}>{f}</button>
                  ))}
                </div>
              </div>
              <div className="flex justify-between">
                <button type="button" onClick={prev} className="px-4 py-2 rounded-md border border-black/10 dark:border-white/10">Back</button>
                <button type="button" onClick={next} disabled={!canNext2} className="px-4 py-2 rounded-md bg-black text-white dark:bg-white dark:text-black disabled:opacity-50">Next</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Timeline & budget</h3>
              <div>
                <label className="block text-sm mb-1">Target launch</label>
                <div className="flex flex-wrap gap-2">
                  {TIMELINES.map((t) => (
                    <button key={t} type="button" onClick={() => setTimeline(t)} className={`px-3 py-1.5 rounded-full text-sm border ${timeline === t ? 'bg-black text-white dark:bg-white dark:text-black border-black/0' : 'border-black/10 dark:border-white/10'}`}>{t}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm mb-1">Budget range</label>
                <div className="flex flex-wrap gap-2">
                  {BUDGETS.map((b) => (
                    <button key={b} type="button" onClick={() => setBudgetRange(b)} className={`px-3 py-1.5 rounded-full text-sm border ${budgetRange === b ? 'bg-black text-white dark:bg-white dark:text-black border-black/0' : 'border-black/10 dark:border-white/10'}`}>{b}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm mb-1">Ongoing help</label>
                <div className="flex flex-wrap gap-2">
                  {ONGOING.map((o) => (
                    <button key={o} type="button" onClick={() => setOngoingHelp(o)} className={`px-3 py-1.5 rounded-full text-sm border ${ongoingHelp === o ? 'bg-black text-white dark:bg-white dark:text-black border-black/0' : 'border-black/10 dark:border-white/10'}`}>{o}</button>
                  ))}
                </div>
              </div>
              <div className="flex justify-between">
                <button type="button" onClick={prev} className="px-4 py-2 rounded-md border border-black/10 dark:border-white/10">Back</button>
                <button type="button" onClick={next} disabled={!canNext3} className="px-4 py-2 rounded-md bg-black text-white dark:bg-white dark:text-black disabled:opacity-50">Next</button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Assets</h3>
              <div>
                <label className="block text-sm mb-1">What do you already have?</label>
                <div className="flex flex-wrap gap-2">
                  {["Logo", "Brand colors", "Copy", "Photos"].map((a) => (
                    <button key={a} type="button" onClick={() => toggle(assets, setAssets, a)} className={`px-3 py-1.5 rounded-full text-sm border ${assets.includes(a) ? 'bg-black text-white dark:bg-white dark:text-black border-black/0' : 'border-black/10 dark:border-white/10'}`}>{a}</button>
                  ))}
                </div>
              </div>
              <div className="grid sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm mb-1">Example site 1</label>
                  <input className="w-full px-3 py-2 rounded-md border border-black/10 dark:border-white/10 bg-white/60 dark:bg-white/5" value={example1} onChange={(e) => setExample1(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm mb-1">Example site 2</label>
                  <input className="w-full px-3 py-2 rounded-md border border-black/10 dark:border-white/10 bg-white/60 dark:bg-white/5" value={example2} onChange={(e) => setExample2(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm mb-1">Example site 3</label>
                  <input className="w-full px-3 py-2 rounded-md border border-black/10 dark:border-white/10 bg-white/60 dark:bg-white/5" value={example3} onChange={(e) => setExample3(e.target.value)} />
                </div>
              </div>
              <div>
                <label className="block text-sm mb-1">Notes / details</label>
                <textarea rows={4} className="w-full px-3 py-2 rounded-md border border-black/10 dark:border-white/10 bg-white/60 dark:bg-white/5" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Don’t know the answers? Put your best guess—I'll clarify on a quick call." />
              </div>

              {/* Honeypot */}
              <div className="hidden">
                <label htmlFor="nickname">Nickname</label>
                <input id="nickname" name="nickname" value={nickname} onChange={(e) => setNickname(e.target.value)} tabIndex={-1} autoComplete="off" />
              </div>

              <div className="flex justify-between">
                <button type="button" onClick={prev} className="px-4 py-2 rounded-md border border-black/10 dark:border-white/10">Back</button>
                <button type="submit" className="px-4 py-2 rounded-md bg-black text-white dark:bg-white dark:text-black">Request Quote</button>
              </div>
            </div>
          )}
        </form>
        <div className="mt-6 text-sm text-neutral-600 dark:text-neutral-300">
          Just have a quick question? <a className="underline" href="/contact">Contact me</a>
        </div>
      </div>
    </section>
  );
}
