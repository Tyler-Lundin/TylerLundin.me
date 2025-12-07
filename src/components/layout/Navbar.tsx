'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { siteConfig } from '@/config/site';
import MobileMenu from './MobileMenu';
import { Logo } from './Logo';
import { cn } from '@/lib/utils';
import { BrainSticker } from '../ui/BrainSticker';
import { MailSticker } from '../ui/MailSticker';
import { Section } from '@/types/site';

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
        'lg:hidden text-gray-900 dark:text-white hover:opacity-75 transition-opacity duration-200 cursor-pointer z-50 absolute',
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
      'flex flex-col items-center justify-center transition-transform duration-300 absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 lg:relative lg:top-0 lg:left-0 lg:translate-x-0 lg:translate-y-0',
      isScrolled ? '-translate-y-20 opacity-0' : 'translate-y-0 opacity-100'
    )}
  >
    {children}
  </div>
);

const NavLinks = ({ isScrolled, minimal }: { isScrolled?: boolean; minimal?: boolean }) => {
  const pathname = usePathname();

  const RenderContent = (section: Section) => {
    // if (section.type === 'contact') {
    //   return (<div className="flex gap-2 group">
    //           <h6 className="group-hover group-hover:max-width-full max-width-0">{section.headline}</h6>
    //           <MailSticker />
    //           </div>)
    // }
    // if (section.type === 'posts') {
    //   return <BrainSticker />;
    // }
    return section.headline;
  };

  return (
    <div
      className={cn(
        'hidden lg:flex items-center justify-center space-x-12 mx-auto transition-all duration-150',
        minimal ? '' : isScrolled ? 'opacity-0' : 'opacity-100'
      )}
    >
      {siteConfig.sections.map((section) => {
        const isActive = section.type === 'home' ? pathname === '/' : pathname === `/${section.type}`;
        return (
          <Link
            key={section.type}
            href={section.type === 'home' ? '/' : `/${section.type}`}
            className={cn(
              'text-gray-900 dark:text-white font-light text-md transition-opacity duration-200',
              'hover:opacity-75',
              section.type === 'projects' && 'text-indigo-600 dark:text-emerald-500',
              isActive && 'opacity-25 pointer-events-none'
            )}
          >
            {RenderContent(section)}
          </Link>
        );
      })}
    </div>
  );
};

const PrimaryNav = ({ isScrolled, setIsMenuOpen }: NavProps) => (
  <nav style={{opacity: isScrolled?0:100}} className="absolute inset-4 h-24 rounded-lg z-50 bg-gradient-to-r from-neutral-50/70 via-neutral-100/30 to-neutral-200/20 dark:from-neutral-900/60 dark:via-neutral-800/40 dark:to-neutral-700/30 border border-black/10 dark:border-white/10 backdrop-blur-sm transition-opacity duration-300 grid items-center">
    <div className="h-full items-center grid relative">
      <MenuButton onClick={() => setIsMenuOpen(true)} minimal />
      <LogoWrapper isScrolled={isScrolled}>
        <Logo />
      </LogoWrapper>
      <NavLinks isScrolled={isScrolled} />
    </div>
    <span className="absolute top-1/2 left-0 right-0 h-[1px] bg-neutral-300/40 dark:bg-neutral-700/40 hidden lg:block" />
  </nav>
);

const StickyNav = ({ bannerVisible, isScrolled, setIsMenuOpen }: NavProps) => (
  <div
    className={cn(
      'fixed left-4 right-4 z-50 bg-gradient-to-r from-neutral-50/70 via-neutral-100/30 to-neutral-200/20 dark:from-neutral-900/60 dark:via-neutral-800/40 dark:to-neutral-700/30 backdrop-blur-sm rounded-lg border border-black/10 dark:border-white/10 transition-transform duration-300',
      bannerVisible ? 'top-8' : 'top-4',
      isScrolled ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
    )}
  >
    <span className="absolute bottom-0 left-0 right-0 pointer-events-none rounded-lg h-[40px] bg-gradient-to-t from-neutral-200/25 dark:from-neutral-900/25 via-transparent to-transparent" />
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

  const handleScroll = useCallback(() => {
    const scrollPosition = window.scrollY;
    if (scrollPosition > 4 && !isScrolled) {
      setIsScrolled(true);
    } else if (scrollPosition <= 4 && isScrolled) {
      setIsScrolled(false);
    }
  }, [isScrolled]);



  
  useEffect(() => {
    let ticking = false;
    
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [handleScroll]);

  return (
    <motion.span 
      transition={{ duration: 1.8, delay: 0.5, ease: [0, 0.75, 0.2, 1]}}
      initial={{ opacity: 0 }} animate={{opacity:100}}
    >
      <PrimaryNav bannerVisible={bannerVisible} isScrolled={isScrolled} setIsMenuOpen={setIsMenuOpen} />
      <StickyNav bannerVisible={bannerVisible} isScrolled={isScrolled} setIsMenuOpen={setIsMenuOpen} />
      <MobileMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </motion.span>
  );
}
