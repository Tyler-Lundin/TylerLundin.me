'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { siteConfig } from '@/config/site';
import MobileMenu from './MobileMenu';
import { Logo } from './Logo';

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* Main Nav Container */}
      <nav className={`relative z-50 transition-all duration-500 bg-white/75 backdrop-blur-sm h-32`}>
        <div className="h-full">
          {/* Mobile Menu Button - Large Nav */}
          <button
            onClick={() => setIsMenuOpen(true)}
            className="md:hidden absolute top-4 right-4 z-50 text-black hover:text-gray-600 transition-colors duration-200"
            aria-label="Open menu"
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
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          {/* Large Logo Container */}
          <div className={`flex flex-col items-center justify-center transition-all duration-300 h-full relative ${
            isScrolled ? 'opacity-0' : 'opacity-100'
          }`}>
              <Logo />
          </div>

          {/* Desktop Navigation Links */}
          <div className={`hidden md:flex w-full bg-white/75 backdrop-blur-sm border-y border-gray-200 py-1 justify-center space-x-8 transition-all duration-300 ${
            isScrolled ? 'opacity-0 -translate-y-20' : 'opacity-100'
          }`}>
            {siteConfig.sections
              .filter(section => section.type !== 'hero')
              .map((section) => (
                <Link
                  key={section.type}
                  href={`/${section.type}`}
                  className="text-gray-600 hover:text-gray-900 transition-colors duration-200"
                >
                  {section.headline}
                </Link>
              ))}
          </div>
        </div>
      </nav>

      {/* Fixed Mini Navbar */}
      <div className={`fixed top-0 left-0 right-0 z-50 bg-white/75 backdrop-blur-sm border-b border-gray-200 transition-all duration-300 ${
        isScrolled ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full'
      }`}>
        <div className="container mx-auto px-4 h-12 flex items-center justify-between">
          {/* Small Logo */}
          <div className="absolute z-[200] top-1/2 -translate-y-1/2 left-4">
            <Logo />
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex w-full justify-center space-x-8">
            {siteConfig.sections
              .filter(section => section.type !== 'hero')
              .map((section) => (
                <Link
                  key={section.type}
                  href={`/${section.type}`}
                  className="text-gray-600 hover:text-gray-900 transition-colors duration-200"
                >
                  {section.headline}
                </Link>
              ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(true)}
            className="md:hidden text-gray-600 hover:text-gray-900 transition-colors duration-200 absolute top-1/2 -translate-y-1/2 right-4"
            aria-label="Open menu"
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
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <MobileMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </>
  );
} 