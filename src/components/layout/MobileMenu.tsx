'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { siteConfig } from '@/config/site';
import { Logo } from './Logo';
import { services } from '@/data/services';
import { usePathname } from 'next/navigation';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const pathname = usePathname();
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1000]">
          {/* Backdrop */}
          <motion.button
            aria-label="Close menu"
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            onClick={onClose}
          />

          {/* Panel: full-screen on mobile, sheet on md+ */}
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            className="absolute inset-0 w-full md:inset-auto md:top-0 md:right-0 md:h-full md:w-[360px] md:max-w-[90vw] bg-white/95 dark:bg-neutral-950/95 backdrop-blur-sm shadow-xl md:rounded-l-xl will-change-transform"
          >
            <div className="relative p-6 h-full flex flex-col">
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-neutral-900 dark:text-neutral-100/90 hover:opacity-80 transition-opacity"
                aria-label="Close menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Logo */}
              <div className="mb-8">
                <Logo />
              </div>

              {/* Navigation Links */}
              <nav className="flex-1 overflow-y-auto">
                <ul className="space-y-6">
                  <li>
                    <div className="text-xs uppercase tracking-wide text-center text-neutral-500 dark:text-neutral-400 mb-2">Browse</div>
                    <ul className="space-y-2">
                      {siteConfig.sections.map((section, i) => (
                        <motion.li key={section.type} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18, delay: 0.02 * i }}>
                          {(() => {
                            const href = section.type === 'home' ? '/' : `/${section.type}`;
                            const isActive = pathname === href;
                            return (
                              <Link
                                href={href}
                                aria-current={isActive ? 'page' : undefined}
                                className="group relative flex items-center justify-between rounded-md border border-transparent px-3 py-3.5 hover:bg-neutral-100/60 dark:hover:bg-neutral-800/60 hover:border-black/10 dark:hover:border-white/10 transition-colors"
                                onClick={onClose}
                              >
                                <span className="relative pl-3">
                                  <span className={
                                    isActive
                                      ? 'text-base font-medium text-emerald-600 dark:text-emerald-500'
                                      : 'text-base font-medium text-neutral-900 dark:text-neutral-100'
                                  }>
                                    {section.headline}
                                  </span>
                                  <span className={
                                    [
                                      'pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 h-6 w-[3px] rounded-full bg-emerald-500',
                                      'origin-top scale-y-0 opacity-0 transition-all duration-300 ease-out',
                                      'group-hover:scale-y-100 group-hover:opacity-100',
                                      isActive ? 'scale-y-100 opacity-100' : ''
                                    ].join(' ')
                                  } />
                                </span>
                                <svg width="16" height="16" viewBox="0 0 24 24" className="transition-all duration-300 opacity-60 group-hover:opacity-90 text-neutral-700 dark:text-neutral-300 group-hover:translate-x-0.5"><path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
                              </Link>
                            );
                          })()}
                        </motion.li>
                      ))}
                    </ul>
                  </li>

                  {/* Services Group */}
                  <li className="pt-2">
                    <div className="text-xs uppercase text-center tracking-wide text-neutral-500 dark:text-neutral-400 mb-2">Services</div>
                    <ul className="space-y-2">
                      {/* Parent services index link */}
                      <motion.li initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18, delay: 0.02 }}>
                        {(() => {
                          const isActive = pathname === '/services' || pathname?.startsWith('/services/');
                          return (
                            <Link
                              href="/services"
                              className="group relative flex items-center justify-between rounded-md border border-transparent px-3 py-3.5 hover:bg-neutral-100/60 dark:hover:bg-neutral-800/60 hover:border-black/10 dark:hover:border-white/10 transition-colors"
                              onClick={onClose}
                            >
                              <span className="relative pl-3">
                                <span className={
                                  isActive
                                    ? 'text-base font-medium text-emerald-600 dark:text-emerald-500'
                                    : 'text-base font-medium text-neutral-900 dark:text-neutral-100'
                                }>
                                  All Services
                                </span>
                                <span className={
                                  [
                                    'pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 h-6 w-[3px] rounded-full bg-emerald-500',
                                    'origin-top scale-y-0 opacity-0 transition-all duration-300 ease-out',
                                    'group-hover:scale-y-100 group-hover:opacity-100',
                                    isActive ? 'scale-y-100 opacity-100' : ''
                                  ].join(' ')
                                } />
                              </span>
                              <svg width="16" height="16" viewBox="0 0 24 24" className="transition-all duration-300 opacity-60 group-hover:opacity-90 text-neutral-700 dark:text-neutral-300 group-hover:translate-x-0.5"><path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            </Link>
                          );
                        })()}
                      </motion.li>
                      <li><div className="h-[1px] mx-1 bg-neutral-200/60 dark:bg-neutral-800/60" /></li>
                      {services.map((s, i) => (
                        <motion.li key={s.slug} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18, delay: 0.04 + 0.02 * i }}>
                          {(() => {
                            const href = `/services/${s.slug}`;
                            const isActive = pathname === href;
                            return (
                              <Link
                                href={href}
                                className="group relative block rounded-md border border-transparent p-3 hover:bg-neutral-100/60 dark:hover:bg-neutral-800/60 hover:border-black/10 dark:hover:border-white/10 transition-colors"
                                onClick={onClose}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="relative pl-3">
                                    <span className={
                                      isActive
                                        ? 'text-sm font-medium text-emerald-600 dark:text-emerald-500'
                                        : 'text-sm font-medium text-neutral-900 dark:text-neutral-100'
                                    }>
                                      {s.title}
                                    </span>
                                    <span className={
                                      [
                                        'pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-full bg-emerald-500',
                                        'origin-top scale-y-0 opacity-0 transition-all duration-300 ease-out',
                                        'group-hover:scale-y-100 group-hover:opacity-100',
                                        isActive ? 'scale-y-100 opacity-100' : ''
                                      ].join(' ')
                                    } />
                                  </span>
                                  <svg width="16" height="16" viewBox="0 0 24 24" className="transition-all duration-300 opacity-60 group-hover:opacity-90 text-neutral-700 dark:text-neutral-300 group-hover:translate-x-0.5"><path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                </div>
                                {('summary' in s) && (
                                  <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2">{(s as any).summary}</p>
                                )}
                              </Link>
                            );
                          })()}
                        </motion.li>
                      ))}
                    </ul>
                  </li>
                </ul>
              </nav>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
