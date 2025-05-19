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
  const baseClasses = "lg:hidden text-gray-900 hover:blur-[2px] blur-[0px] transition-all duration-300 cursor-pointer dark:invert";
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
    <div className={`flex flex-col items-center justify-center transition-all duration-300 h-full relative ${
      isScrolled ? 'opacity-0 -translate-y-20' : 'opacity-100 translate-y-0'
    }`}>
      {children}
    </div>
  );
}

function DesktopNav({ isScrolled, minimal }: { isScrolled?: boolean; minimal?: boolean }) {
    const pathname = usePathname();
    const baseClasses = "hidden lg:flex w-full justify-center space-x-8";
  const fullNavClasses = `${baseClasses} bg-white/75 dark:bg-black/75 backdrop-blur-sm border-y border-gray-200 dark:border-white/25 py-1 transition-all duration-300 ${
    isScrolled ? 'opacity-0 -translate-y-20' : 'opacity-100'
  }`;

  function isCurrentLink(sectionType: string) {
    return pathname === `/${sectionType}`;
  }
  

  return (
    <div className={minimal ? baseClasses : fullNavClasses}>
      {siteConfig.sections
        .filter(section => section.type !== 'hero')
        .map((section) => (
          <Link
            key={section.type}
            href={`/${section.type}`}
            className={cn(`text-gray-900 dark:text-white font-thin text-md lg:text-lg hover:blur-[2px] transition-all blur-[0px] duration-200`, {
              'text-indigo-600': section.type === 'services'
            }, isCurrentLink(section.type) && 'blur-[2px] opacity-50')}
          >
            {section.headline}
          </Link>
        ))}
    </div>
  );
}

function MainNav({ isScrolled, setIsMenuOpen }: NavProps) {
  return (
    <nav className="relative z-50 transition-all duration-500 bg-gradient-to-r from-blue-700/25 dark:from-blue-950/75 via-yellow-700/25 dark:via-yellow-950/75 to-purple-700/25 dark:to-purple-950/75 backdrop-blur-sm h-32">
      <div className="h-full">
        <MobileMenuButton onClick={() => setIsMenuOpen(true)} minimal/>
        
        <LogoContainer isScrolled={isScrolled}>
          <Logo />
        </LogoContainer>

        <DesktopNav isScrolled={isScrolled} />
      </div>
    </nav>
  );
}

function MiniNav({ isScrolled, setIsMenuOpen }: NavProps) {
  return (
    <div className={`fixed top-0 left-0 right-0 z-50 bg-white/75 dark:bg-black/25 backdrop-blur-md border-b border-gray-200 dark:border-white/25 transition-all duration-300 ${
      isScrolled ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full'
    }`}>
      <div className="container mx-auto px-4 h-12 flex items-center justify-between">
        <div className="absolute z-[200] top-1/2 -translate-y-1/2 left-4">
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
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <MainNav isScrolled={isScrolled} setIsMenuOpen={setIsMenuOpen} />
      <MiniNav isScrolled={isScrolled} setIsMenuOpen={setIsMenuOpen} />
      <MobileMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </>
  );
}
