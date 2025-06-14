'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { siteConfig } from '@/config/site';
import MobileMenu from './MobileMenu';
import { Logo } from './Logo';
import { cn } from '@/lib/utils';

interface NavProps {
  bannerVisible: boolean;
  isScrolled: boolean;
  setIsMenuOpen: (isOpen: boolean) => void;
}

const MenuButton = ({ onClick, minimal }: { onClick: () => void; minimal?: boolean }) => {
  const position = minimal
    ? 'top-1/2 -translate-y-1/2 right-4 lg:right-8'
    : 'top-4 right-4 lg:right-8';

  return (
    <button
      onClick={onClick}
      className={cn(
        'lg:hidden text-gray-900 dark:text-white hover:blur-sm transition-all duration-300 cursor-pointer z-50 absolute',
        position
      )}
      aria-label="Open menu"
    >
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>
  );
};

const LogoWrapper = ({ children, isScrolled }: { children: React.ReactNode; isScrolled: boolean }) => (
  <div
    className={cn(
      'flex flex-col items-center justify-center transition-all duration-300 absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 lg:relative lg:top-0 lg:left-0 lg:translate-x-0 lg:translate-y-0',
      isScrolled ? 'opacity-0 -translate-y-20' : 'opacity-100 translate-y-0'
    )}
  >
    {children}
  </div>
);

const NavLinks = ({ isScrolled, minimal }: { isScrolled?: boolean; minimal?: boolean }) => {
  const pathname = usePathname();

  return (
    <div
      className={cn(
        'hidden lg:flex items-center justify-center space-x-12 mx-auto transition-all duration-300',
        minimal ? '' : isScrolled ? 'opacity-0 translate-y-20' : 'opacity-100'
      )}
    >
      {siteConfig.sections.map((section) => {
        const isActive = section.type === 'home' ? pathname === '/' : pathname === `/${section.type}`;
        return (
          <Link
            key={section.type}
            href={section.type === 'home' ? '/' : `/${section.type}`}
            className={cn(
              'text-gray-900 dark:text-white font-light text-md transition-all duration-200',
              'hover:blur-[2px]',
              section.type === 'projects' && 'text-indigo-600 dark:text-emerald-500',
              isActive && 'blur-[2px] pointer-events-none'
            )}
          >
            {section.headline}
          </Link>
        );
      })}
    </div>
  );
};

const PrimaryNav = ({ isScrolled, setIsMenuOpen }: NavProps) => (
  <nav className="absolute inset-4 h-24 rounded-lg z-50 bg-gradient-to-r from-blue-500/50 dark:from-pink-950/50 via-yellow-400/50 dark:via-blue-800/50 to-purple-500/50 dark:to-purple-900/75 backdrop-blur-sm transition-all duration-500 grid items-center">
    <div className="h-full items-center grid relative">
      <MenuButton onClick={() => setIsMenuOpen(true)} minimal />
      <LogoWrapper isScrolled={isScrolled}>
        <Logo />
      </LogoWrapper>
      <NavLinks isScrolled={isScrolled} />
    </div>
  </nav>
);

const StickyNav = ({ bannerVisible, isScrolled, setIsMenuOpen }: NavProps) => (
  <div
    className={cn(
      'fixed left-4 right-4 z-50 bg-gradient-to-r from-blue-500/50 dark:from-pink-950/50 via-yellow-400/50 dark:via-blue-800/50 to-purple-500/50 dark:to-purple-900/75 backdrop-blur-md rounded-lg border-b border-gray-200 dark:border-white/25 transition-all duration-300',
      bannerVisible ? 'top-8' : 'top-6',
      isScrolled ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full'
    )}
  >
    <span className="absolute bottom-0 left-1 right-1 rounded-lg h-[40px] bg-gradient-to-t from-white/25 dark:from-black via-transparent to-transparent" />
    <span className="absolute top-0 left-1 right-1 rounded-lg h-[40px] bg-gradient-to-b from-white/25 dark:from-black via-transparent to-transparent" />
    <div className="container px-4 h-12 flex items-center justify-between">
      <Logo />
      <NavLinks minimal />
      <MenuButton onClick={() => setIsMenuOpen(true)} minimal />
    </div>
  </div>
);

export function Navbar({ bannerVisible }: { bannerVisible: boolean }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 150);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <PrimaryNav bannerVisible={bannerVisible} isScrolled={isScrolled} setIsMenuOpen={setIsMenuOpen} />
      <StickyNav bannerVisible={bannerVisible} isScrolled={isScrolled} setIsMenuOpen={setIsMenuOpen} />
      <MobileMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </>
  );
}
