import Link from 'next/link';
import { siteConfig } from '@/config/site';
import { StatusIndicator } from '../StatusIndicator';

export function Footer() {
  return (
    <footer className="relative bottom-0 left-0 right-0 z-50">
      {/* Backdrop blur */}      
      {/* Main footer content */}
      <div className="relative mx-4 rounded-lg border border-white/10 dark:border-white/5 bg-white/50 dark:bg-black/50">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Grid lines */}
          <div className="absolute inset-0 bg-grid-white/5 dark:bg-grid-black/5" style={{ 
            backgroundSize: '20px 20px',
            maskImage: 'linear-gradient(to bottom, transparent, black)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent, black)'
          }} />
          
          {/* Glowing line */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col items-center space-y-2">
            {/* Status indicators */}
            <StatusIndicator />

            {/* Main content */}
            <div className="flex flex-col md:flex-row items-center justify-between w-full">
              <p className="text-[11px] font-mono tracking-wider text-black/50 dark:text-white/50">
                {siteConfig.footer.text}
              </p>
              <div className="flex space-x-6 mt-1 md:mt-0">
                {siteConfig.footer.links.map((link) => (
                  <Link
                    key={link.url}
                    href={link.url}
                    className="text-[11px] font-mono tracking-wider text-black/50 dark:text-white/50 hover:blur-[2px] transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Bottom decorative line */}
            <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent mt-2" />
          </div>
        </div>
      </div>
    </footer>
  );
} 