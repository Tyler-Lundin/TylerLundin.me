"use client"
import Image from 'next/image'
import type { Testimonial } from '@/types/testimonials'
import { testimonials as defaultTestimonials } from '@/data/testimonials'
import { cn } from '@/lib/utils' // Helper assumed, or just use template literals

type Props = {
  testimonials?: Testimonial[]
  title?: string
  className?: string
}

export default function Testimonials({ testimonials = defaultTestimonials, title = 'Client Stories', className }: Props) {
  if (!testimonials?.length) return null

  const isSingle = testimonials.length === 1

  return (
    <section className={cn("w-full py-16", className)}>
      <div className="mx-auto max-w-6xl px-4">
        
        {/* Header - Only show distinct header if we have multiple cards (Single view has its own flow) */}
        {!isSingle && (
          <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
            <h2 className="max-w-md text-3xl font-black tracking-tighter text-neutral-900 dark:text-neutral-100 sm:text-4xl md:text-5xl">
              {title}
            </h2>
            <p className="max-w-xs text-sm text-neutral-500 dark:text-neutral-400 sm:text-right">
              Real feedback from founders and businesses I've worked with.
            </p>
          </div>
        )}

        {/* Dynamic Layout Switch */}
        {isSingle ? (
          <SingleTestimonial testimonial={testimonials[0]} title={title} />
        ) : (
          <MasonryGrid testimonials={testimonials} />
        )}

      </div>
    </section>
  )
}

// --- Layout 1: The "Hero" (Looks great when you only have one) ---
const SingleTestimonial = ({ testimonial, title }: { testimonial: Testimonial, title: string }) => {
  return (
    <div className="relative mx-auto flex max-w-4xl flex-col items-center text-center">
        
        {/* Subtle background decoration to fill space */}
        <div className="absolute inset-0 -z-10 scale-[0.8] rounded-full bg-gradient-to-tr from-neutral-200/40 to-transparent blur-3xl dark:from-neutral-800/40" />

        <div className="mb-6 rounded-full border border-black/5 bg-neutral-100 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-neutral-500 dark:border-white/10 dark:bg-neutral-900 dark:text-neutral-400">
            {title}
        </div>

        <blockquote className="relative">
             <span className="absolute -left-4 -top-6 text-7xl text-neutral-200 dark:text-neutral-800 sm:-left-8 sm:-top-8">“</span>
             <p className="text-2xl font-medium leading-normal text-neutral-900 dark:text-neutral-100 sm:text-3xl md:text-4xl">
                {testimonial.quote}
            </p>
            <span className="absolute -bottom-8 -right-4 text-7xl text-neutral-200 dark:text-neutral-800 sm:-right-8">”</span>
        </blockquote>

        <div className="mt-10 flex flex-col items-center justify-center gap-4">
            {testimonial.logoSrc && (
                 <div className="relative h-10 w-32 grayscale transition-all hover:grayscale-0">
                    <Image
                        src={testimonial.logoSrc}
                        alt={testimonial.logoAlt || "Company Logo"}
                        fill
                        className="object-contain"
                    />
                </div>
            )}
            
            <div className="flex items-center gap-3">
                 <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-200 text-lg font-bold text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                    {testimonial.author.charAt(0)}
                </div>
                <div className="text-left">
                    <div className="font-bold text-neutral-900 dark:text-white">
                        {testimonial.author}
                    </div>
                    <div className="text-sm text-neutral-500 dark:text-neutral-400">
                        {testimonial.role ? `${testimonial.role}, ` : ''}{testimonial.company}
                    </div>
                </div>
            </div>
        </div>
    </div>
  )
}

// --- Layout 2: The "Wall" (Looks great when you have many) ---
const MasonryGrid = ({ testimonials }: { testimonials: Testimonial[] }) => {
    return (
        <ul className="group columns-1 gap-6 space-y-6 md:columns-2 lg:columns-3">
          {testimonials.map((t) => (
            <li key={t.id} className="break-inside-avoid">
              <figure className="relative h-full rounded-2xl border border-neutral-200 bg-neutral-50 p-6 transition-all duration-500 hover:!opacity-100 hover:scale-[1.02] hover:shadow-xl group-hover:opacity-30 dark:border-neutral-800 dark:bg-neutral-900/50">
                <div className="pointer-events-none absolute right-6 top-6 select-none font-serif text-6xl text-neutral-200/50 dark:text-neutral-800/50">”</div>
                <div className="relative z-10 flex flex-col gap-6">
                  {t.logoSrc && (
                    <div className="relative h-6 w-24">
                      <Image src={t.logoSrc} alt={t.logoAlt || ""} fill className="object-contain object-left opacity-80 grayscale transition-all duration-300 group-hover:grayscale-0" />
                    </div>
                  )}
                  <blockquote className="text-lg font-medium leading-relaxed text-neutral-800 dark:text-neutral-200">"{t.quote}"</blockquote>
                  <figcaption className="mt-auto flex items-center gap-3 border-t border-neutral-200 pt-4 dark:border-neutral-800">
                     <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-900 text-xs font-bold text-white dark:bg-white dark:text-black">{t.author.charAt(0)}</div>
                    <div className="min-w-0">
                      <div className="font-bold text-neutral-900 dark:text-neutral-100">{t.author}</div>
                      {(t.company || t.role) && (
                        <div className="text-xs text-neutral-500 dark:text-neutral-400">
                            {t.role} {t.role && t.company && 'at'} <span className="font-medium text-neutral-700 dark:text-neutral-300">{t.company}</span>
                        </div>
                      )}
                    </div>
                  </figcaption>
                </div>
              </figure>
            </li>
          ))}
        </ul>
    )
}
