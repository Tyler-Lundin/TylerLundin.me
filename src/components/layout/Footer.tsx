import Link from 'next/link';
import { siteConfig } from '@/config/site';

export function Footer() {
  return (
    <footer className="bg-gradient-to-b from-gray-50 via-gray-50 to-gray-50/50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row justify-center md:justify-between items-center space-y-4 md:space-y-0">
          <p className="text-gray-600 text-center md:text-left">
            {siteConfig.footer.text}
          </p>
          <div className="flex space-x-6">
            {siteConfig.footer.links.map((link) => (
              <Link
                key={link.url}
                href={link.url}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
} 