import Link from 'next/link';
import { siteConfig } from '@/config/site';

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-xl font-bold text-gray-900">
            {siteConfig.site_name}
          </Link>
          <nav className="hidden md:flex space-x-8">
            {siteConfig.sections.map((section) => (
              <Link
                key={section.type}
                href={`/${section.type}`}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                {section.headline}
              </Link>
            ))}
          </nav>
          <button className="md:hidden p-2">
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
    </header>
  );
} 