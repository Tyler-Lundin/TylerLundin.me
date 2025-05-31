'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { siteConfig } from '@/config/site';
import MobileMenu from './MobileMenu';
import { Logo } from './Logo';
import { cn } from '@/lib/utils';

interface NavProps {
  isScrolled: boolean;
  setIsMenuOpen: (isOpen: boolean) => void;
}


function MobileMenuButton({ onClick, minimal }: { onClick: () => void; minimal?: boolean }) {
  const baseClasses = "lg:hidden text-gray-900 dark:text-white hover:blur-[2px] blur-[0px] transition-all duration-300 cursor-pointer ";
  const positionClasses = minimal 
    ? "absolute top-1/2 -translate-y-1/2  z-50 right-4 lg:right-8"
    : "absolute top-4 right-4 lg:right-8 z-50 text-black";

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${positionClasses}`}
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
  );
}

function LogoContainer({ children, isScrolled }: { children: React.ReactNode; isScrolled: boolean }) {
  return (
    <div className={`flex flex-col items-center justify-center transition-all duration-300 absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 lg:relative lg:top-0 lg:left-0 lg:translate-x-0 lg:translate-y-0 ${
      isScrolled ? 'opacity-0 -translate-y-20' : 'opacity-100 translate-y-0'
    }`}>
      {children}
    </div>
  );
}

function DesktopNav({ isScrolled, minimal }: { isScrolled?: boolean; minimal?: boolean }) {
    const pathname = usePathname();
    const baseClasses = "hidden py-4 lg:flex w-min mx-auto justify-center md:space-x-32";
  const fullNavClasses = `${baseClasses} py-1 transition-all duration-300 ${
    isScrolled ? 'opacity-0 -translate-y-20' : 'opacity-100'
  }`;

  function isCurrentLink(sectionType: string) {
    if (sectionType === 'home') {
      return pathname === '/';
    }
    return pathname === `/${sectionType}`;
  }
  

  return (
    <div className={minimal ? baseClasses : fullNavClasses}>
      {siteConfig.sections
        .map((section) => (
          <Link
            key={section.type}
            href={section.type === 'home' ? '/' : `/${section.type}`}
            className={cn(`text-gray-900 dark:text-white font-light text-md hover:blur-[2px] transition-all blur-[0px] duration-200`, {
              'text-indigo-600': section.type === 'hobbies'
            }, isCurrentLink(section.type) && 'blur-[2px] pointer-events-none')}
          >
            {section.headline}
          </Link>
        ))}
    </div>
  );
}

function InitialNav({ isScrolled, setIsMenuOpen }: NavProps) {
  return (
    <nav className="absolute inset-4 h-24 rounded-lg z-50 transition-all duration-500 bg-gradient-to-r from-blue-500/50 dark:from-pink-950/50 via-yellow-400/50 dark:via-blue-800/50 to-purple-500/50 dark:to-purple-900/75 backdrop-blur-[2px] pt-3">
      <div className="h-full">
        <MobileMenuButton onClick={() => setIsMenuOpen(true)} minimal/>
        
        <LogoContainer isScrolled={isScrolled}>
          <Logo />
        </LogoContainer>

        <hr className="w-auto border-[2px] hidden lg:block translate-y-1 border-white dark:border-black" />

        <DesktopNav isScrolled={isScrolled} />
      </div>
    </nav>
  );
}

function FixedNav({ isScrolled, setIsMenuOpen }: NavProps) {
  return (
    <div className={`fixed top-4 left-4 right-4 z-50 bg-gradient-to-r from-blue-500/50 dark:from-pink-950/50 via-yellow-400/50 dark:via-blue-800/50 to-purple-500/50 dark:to-purple-900/75 backdrop-blur-[2px] rounded-lg backdrop-blur-md border-b border-gray-200 dark:border-white/25 transition-all duration-300 ${
      isScrolled ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full'
    }`}>
      <div className="container px-4 h-12 flex items-center justify-between">
        <div className="relative z-[200] ">
          <Logo />
        </div>
        <DesktopNav minimal />
        <MobileMenuButton onClick={() => setIsMenuOpen(true)} minimal />
      </div>
    </div>
  );
}

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 150);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <InitialNav isScrolled={isScrolled} setIsMenuOpen={setIsMenuOpen} />
      <FixedNav isScrolled={isScrolled} setIsMenuOpen={setIsMenuOpen} />
      <MobileMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </>
  );
}
