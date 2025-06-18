'use client';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface MainFocusBannerProps {
  title: string;
  description: string;
  features: string[];
  link: string;
}

export function MainFocusBanner({ title, description, features, link }: MainFocusBannerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7 }}
      className="mb-24 md:mb-32"
    >
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className="group block relative overflow-hidden rounded-2xl md:rounded-3xl bg-gradient-to-br from-pink-600 via-purple-600 to-rose-600 dark:from-pink-500 dark:via-purple-500 dark:to-rose-500 text-white shadow-2xl hover:shadow-purple-500/50 dark:hover:shadow-purple-400/60 transition-all duration-500 ease-in-out transform hover:-translate-y-2"
      >
        {/* Background Image */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 1 }}
          className="absolute inset-0"
        >
          <Image
            src="/images/web-dev-light.png"
            alt="Web Development"
            fill
            className="object-cover object-center dark:hidden blur-[3px]"
            priority
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <Image
            src="/images/web-dev-dark.png"
            alt="Web Development"
            fill
            className="hidden dark:block object-cover object-center blur-[3px]"
            priority
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </motion.div>
        <div className="absolute inset-0 bg-white/70 dark:bg-black/70" />

        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent" />
          <div className="absolute inset-0 bg-[linear-gradient(45deg,_transparent_25%,_rgba(255,255,255,0.1)_50%,_transparent_75%)] bg-[length:20px_20px]" />
        </div>

        {/* Content */}
        <div className="relative p-6 md:p-12">
          {/* Header Section */}
          <div className="flex flex-col items-center text-center md:text-left md:flex-row md:items-start gap-6 md:gap-8 mb-8 md:mb-12 text-black dark:text-white">
            <div className="flex-grow">
              <h3 className="text-2xl md:text-5xl font-black mb-3 md:mb-4 tracking-tight">
                {title}
              </h3>
              <p className="text-base md:text-2xl opacity-90 max-w-3xl leading-relaxed">
                {description}
              </p>
            </div>
          </div>

          {/* Features */}
          <div className="hidden md:flex flex-wrap gap-2 md:gap-3 mb-8 md:mb-12">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="transform group-hover:scale-[1.02] transition-transform duration-300"
              >
                <span className="text-sm font-medium text-black/90 dark:text-white/90">
                  {feature}
                  {idx < features.length - 1 && <span className="mx-2 text-black/75 dark:text-white/75">•</span>}
                </span>
              </div>
            ))}
          </div>

          {/* CTA Button */}
          <div className="flex items-center justify-center md:justify-end">
            <div className="inline-flex items-center gap-2 md:gap-3 px-4 md:px-6 py-2 md:py-3 rounded-full transition-all duration-300">
              <span className="md:text-xl font-bold text-black/90 dark:text-white/90">View All Projects</span>
              <svg
                className="w-5 h-5 md:w-6 md:h-6 text-black/90 dark:text-white/90 transform group-hover:translate-x-1 transition-transform duration-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </div>
          </div>
        </div>
      </a>
    </motion.div>
  );
} 