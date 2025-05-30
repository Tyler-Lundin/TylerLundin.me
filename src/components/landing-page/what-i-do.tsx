import { DevicePhoneMobileIcon, BoltIcon, CodeBracketIcon } from "@heroicons/react/24/outline";

export default function WhatIDo() {
  return (
    <section id="what-i-do" className="py-24 bg-neutral-100 dark:bg-neutral-950/50 backdrop-blur-sm max-w-7xl mx-auto rounded-lg">
      <div className="max-w-6xl mx-auto px-6 space-y-20">
        <h2 className="text-4xl sm:text-5xl font-semibold text-center tracking-tight text-neutral-800 dark:text-neutral-100">
          How I Bring Value
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Mobile-First Development */}
          <div className="p-8 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-indigo-500/50 dark:hover:border-indigo-500/50 transition-all group shadow-sm hover:shadow-lg">
            <div className="flex flex-col h-full">
              <div className="mb-6">
                <div className="h-12 w-12 rounded-lg bg-indigo-500/10 dark:bg-indigo-500/20 flex items-center justify-center mb-5 group-hover:bg-indigo-500/15 dark:group-hover:bg-indigo-500/30 transition-all">
                  <DevicePhoneMobileIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-neutral-800 dark:text-neutral-100">Responsive & Adaptive Design</h3>
                <p className="text-neutral-600 dark:text-neutral-400 text-sm leading-relaxed mb-4">
                  Crafting experiences that look and perform beautifully on any device, ensuring broad accessibility and user satisfaction.
                </p>
              </div>
              
              <div className="mt-auto">
                <h4 className="text-xs text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-3 font-medium">Key Features</h4>
                <ul className="space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
                  <li className="flex items-start">
                    <span className="text-indigo-500 dark:text-indigo-400 mr-2">✓</span>
                    <span>Fluid layouts adapting to all screen sizes</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-indigo-500 dark:text-indigo-400 mr-2">✓</span>
                    <span>Touch-first interactions for mobile usability</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-indigo-500 dark:text-indigo-400 mr-2">✓</span>
                    <span>Cross-browser compatibility and testing</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Lightning Fast Performance */}
          <div className="p-8 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-blue-500/50 dark:hover:border-blue-500/50 transition-all group shadow-sm hover:shadow-lg">
            <div className="flex flex-col h-full">
              <div className="mb-6">
                <div className="h-12 w-12 rounded-lg bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center mb-5 group-hover:bg-blue-500/15 dark:group-hover:bg-blue-500/30 transition-all">
                  <BoltIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-neutral-800 dark:text-neutral-100">Optimized Performance</h3>
                <p className="text-neutral-600 dark:text-neutral-400 text-sm leading-relaxed mb-4">
                  Building for speed and efficiency to enhance user engagement, improve SEO, and deliver a seamless experience.
                </p>
              </div>
              
              <div className="mt-auto">
                <h4 className="text-xs text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-3 font-medium">Core Practices</h4>
                <ul className="space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
                  <li className="flex items-start">
                    <span className="text-blue-500 dark:text-blue-400 mr-2">✓</span>
                    <span>Next.js for SSR and static site benefits</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 dark:text-blue-400 mr-2">✓</span>
                    <span>Efficient state management and rendering</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 dark:text-blue-400 mr-2">✓</span>
                    <span>Asset optimization and lazy loading</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Modern Tech Stack */}
          <div className="p-8 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 transition-all group shadow-sm hover:shadow-lg">
            <div className="flex flex-col h-full">
              <div className="mb-6">
                <div className="h-12 w-12 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center mb-5 group-hover:bg-emerald-500/15 dark:group-hover:bg-emerald-500/30 transition-all">
                  <CodeBracketIcon className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-neutral-800 dark:text-neutral-100">Scalable & Maintainable Code</h3>
                <p className="text-neutral-600 dark:text-neutral-400 text-sm leading-relaxed mb-4">
                  Leveraging modern tools and best practices to create robust, clean, and future-proof applications.
                </p>
              </div>
              
              <div className="mt-auto">
                <h4 className="text-xs text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-3 font-medium">Key Technologies</h4>
                <ul className="space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
                  <li className="flex items-start">
                    <span className="text-emerald-500 dark:text-emerald-400 mr-2">✓</span>
                    <span>React, Next.js, TypeScript</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-emerald-500 dark:text-emerald-400 mr-2">✓</span>
                    <span>Tailwind CSS for utility-first styling</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-emerald-500 dark:text-emerald-400 mr-2">✓</span>
                    <span>Supabase / Vercel for backend & hosting</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
