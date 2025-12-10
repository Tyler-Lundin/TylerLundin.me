export default function SidebarAds() {
  return (
    <aside className="space-y-4">
      <div className="rounded-xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-neutral-900/70 p-4">
        <h3 className="text-sm font-semibold">Need a Website?</h3>
        <p className="mt-1 text-sm text-neutral-700 dark:text-neutral-300">
          I build fast, clean sites that rank and convert. Let’s boost your brand.
        </p>
        <a href="/contact" className="mt-3 inline-block text-sm px-3 py-2 rounded-md bg-black text-white dark:bg-white dark:text-black">Start a Project</a>
      </div>

      <div className="rounded-xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-neutral-900/70 p-4">
        <h3 className="text-sm font-semibold">Hosting & Care</h3>
        <p className="mt-1 text-sm text-neutral-700 dark:text-neutral-300">
          Managed hosting, backups, monitoring, and updates—so you focus on your business.
        </p>
        <a href="/services/web-hosting" className="mt-3 inline-block text-sm px-3 py-2 rounded-md bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900">View Plans</a>
      </div>

      <div className="rounded-xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-neutral-900/70 p-4">
        <h3 className="text-sm font-semibold">Have Questions?</h3>
        <p className="mt-1 text-sm text-neutral-700 dark:text-neutral-300">
          Not sure where to start? I’m happy to help with a quick consult.
        </p>
        <a href="/contact" className="mt-3 inline-block text-sm px-3 py-2 rounded-md bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900">Let’s Chat</a>
      </div>
    </aside>
  )
}

