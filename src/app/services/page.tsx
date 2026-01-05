import Link from 'next/link'
import {
  CloudflareIcon,
  PhotoshopIcon,
  SupabaseIcon,
  VercelIcon
} from '@/components/icons/BrandIcons'
import {
  LayoutDashboard,
  Shield,
  Database,
  PenTool,
  Check,
  Zap,
  Server,
  Code2,
  Cpu,
  ArrowRight,
  XCircle,
  CheckCircle2
} from 'lucide-react'
import type { Metadata } from 'next'
import { services, bundles } from '@/services'
import ServicesBillboard from '@/components/billboard/ServicesBillboard'
import SpotlightBundles from '@/components/bundles/SpotlightBundles'
import { themeConfig, billboardThemes } from '@/config/theme'
import type { BillboardThemeKey as BillboardThemeKeyFromConfig } from '@/config/themes/billboard'
import ContactCTA from '@/components/sections/ContactCTA'
import ReactiveBackground from '@/components/ReactiveBackground'

export const metadata: Metadata = {
  title: 'Services | Tyler Lundin',
  description:
    'Web services for Spokane businesses: High-performance hosting, custom web design, data dashboards, and secure authentication systems.'
}

// --- Icons Helper ---
const getServiceIcons = (slug: string) => {
  const iconClass = "h-5 w-5 text-neutral-600 dark:text-neutral-400 group-hover:text-emerald-500 transition-colors"
  
  switch (slug) {
    case 'web-hosting':
      return [
        <VercelIcon key="v" className={iconClass} />,
        <CloudflareIcon key="c" className={iconClass} />
      ]
    case 'web-design':
      return [
        <PenTool key="p" className={iconClass} />,
        <PhotoshopIcon key="ps" className={iconClass} />
      ]
    case 'logo-design':
      return [
        <PenTool key="p" className={iconClass} />
      ]
    case 'dashboards-data':
      return [
        <LayoutDashboard key="d" className={iconClass} />,
        <Database key="db" className={iconClass} />
      ]
    case 'authentication':
      return [
        <Shield key="s" className={iconClass} />,
        <SupabaseIcon key="sb" className={iconClass} />
      ]
    default:
      return [<Code2 key="c" className={iconClass} />]
  }
}

export default function ServicesIndexPage() {
  const themeKey: BillboardThemeKeyFromConfig = themeConfig.billboard.themeKey
  const t = billboardThemes[themeKey]
  const contactHref = (slug?: string) => slug ? `/contact?service=${encodeURIComponent(slug)}` : '/contact'

  return (
    <main
      className={[
        'max-w-full overflow-x-hidden mx-2 md:mx-4 my-4 rounded-2xl',
        'border border-black/10 dark:border-white/10',
        'bg-white/50 dark:bg-black/50',
        billboardThemes[themeKey].wrap,
        'text-black dark:text-white',
      ].join(' ')}
    >
      <div className="fixed inset-0 -z-10 opacity-60 ">
        <ReactiveBackground/>
      </div>

      
      {/* 1. HERO / BILLBOARD */}
      <section className="relative p-4 sm:p-6 lg:p-10">
        <ServicesBillboard
          themeKey={themeKey}
          headline="Digital Infrastructure"
          description="I build high-performance web systems for Spokane businesses. From pixel-perfect marketing sites to complex data dashboards."
          contactHref={contactHref()}
          faqHref="/services/faq"
        />        
        
        {/* Local Context Badge - "Server Status" Vibe */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 px-3 py-1.5 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400 uppercase tracking-wide">
              Based in Spokane, WA
            </span>
          </div>
          <Link href="/spokane-web-developer" className="text-xs font-medium text-neutral-500 hover:text-black dark:hover:text-white underline decoration-neutral-300 dark:decoration-neutral-700 underline-offset-4 transition-colors">
            See how I work with local businesses &rarr;
          </Link>
        </div>
      </section>

      {/* 2. BUNDLES (The Main Offer) */}
      <section className="my-8 sm:my-12 max-w-5xl mx-auto">
        <div className="px-4 mb-6 text-center ">
          <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Core Service Bundles
          </h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Packaged solutions for common business needs.
          </p>
        </div>
        <SpotlightBundles bundles={bundles} />
      </section>

      <div className="mx-auto max-w-5xl px-4 pb-20">
        
        {/* 3. ENGINEERING STANDARDS (Why it works) */}
        <section className="mb-16">
          <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30 p-6 sm:p-8">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-neutral-900 dark:text-white">The Engineering Standard</h2>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">Everything I build adheres to these four pillars.</p>
            </div>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: Zap, label: "Performance First", text: "Google ranks fast sites. I code for 95+ lighthouse scores." },
                { icon: Shield, label: "Secure by Default", text: "Enterprise-grade auth, encrypted databases, and auto-backups." },
                { icon: Cpu, label: "Clean Code", text: "Built on Next.js. No bloated plugins or drag-and-drop mess." },
                { icon: Server, label: "Managed Hosting", text: "I handle the servers, DNS, and updates so you don't have to." },
              ].map((item, i) => (
                <div key={i} className="flex flex-col gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm">
                    <item.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-neutral-900 dark:text-neutral-200">{item.label}</h3>
                    <p className="text-xs leading-relaxed text-neutral-600 dark:text-neutral-400 mt-1">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 4. A LA CARTE SERVICES GRID */}
        <section className="mb-20">
          <div className="flex items-end justify-between mb-6">
            <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">A La Carte Services</h2>
            <Link href="/contact" className="hidden sm:block text-sm font-medium text-emerald-600 hover:text-emerald-500 dark:text-emerald-400">
              Get a custom quote &rarr;
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s) => (
              <Link
                key={s.slug}
                href={`/services/${s.slug}`}
                className="group relative flex flex-col justify-between rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/50 p-5 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 hover:shadow-lg transition-all duration-300"
              >
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2 bg-neutral-100 dark:bg-neutral-800 rounded-lg p-1.5 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/20 transition-colors">
                      {getServiceIcons(s.slug).map((icon, i) => <span key={i}>{icon}</span>)}
                    </div>
                    {s.priceRange && (
                       <span className="text-[10px] font-bold tracking-wide uppercase text-neutral-400 border border-neutral-200 dark:border-neutral-800 px-2 py-1 rounded-md">
                         {s.priceRange}
                       </span>
                    )}
                  </div>
                  
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {s.title}
                  </h3>
                  <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2">
                    {s.summary}
                  </p>
                  
                  {s.tags && (
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {s.tags.slice(0, 3).map((t) => (
                        <span key={t} className="text-[10px] px-1.5 py-0.5 rounded border border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-500">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="mt-6 flex items-center text-xs font-semibold text-neutral-900 dark:text-white group-hover:translate-x-1 transition-transform">
                  View Details <ArrowRight className="ml-1 w-3 h-3" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* 5. FIT / QUALIFICATION (Green Light vs Red Light) */}
        <section className="grid md:grid-cols-2 gap-6 mb-20">
          {/* GOOD FIT */}
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-50/30 dark:bg-emerald-900/10 p-6">
            <h2 className="flex items-center gap-2 text-base font-bold text-neutral-900 dark:text-white mb-4">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
              </span>
              Who this is for
            </h2>
            <ul className="space-y-3">
              {[
                "You want a website that actually generates leads.",
                "You prefer a direct line to the developer (me).",
                "You value long-term stability over short-term hacks."
              ].map((item, i) => (
                <li key={i} className="flex gap-3 text-sm text-neutral-700 dark:text-neutral-300">
                  <Check className="h-4 w-4 mt-0.5 text-emerald-600 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* NOT A FIT */}
          <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/50 p-6 opacity-80">
             <h2 className="flex items-center gap-2 text-base font-bold text-neutral-900 dark:text-white mb-4">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-500">
                <XCircle className="w-4 h-4" />
              </span>
              Who this isn't for
            </h2>
            <ul className="space-y-3">
              {[
                "You need a $500 Wordpress template site.",
                "You want to micromanage every pixel.",
                "You need a team of 20 people for a massive enterprise app."
              ].map((item, i) => (
                <li key={i} className="flex gap-3 text-sm text-neutral-600 dark:text-neutral-400">
                  <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-neutral-300 dark:bg-neutral-700 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* 6. PROCESS MAP */}
        <section className="mb-12">
           <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-6">How we work together</h2>
           <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { step: "01", title: "Discovery", desc: "Goals & Scope" },
                { step: "02", title: "Design", desc: "UX & Visuals" },
                { step: "03", title: "Build", desc: "Code & Content" },
                { step: "04", title: "Launch", desc: "Deploy & Test" },
                { step: "05", title: "Growth", desc: "SEO & Support" },
              ].map((s, i) => (
                <div key={i} className="relative p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/50">
                   <span className="text-xs font-bold text-neutral-300 dark:text-neutral-700 block mb-2">{s.step}</span>
                   <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-200">{s.title}</h3>
                   <p className="text-xs text-neutral-500 mt-0.5">{s.desc}</p>
                </div>
              ))}
           </div>
        </section>

        {/* 7. FINAL CTA */}
        <ContactCTA />

      </div>
    </main>
  )
}
