"use client";

import Link from 'next/link';

export default function ContactFAB() {
  return (
    <div className="fixed right-4 bottom-4 z-[9999]">
      <Link
        href="/contact"
        aria-label="Contact"
        className="group inline-flex h-12 w-12 items-center justify-center rounded-full bg-neutral-900 text-white shadow-lg ring-1 ring-black/10 hover:ring-black/20 transition-all duration-200 hover:shadow-xl hover:scale-[1.03] dark:bg-white dark:text-black dark:ring-white/20 dark:hover:ring-white/30 backdrop-blur supports-[backdrop-filter]:bg-neutral-900/90 dark:supports-[backdrop-filter]:bg-white/90"
        style={{ paddingBottom: 'max(0px, env(safe-area-inset-bottom))' }}
      >
        <svg
          aria-hidden="true"
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="transition-transform duration-200 group-hover:-translate-y-0.5"
        >
          <path d="M4 6h16v12H4z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M22 6l-10 7L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </Link>
    </div>
  );
}
