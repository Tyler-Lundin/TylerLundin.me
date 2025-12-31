"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { sendInquiry } from "@/app/actions/sendInquiry";

export default function ContactSimpleForm() {
  const searchParams = useSearchParams();
  const bundleParam = (searchParams?.get("bundle") || "").trim();
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<"idle" | "error" | "success">("idle");
  const [statusMsg, setStatusMsg] = useState<string>("");
  const [startedAt] = useState(() => Date.now());
  const [csrfToken, setCsrfToken] = useState<string>("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [website, setWebsite] = useState("");
  const [preferred, setPreferred] = useState<"Email" | "Text" | "Call" | "">("");
  const [consent, setConsent] = useState(false);
  const [topic, setTopic] = useState("General");
  const [heardFrom, setHeardFrom] = useState("");
  const [nickname, setNickname] = useState(""); // honeypot

  const emailValid = useMemo(() => /.+@.+\..+/.test(email), [email]);
  const canSubmit = useMemo(
    () => name.trim().length > 1 && emailValid && message.trim().length >= 10 && consent,
    [name, emailValid, message, consent]
  );

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const elapsedMs = String(Date.now() - startedAt);
    const form = new FormData();
    form.set("name", name);
    form.set("email", email);
    form.set("description", message);
    if (bundleParam) form.set("bundle", bundleParam);
    if (phone) form.set("phone", phone);
    if (company) form.set("company", company);
    if (website) form.set("website", website);
    if (preferred) form.set("preferredContact", preferred);
    if (topic) form.set("topic", topic);
    if (heardFrom) form.set("heardFrom", heardFrom);
    form.set("consent", consent ? "true" : "false");
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
        setName("");
        setEmail("");
        setMessage("");
        setPhone("");
        setCompany("");
        setWebsite("");
        setPreferred("");
        setTopic("General");
        setHeardFrom("");
        setConsent(false);
      } else {
        setStatus("error");
        setStatusMsg(res.message || "Failed to send. Please try again.");
      }
    });
  };

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/csrf", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as { token?: string };
        if (active && data?.token) setCsrfToken(data.token);
      } catch {
        // best-effort; if it fails, submit will be rejected server-side
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="py-8">
      <div className="max-w-5xl mx-auto px-4">
        {bundleParam && (
          <div className="mb-4 text-xs inline-flex items-center gap-2 rounded-md border border-emerald-600/20 bg-emerald-500/5 text-emerald-800 dark:text-emerald-300 px-2.5 py-1.5">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Asking about bundle: <strong className="font-semibold">{bundleParam}</strong>
          </div>
        )}
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

        <form onSubmit={onSubmit} className="space-y-4" aria-busy={isPending}>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1">Name</label>
              <input
                className="w-full px-3 py-2 rounded-md border border-black/10 dark:border-white/10 bg-white/60 dark:bg-white/5"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                aria-invalid={name.trim().length <= 1}
                autoComplete="name"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Email</label>
              <input
                type="email"
                className="w-full px-3 py-2 rounded-md border border-black/10 dark:border-white/10 bg-white/60 dark:bg-white/5"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                aria-invalid={!emailValid}
                autoComplete="email"
              />
              {!emailValid && email.length > 0 && (
                <div className="mt-1 text-xs text-rose-600 dark:text-rose-400">
                  Enter a valid email
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm mb-1">Phone (optional)</label>
              <input
                className="w-full px-3 py-2 rounded-md border border-black/10 dark:border-white/10 bg-white/60 dark:bg-white/5"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                autoComplete="tel"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Company (optional)</label>
              <input
                className="w-full px-3 py-2 rounded-md border border-black/10 dark:border-white/10 bg-white/60 dark:bg-white/5"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                autoComplete="organization"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm mb-1">Website (optional)</label>
              <input
                className="w-full px-3 py-2 rounded-md border border-black/10 dark:border-white/10 bg-white/60 dark:bg-white/5"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                autoComplete="url"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1">Preferred contact</label>
              <div className="flex gap-2 flex-wrap">
                {["Email", "Text", "Call"].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setPreferred(m as any)}
                    className={`px-3 py-1.5 rounded-full text-sm border ${preferred === m ? 'bg-black text-white dark:bg-white dark:text-black border-black/0' : 'border-black/10 dark:border-white/10'}`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm mb-1">Topic</label>
              <select
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-black/10 dark:border-white/10 bg-white/60 dark:bg-white/5"
              >
                {['General','Support','Partnership','Other'].map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm mb-1">Message</label>
            <textarea
              rows={5}
              className="w-full px-3 py-2 rounded-md border border-black/10 dark:border-white/10 bg-white/60 dark:bg-white/5"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="What can I help with?"
              required
            />
            {message.trim().length > 0 && message.trim().length < 10 && (
              <div className="mt-1 text-xs text-rose-600 dark:text-rose-400">
                Please add more detail (10+ chars)
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm mb-1">How did you hear about me? (optional)</label>
            <input
              className="w-full px-3 py-2 rounded-md border border-black/10 dark:border-white/10 bg-white/60 dark:bg-white/5"
              value={heardFrom}
              onChange={(e) => setHeardFrom(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 text-sm">
            <input id="consent" type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="h-4 w-4" />
            <label htmlFor="consent">It’s okay to contact me about this request.</label>
          </div>

          {/* Honeypot (hidden) */}
          <div className="hidden">
            <label htmlFor="nickname">Nickname</label>
            <input
              id="nickname"
              name="nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              tabIndex={-1}
              autoComplete="off"
            />
          </div>

          <button
            type="submit"
            disabled={!canSubmit || isPending}
            className="px-5 py-2.5 rounded-md bg-black text-white dark:bg-white dark:text-black disabled:opacity-50"
          >
            {isPending ? "Sending…" : "Send Message"}
          </button>
        </form>
        <div className="mt-6 text-sm text-neutral-600 dark:text-neutral-300">
          Ready to start a scoped project? <a className="underline" href="/quote">Request a Quote</a>
        </div>
      </div>
    </section>
  );
}
