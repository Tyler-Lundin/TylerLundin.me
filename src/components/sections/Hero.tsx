import Link from 'next/link';
import { HeroSection } from '@/types/site';
import Image from 'next/image';

interface HeroProps {
  section: HeroSection;
}

export function Hero({ section }: HeroProps) {
  return (
    <section id="hero" className="min-h-[calc(100vh-4rem)] flex items-center relative overflow-hidden bg-gradient-to-b from-gray-300/90 to-white">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -right-4 -top-4 w-24 h-24 bg-amber-200 rounded-full opacity-20 animate-pulse" />
        <div className="absolute right-1/4 top-1/4 w-16 h-16 bg-indigo-200 rounded-full opacity-20 animate-pulse delay-75" />
        <div className="absolute left-1/3 bottom-1/4 w-20 h-20 bg-amber-200 rounded-full opacity-20 animate-pulse delay-150" />
        <div className="absolute w-full h-full bg-[radial-gradient(circle_at_30%_107%,rgba(253,292,45,0.05)_0%,rgba(34,90,245,0.05)_100%)]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div className="space-y-8 text-center md:text-left">
            <div className="space-y-4">
              {/* Mobile Profile Picture */}
              <div className="md:hidden flex justify-center mb-8">
                <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-white shadow-lg">
                  <Image
                    src="/images/professional.png"
                    alt="Tyler Lundin"
                    width={192}
                    height={192}
                    className="w-full h-full object-cover object-top"
                  />
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900">
                {section.headline}
              </h1>
            </div>
            <p className="text-xl text-gray-600 leading-relaxed">
              {section.subheadline}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Link
                href="/projects"
                className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-xl hover:-translate-y-0.5 transform duration-200"
              >
                {section.cta.label}
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-white text-gray-700 font-medium hover:bg-gray-50 transition-colors border border-gray-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transform duration-200"
              >
                Say Hello
                <span className="ml-2 animate-wave">👋</span>
              </Link>
            </div>
          </div>

          {/* Desktop Profile Picture */}
          <div className="hidden md:flex justify-center items-center">
            <div className="w-96 h-96 rounded-full overflow-hidden border-4 border-white shadow-xl">
              <Image
                src="/images/professional.png"
                alt="Tyler Lundin"
                width={384}
                height={384}
                className="w-full h-full object-cover object-top -rotate-[2deg]"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 