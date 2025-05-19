import { DevicePhoneMobileIcon, BoltIcon, CodeBracketIcon } from "@heroicons/react/24/outline";

export default function WhatIDo() {
  return (
    <section id="what-i-do" className="py-24 bg-neutral-100 dark:bg-neutral-950 dark:text-white">
      <div className="max-w-6xl mx-auto px-6 space-y-24">
        <h2 className="text-5xl font-semibold text-center tracking-tight text-black dark:text-white">
          What I Do
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Mobile-First Development */}
          <div className="p-8 rounded-2xl dark:bg-neutral-900 border border-neutral-800 hover:border-indigo-500/50 transition-all group">
            <div className="flex flex-col h-full">
              <div className="mb-6">
                <div className="h-14 w-14 rounded-xl bg-indigo-500/20 flex items-center justify-center mb-4 group-hover:bg-indigo-500/30 transition-all">
                  <DevicePhoneMobileIcon className="h-7 w-7 text-indigo-400" />
                </div>
                <h3 className="text-2xl font-semibold mb-3">Mobile-First Development</h3>
                <p className="text-neutral-700 dark:text-white mb-4">
                  Every project starts with mobile. Designs are built to scale seamlessly across all screen sizes for a smooth user experience everywhere.
                </p>
              </div>
              
              <div className="mt-auto">
                <h4 className="text-sm dark:text-neutral-300 dark:text-white uppercase tracking-wider mb-3 font-medium">What you get</h4>
                <ul className="space-y-2 text-neutral-700 dark:text-white">
                  <li className="flex items-start">
                    <span className="text-indigo-400 mr-2">✓</span>
                    <span>Fully responsive layouts that adapt to any device size</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-indigo-400 mr-2">✓</span>
                    <span>Touch-optimized interfaces with proper tap targets</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-indigo-400 mr-2">✓</span>
                    <span>Progressive enhancement for all browsers</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-indigo-400 mr-2">✓</span>
                    <span>Accessibility-focused design for all users</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Lightning Fast Performance */}
          <div className="p-8 rounded-2xl dark:bg-neutral-900 border border-neutral-800 hover:border-blue-500/50 transition-all group z-20">
            <div className="flex flex-col h-full">
              <div className="mb-6">
                <div className="h-14 w-14 rounded-xl bg-blue-500/20 flex items-center justify-center mb-4 group-hover:bg-blue-500/30 transition-all">
                  <BoltIcon className="h-7 w-7 text-blue-400" />
                </div>
                <h3 className="text-2xl font-semibold mb-3">Lightning Fast Performance</h3>
                <p className="text-neutral-700 dark:text-white mb-4">
                  Speed is a feature. Sites load instantly, respond quickly, and rank higher in search because of optimized performance fundamentals.
                </p>
              </div>
              
              <div className="mt-auto">
                <h4 className="text-sm text-neutral-900 dark:text-white uppercase tracking-wider mb-3 font-medium">Technical benefits</h4>
                <ul className="space-y-2 text-neutral-700 dark:text-white">
                  <li className="flex items-start">
                    <span className="text-blue-400 mr-2">✓</span>
                    <span>Server-side rendering and static generation</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-400 mr-2">✓</span>
                    <span>Intelligent code splitting and chunk loading</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-400 mr-2">✓</span>
                    <span>Image and asset optimization</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-400 mr-2">✓</span>
                    <span>Perfect Lighthouse scores and Core Web Vitals</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Modern Tech Stack */}
          <div className="p-8 rounded-2xl dark:bg-neutral-900 border border-neutral-800 hover:border-emerald-500/50 transition-all group">
            <div className="flex flex-col h-full">
              <div className="mb-6">
                <div className="h-14 w-14 rounded-xl bg-emerald-500/20 flex items-center justify-center mb-4 group-hover:bg-emerald-500/30 transition-all">
                  <CodeBracketIcon className="h-7 w-7 text-emerald-400" />
                </div>
                <h3 className="text-2xl font-semibold mb-3">Modern Tech Stack</h3>
                <p className="text-neutral-400 mb-4">
                  Built with today&apos;s most trusted tools to ensure maintainability, scalability, and long-term stability.
                </p>
              </div>
              
              <div className="mt-auto">
                <h4 className="text-sm text-neutral-900 dark:text-white uppercase tracking-wider mb-3 font-medium">Technologies used</h4>
                <ul className="space-y-2 text-neutral-700 dark:text-white">
                  <li className="flex items-start">
                    <span className="text-emerald-400 mr-2">✓</span>
                    <span>React with Next.js for robust application architecture</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-emerald-400 mr-2">✓</span>
                    <span>TypeScript for type safety and better development</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-emerald-400 mr-2">✓</span>
                    <span>Tailwind CSS for rapid, consistent styling</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-emerald-400 mr-2">✓</span>
                    <span>Modern APIs and headless integrations</span>
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
