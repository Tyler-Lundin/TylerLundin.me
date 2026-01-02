"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { aboutConfig } from "@/config/about";
import ContactCTA from "@/components/sections/ContactCTA";
import type { Project, ProjectMedia } from "@/types/projects";
import { Sora } from "next/font/google";
import Link from "next/link";

const sora = Sora({ subsets: ["latin"] });

// --- Animation Variants ---
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, delay, ease: "easeOut" } },
});

const scaleIn = (delay = 0) => ({
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.5, delay, ease: "easeOut" } },
});

type Props = { projects: Project[] };

/** * --------------------------------------------------------------------------------
 * HELPER COMPONENTS
 * --------------------------------------------------------------------------------
 */

// 1. Status Indicator (The "Pulse" Dot)
function StatusBadge({ status }: { status?: string }) {
  if (!status) return null;
  
  const normalized = status.toLowerCase();
  let colorClass = "bg-neutral-500 text-neutral-600 border-neutral-200";
  let dotClass = "bg-neutral-400";

  if (normalized.includes("accept") || normalized.includes("open")) {
    colorClass = "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20";
    dotClass = "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]";
  } else if (normalized.includes("limit")) {
    colorClass = "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20";
    dotClass = "bg-amber-500";
  } else if (normalized.includes("close")) {
    colorClass = "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20";
    dotClass = "bg-rose-500";
  }

  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${colorClass} text-xs font-semibold tracking-wide backdrop-blur-sm`}>
      <span className="relative flex h-2 w-2">
        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${dotClass}`}></span>
        <span className={`relative inline-flex rounded-full h-2 w-2 ${dotClass}`}></span>
      </span>
      {status}
    </span>
  );
}

// 2. Metrics Grid (Replaces the messy Marquee/Chip split)
function MetricsGrid({ stats }: { stats?: any[] }) {
  if (!stats?.length) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8 w-full">
      {stats.map((s, i) => (
        <div key={i} className="flex flex-col items-center justify-center p-3 rounded-xl border border-black/5 dark:border-white/5 bg-white/50 dark:bg-white/[0.02] hover:bg-white/80 dark:hover:bg-white/[0.05] transition-colors text-center">
          <span className="text-[10px] uppercase tracking-wider text-neutral-500 dark:text-neutral-400 font-bold">
            {s.label}
          </span>
          <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mt-0.5">
            {s.value || "Included"}
          </span>
        </div>
      ))}
    </div>
  );
}

// 3. Tech Stack Pill
function TechPill({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-medium border border-neutral-200 dark:border-neutral-800 bg-neutral-100/50 dark:bg-neutral-800/50 text-neutral-600 dark:text-neutral-300">
      {label}
    </span>
  );
}

/** * --------------------------------------------------------------------------------
 * MAIN SECTIONS
 * --------------------------------------------------------------------------------
 */

function HeroSection({ data }: { data: typeof aboutConfig }) {
  // Normalize Status String
  const statusLabel = useMemo(() => {
    const s = data.availability;
    if (s === "open") return "Accepting New Clients";
    if (s === "limited") return "Limited Availability";
    if (s === "closed") return "Fully Booked";
    return s;
  }, [data.availability]);

  return (
    <div className="relative pt-8 pb-16 sm:pt-12 sm:pb-24">
      {/* Background Gradient */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-neutral-100 via-white to-transparent dark:from-neutral-900 dark:via-black dark:to-transparent opacity-60 blur-3xl" />
      </div>

      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="flex flex-col-reverse md:flex-row items-center gap-10 md:gap-16">
          
          {/* Left: Text Content */}
          <motion.div {...fadeUp(0)} className="flex-1 text-center md:text-left">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-6">
              <StatusBadge status={statusLabel} />
              {data.location && (
                 <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
                   <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                   {data.location}
                 </span>
              )}
            </div>

            <h1 className={`${sora.className} text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-neutral-900 dark:text-white mb-4 text-balance`}>
              {data.title}
            </h1>
            
            <p className="text-lg sm:text-xl text-neutral-600 dark:text-neutral-300 leading-relaxed max-w-2xl mx-auto md:mx-0 mb-8 text-balance">
              {data.tagline}
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
               {/* Resume Button */}
              <a
                href="/documents/resume.pdf"
                download="tyler-lundin-resume.pdf"
                className="group relative inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-black font-semibold text-sm transition-transform active:scale-95 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                <span>Download Resume</span>
                <svg className="w-4 h-4 transition-transform group-hover:translate-y-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
              </a>
              
              <Link 
                href="/contact" 
                className="px-6 py-2.5 rounded-full border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-200 font-semibold text-sm hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
              >
                Let's Talk
              </Link>
            </div>

            {/* Metrics */}
            <MetricsGrid stats={data.stats as any} />
          </motion.div>

          {/* Right: Hero Image (Refined Glow) */}
          <motion.div {...scaleIn(0.2)} className="relative shrink-0 w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96">
            {/* The Tech Glow Ring */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-emerald-500/20 via-blue-500/20 to-purple-500/20 blur-2xl animate-pulse" />
            
            {/* Rotating border effect */}
            <motion.div 
              className="absolute -inset-1 rounded-full border border-dashed border-neutral-300/50 dark:border-neutral-700/50"
              animate={{ rotate: 360 }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            />
            
            <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-white dark:border-neutral-900 shadow-2xl">
              <Image 
                src={data.images?.[0]?.src ?? "/images/tyler.png"} 
                alt={data.images?.[0]?.alt ?? "Tyler"} 
                fill 
                className="object-cover" 
                priority 
              />
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}

function BioAndSkills({ data }: { data: typeof aboutConfig }) {
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-12 border-t border-neutral-100 dark:border-neutral-800/50">
      <div className="grid lg:grid-cols-3 gap-12">
        {/* Bio */}
        <motion.div {...fadeUp(0.1)} className="lg:col-span-2 space-y-6">
          <h2 className={`${sora.className} text-2xl font-bold text-neutral-900 dark:text-white`}>
            Background
          </h2>
          <div className="prose prose-neutral dark:prose-invert leading-relaxed text-neutral-600 dark:text-neutral-300">
            {data.intro?.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </motion.div>

        {/* Sidebar: Skills & Focus */}
        <motion.div {...fadeUp(0.2)} className="lg:col-span-1 space-y-8">
          
          {/* Focus List */}
          {data.highlights && (
            <div className="bg-neutral-50 dark:bg-neutral-900/50 rounded-2xl p-6 border border-neutral-100 dark:border-neutral-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-4">Core Focus</h3>
              <ul className="space-y-3">
                {data.highlights.map((h, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm font-medium text-neutral-700 dark:text-neutral-200">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                    {h}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Tech Stack */}
          {data.skills && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-4 px-1">Tech Stack</h3>
              <div className="flex flex-wrap gap-2">
                {data.skills.map((s) => <TechPill key={s} label={s} />)}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

function ProjectShowcase({ 
  highlights, 
  projects 
}: { 
  highlights?: { id?: string; name: string; role?: string; tagline?: string; href?: string }[];
  projects: Project[];
}) {
  if (!highlights?.length) return null;

  return (
    <div className="py-16 bg-neutral-50/50 dark:bg-white/[0.02] border-t border-neutral-100 dark:border-white/5">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <motion.div {...fadeUp(0)} className="mb-10 flex items-end justify-between">
           <div>
              <h2 className={`${sora.className} text-2xl font-bold text-neutral-900 dark:text-white`}>
                Selected Work
              </h2>
              <p className="text-sm text-neutral-500 mt-1">Recent production deployments</p>
           </div>
           <Link href="/projects" className="text-sm font-semibold text-neutral-900 dark:text-white hover:underline">
             View All &rarr;
           </Link>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {highlights.map((h, i) => {
             const proj = projects.find((p) => p.slug === h.id || p.id === h.id);
             // Fallback Logic
             const name = proj?.title || h.name;
             const tagline = h.tagline || proj?.tagline;
             const href = proj ? `/project/${proj.slug}` : h.href ?? "#";
             const media = proj?.media?.find(m => m.featured) || proj?.media?.[0];

             return (
               <motion.a
                 key={i}
                 {...fadeUp(0.1 + (i * 0.1))}
                 href={href}
                 className="group block relative overflow-hidden rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all hover:shadow-lg"
               >
                 <div className="aspect-[16/10] relative overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                    {media?.type === 'image' && (
                      <Image 
                        src={media.src} 
                        alt={media.alt || name} 
                        fill 
                        sizes="(min-width: 1024px) 50vw, 100vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    )}
                    {/* Gradient Overlay for Text Readability if needed, though we put text below now for cleanness */}
                 </div>
                 <div className="p-5">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h3 className="text-lg font-bold text-neutral-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{name}</h3>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1 line-clamp-2">{tagline}</p>
                      </div>
                      {/* Optional Arrow Icon */}
                      <div className="w-8 h-8 rounded-full border border-neutral-200 dark:border-neutral-700 flex items-center justify-center text-neutral-400 group-hover:bg-neutral-900 group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-all">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7M17 7H7M17 7V17"/></svg>
                      </div>
                    </div>
                    {proj?.tech && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {proj.tech.slice(0,3).map(t => (
                          <span key={t} className="text-[10px] font-medium text-neutral-500 border border-neutral-100 dark:border-neutral-800 px-2 py-0.5 rounded-full">{t}</span>
                        ))}
                      </div>
                    )}
                 </div>
               </motion.a>
             )
          })}
        </div>
      </div>
    </div>
  );
}

/** * --------------------------------------------------------------------------------
 * ROOT COMPONENT
 * --------------------------------------------------------------------------------
 */

export default function AboutFlow({ projects }: Props) {
  const data = aboutConfig;

  return (
    <section aria-label="About Tyler" className="min-h-screen bg-white dark:bg-black selection:bg-emerald-500/30">
      <HeroSection data={data} />
      <BioAndSkills data={data} />
      <ProjectShowcase highlights={data.projectHighlights} projects={projects} />
      <div className="py-12 border-t border-neutral-100 dark:border-neutral-900">
        <ContactCTA />
      </div>
    </section>
  );
}
