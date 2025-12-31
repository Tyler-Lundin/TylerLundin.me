import Link from 'next/link';

const SIDEBAR_ADS = [
  {
    title: "Need a Website?",
    description: "I build fast, clean sites that rank and convert. Let’s boost your brand.",
    cta: "Start a Project",
    href: "/contact",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    )
  },
  {
    title: "Hosting & Care",
    description: "Managed hosting, backups, and updates—so you focus on your business.",
    cta: "View Plans",
    href: "/services/web-hosting",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
      </svg>
    )
  },
  {
    title: "Have Questions?",
    description: "Not sure where to start? I’m happy to help with a quick consult.",
    cta: "Let’s Chat",
    href: "/contact",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    )
  }
];

export default function SidebarAds() {
  return (
    <aside className="flex flex-col gap-4">
      {SIDEBAR_ADS.map((ad, i) => (
        <div 
          key={ad.title} 
          className="group relative flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-neutral-50/50 p-5 backdrop-blur-sm transition-all hover:border-neutral-300 hover:bg-white hover:shadow-sm dark:border-neutral-800 dark:bg-neutral-900/50 dark:hover:border-neutral-700 dark:hover:bg-neutral-900"
        >
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-200/50 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400 group-hover:bg-neutral-900 group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-colors duration-300">
              {ad.icon}
            </div>
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
              {ad.title}
            </h3>
          </div>

          {/* Body */}
          <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
            {ad.description}
          </p>

          {/* Button */}
          <Link 
            href={ad.href} 
            className="mt-1 flex w-full items-center justify-center rounded-xl bg-neutral-900 py-2.5 text-sm font-medium text-white transition-all hover:bg-neutral-800 active:scale-[0.98] dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
          >
            {ad.cta}
          </Link>
        </div>
      ))}
    </aside>
  )
}
