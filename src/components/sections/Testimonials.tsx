"use client"

import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { Testimonial } from '@/types/testimonials'
import { testimonials as defaultTestimonials } from '@/data/testimonials'
import { projects as allProjects } from '@/data/projects'
import ProjectsCard from '@/components/projects/ProjectsCard'
import { Quote, Star, CheckCircle2 } from 'lucide-react'

type Props = {
  testimonials?: Testimonial[]
  title?: string
  className?: string
}

export default function Testimonials({ 
  testimonials = defaultTestimonials, 
  title = 'Client Stories', 
  className 
}: Props) {
  if (!testimonials?.length) return null

  const isSingle = testimonials.length === 1

  return (
    <section className={cn("w-full pb-8 ", className)}>
      <div className="mx-auto max-w-5xl ">
        
        {/* Header - Only visible for the Grid View */}
        {!isSingle && (
          <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
            <h2 className="max-w-md text-3xl font-black tracking-tighter text-neutral-900 dark:text-white sm:text-4xl">
              {title}
            </h2>
            <div className="flex items-center gap-2 text-sm font-medium text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              <span>Verified feedback from real founders</span>
            </div>
          </div>
        )}

        {/* Layout Switch */}
        {isSingle ? (
          <SingleHero testimonial={testimonials[0]} />
        ) : (
          <MasonryGrid testimonials={testimonials} />
        )}

      </div>
    </section>
  )
}

// ----------------------------------------------------------------------
// LAYOUT 1: THE HERO (Refined "Command Center" Look)
// ----------------------------------------------------------------------

const SingleHero = ({ testimonial }: { testimonial: Testimonial }) => {
  // Logic: Try to find the specific project mentioned, otherwise standard view
  // Note: Adjust 'zevlin-bike' to whatever slug matches the project in your data
  const project = allProjects.find(p => p.slug === 'zevlin-bike' || p.id === 'zevlin-bike')

  return (
    <div className="relative overflow-hidden rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/30">
      
      {/* Background Decor (Grid + Glow) */}
      <div className="absolute inset-0 -z-10 opacity-[0.03] dark:opacity-[0.05]" 
           style={{ backgroundImage: `linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)`, backgroundSize: '40px 40px' }} 
      />
      <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-emerald-500/10 blur-3xl rounded-full pointer-events-none" />

      <div className="grid lg:grid-cols-12 gap-0 lg:gap-8">
        
        {/* LEFT COL: The Quote (Voice) */}
        <div className="lg:col-span-7 flex flex-col justify-center p-8 sm:p-12 lg:p-16 relative">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-900/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-emerald-700 dark:text-emerald-400 w-fit">
            <Star className="w-3 h-3 fill-current" />
            Client Spotlight
          </div>

          <blockquote className="relative z-10">
            <p className="text-md sm:text-xl lg:text-2xl font-light leading-[1.15] tracking-tight text-neutral-900 dark:text-white text-balance">
              “{testimonial.quote}”
            </p>
          </blockquote>

          <div className="mt-10 flex items-center gap-4">
            {testimonial.logoSrc ? (
              <div className="relative h-12 w-12 overflow-hidden rounded-full border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black p-2">
                <Image 
                  src={testimonial.logoSrc} 
                  alt={testimonial.author} 
                  fill 
                  className="object-contain" 
                />
              </div>
            ) : (
               <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800 font-bold text-neutral-500">
                 {testimonial.author[0]}
               </div>
            )}
            
            <div>
              <div className="font-bold text-neutral-900 dark:text-white text-lg leading-none mb-1">
                {testimonial.author}
              </div>
              <div className="text-sm text-neutral-500 dark:text-neutral-400">
                {testimonial.role} {testimonial.company && <span className="text-neutral-300 dark:text-neutral-600 px-1">/</span>} {testimonial.company}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COL: The Evidence (Project Card) */}
        <div className="lg:col-span-5 bg-neutral-50 dark:bg-black/40 border-t lg:border-t-0 lg:border-l border-neutral-200 dark:border-neutral-800 p-8 sm:p-12 flex flex-col justify-center">
          {project ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  Project Delivered
                </h3>
                <Link href={`/project/${project.slug}`} className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline">
                  View Case Study
                </Link>
              </div>
              
              {/* Scaled down version of existing card logic, or a custom mini-card */}
              <div className="relative h-90  w-full rounded-2xl overflow-hidden  group cursor-pointer">
                 {/* This just reuses your existing component logic but creates a container for it */}
                 <div className="absolute inset-0">
                    <ProjectsCard project={project} state="current" /> 
                 </div>
                 {/* Overlay to ensure clickability if ProjectsCard is complex */}
                 <Link href={`/project/${project.slug}`} className="absolute inset-0 z-20" />
              </div>

              <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Result: <span className="text-neutral-900 dark:text-white font-medium">{project.tagline || "A complete digital overhaul aimed at increasing conversion."}</span>
              </p>
            </div>
          ) : (
            // Fallback if no specific project is linked
            <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl">
              <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 flex items-center justify-center mb-4">
                 <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Project Complete</h3>
              <p className="text-neutral-500 text-sm mt-2 max-w-xs mx-auto">
                Delivered on time and budget. This client is currently on a maintenance retainer.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

// ----------------------------------------------------------------------
// LAYOUT 2: THE MASONRY GRID (Cleaned up)
// ----------------------------------------------------------------------

const MasonryGrid = ({ testimonials }: { testimonials: Testimonial[] }) => {
  return (
    <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
      {testimonials.map((t) => (
        <div key={t.id} className="break-inside-avoid">
          <figure className="group relative rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/40 p-6 transition-all duration-300 hover:border-emerald-500/30 hover:shadow-lg dark:hover:border-emerald-500/20">
            
            {/* Hover Glow */}
            <div className="absolute inset-0 rounded-2xl bg-emerald-500/0 transition-colors group-hover:bg-emerald-500/[0.02]" />

            <div className="relative z-10 flex flex-col gap-4">
              <div className="flex justify-between items-start">
                 {/* Logo / Avatar */}
                 {t.logoSrc ? (
                    <div className="relative h-8 w-24">
                       <Image src={t.logoSrc} alt={t.company || ""} fill className="object-contain object-left opacity-60 grayscale transition-all group-hover:opacity-100 group-hover:grayscale-0" />
                    </div>
                 ) : (
                    <div className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-xs font-bold text-neutral-500">{t.author[0]}</div>
                 )}
                 <Quote className="w-4 h-4 text-emerald-500/40" />
              </div>

              <blockquote className="text-base font-medium leading-relaxed text-neutral-700 dark:text-neutral-200">
                "{t.quote}"
              </blockquote>

              <div className="mt-2 flex items-center gap-3 border-t border-neutral-100 dark:border-neutral-800/50 pt-4">
                <div className="min-w-0">
                  <div className="font-bold text-sm text-neutral-900 dark:text-white">{t.author}</div>
                  {(t.company || t.role) && (
                    <div className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                      {t.role}, {t.company}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </figure>
        </div>
      ))}
    </div>
  )
}
