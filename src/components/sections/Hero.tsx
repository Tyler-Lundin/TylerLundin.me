import Image from 'next/image';
import Link from 'next/link';
import { HeroSection } from '@/types/site';

interface HeroProps {
  section: HeroSection;
}

export function Hero({ section }: HeroProps) {
  return (
    <section className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-amber-50 flex items-center relative overflow-hidden">
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
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-block bg-white/50 backdrop-blur-sm px-6 py-2 rounded-full border border-indigo-100 shadow-sm">
                <p className="text-indigo-600 font-medium">
                  {section.tagline || "Hey there! 👋"}
                </p>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900">
                {section.headline}
              </h1>
            </div>
            <p className="text-xl text-gray-600 leading-relaxed">
              {section.subheadline}
            </p>
            <div className="flex gap-4">
              <Link
                href="/projects"
                className="inline-flex items-center px-6 py-3 rounded-full bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-xl hover:-translate-y-0.5 transform duration-200"
              >
                {section.cta.label}
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center px-6 py-3 rounded-full bg-white text-gray-700 font-medium hover:bg-gray-50 transition-colors border border-gray-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transform duration-200"
              >
                Say Hello
                <span className="ml-2 animate-wave">👋</span>
              </Link>
            </div>
          </div>

          {/* Image/Visual Side */}
          <div className="relative">
            <div className="relative w-full h-[600px] max-w-md mx-auto">
              {/* Fun geometric background shapes */}
              <div className="absolute inset-0 transform rotate-6">
                <div className="absolute inset-0 bg-amber-200 rounded-3xl" />
              </div>
              <div className="absolute inset-0 transform -rotate-3">
                <div className="absolute inset-0 bg-indigo-200 rounded-3xl" />
              </div>
              {/* Profile image */}
              <div className="relative z-10 h-full rounded-3xl overflow-hidden border-2 border-white shadow-2xl transform hover:rotate-2 transition-transform duration-300">
                <Image
                  src="/images/pro-tyler.jpg"
                  alt="Tyler Lundin"
                  fill
                  className="object-cover sepia object-[50%_60%] scale-110 -rotate-[2deg]"
                  priority
                />
              </div>
            </div>

            {/* Tech stack icons floating around */}
            <div className="absolute -right-4 top-1/4 bg-white p-3 rounded-full shadow-lg animate-float">
              <svg className="w-6 h-6 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm-.84 4.67h1.68v1.68h-1.68V4.67zm5.477 11.632l-1.19 1.19-8.485-8.485 1.19-1.19 8.485 8.485z"/>
              </svg>
            </div>
            <div className="absolute -left-4 bottom-1/4 bg-white p-3 rounded-full shadow-lg animate-float delay-100">
              <svg className="w-6 h-6 text-orange-500" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12c0 6.627-5.373 12-12 12S0 18.627 0 12 5.373 0 12 0s12 5.373 12 12zm-4.125-1.375l-.001-.001-3.375-3.375-1.5 1.5 3.375 3.375.001.001.374.374-.374.374-.001.001-3.375 3.375-1.5-1.5 3.375-3.375.001-.001.374-.374-.374-.374z"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 