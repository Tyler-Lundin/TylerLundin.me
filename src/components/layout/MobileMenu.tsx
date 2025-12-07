'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { siteConfig } from '@/config/site';
import { Logo } from './Logo';
import { services } from '@/data/services';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
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
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 z-[900] ${
          isOpen ? 'opacity-100 right-64' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Slide-out Menu */}
      <div
        className={`fixed top-0 right-0 h-full w-64 bg-white/95 dark:invert backdrop-blur-sm shadow-lg z-[1000] transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="relative p-6 h-full flex flex-col">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-[1001] text-black hover:text-gray-600 transition-colors duration-200"
            aria-label="Close menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          {/* Logo */}
          <div className="mb-8 dark:invert">
            <Logo />
          </div>

          {/* Navigation Links */}
          <nav className="flex-1">
            <ul className="space-y-6">
              {siteConfig.sections.map((section) => (
                <li key={section.type}>
                  <Link
                    href={`/${section.type}`}
                    className="block text-lg text-black hover:text-gray-600 transition-colors duration-200"
                    onClick={onClose}
                  >
                    {section.headline}
                  </Link>
                </li>
              ))}

              {/* Services Group */}
              <li className="pt-2">
                <div className="text-xs uppercase tracking-wide text-neutral-500 mb-2">services</div>
                <ul className="space-y-2">
                  <li>
                    <Link
                      href="/services"
                      className="block text-base text-black hover:text-gray-600 transition-colors duration-200"
                      onClick={onClose}
                    >
                      Overview
                    </Link>
                  </li>
                  {services.map((s) => (
                    <li key={s.slug}>
                      <Link
                        href={`/services/${s.slug}`}
                        className="block pl-2 text-base text-black/90 hover:text-gray-600 transition-colors duration-200"
                        onClick={onClose}
                      >
                        {s.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </>
  );
} 
