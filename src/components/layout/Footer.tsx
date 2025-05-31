import Link from 'next/link';
import { siteConfig } from '@/config/site';

export function Footer() {
  return (
    <footer className="relative bottom-0 left-0 right-0 z-50">
      {/* Backdrop blur */}
      <div className="absolute inset-0 backdrop-blur-md bg-white/30 dark:bg-black/30" />
      
      {/* Main footer content */}
      <div className="relative mx-4 mb-4 rounded-lg border border-white/10 dark:border-white/5 bg-white/50 dark:bg-black/50 shadow-2xl">
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
            <div className="flex items-center space-x-3 mb-1 pointer-events-none select-none">
              <div className="flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-mono text-black/40 dark:text-white/40">SYSTEM ONLINE</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                <span className="text-[10px] font-mono text-black/40 dark:text-white/40">NETWORK ACTIVE</span>
              </div>
            </div>

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