interface GhostProjectProps {
  isExpanded?: boolean;
}

export function GhostProject({ isExpanded = false }: GhostProjectProps) {
  return (
    <div className={`bg-white dark:bg-neutral-800 border border-black/25 dark:border-white/25 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow cursor-pointer ${
      isExpanded ? 'w-full max-w-2xl' : 'w-full max-w-md'
    }`}>
      <div className="relative aspect-video bg-gradient-to-br from-indigo-50 dark:from-indigo-950 to-indigo-100 dark:to-indigo-950 flex items-center justify-center">
        <div className="text-center p-6">
          <div className="text-4xl sm:text-5xl mb-4">✨</div>
          <h3 className="text-lg sm:text-xl font-bold text-indigo-900 dark:text-gray-100 mb-2">
            Your Project Here
          </h3>
          <p className="text-sm sm:text-base text-indigo-700 dark:text-gray-400 mb-4">
            Let&apos;s build something amazing together
          </p>
        </div>
      </div>
      <div className="p-4 sm:p-6">
        <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
          <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-indigo-50 dark:bg-neutral-700 text-indigo-700 dark:text-gray-300 rounded-full text-xs sm:text-sm">
            Your Vision
          </span>
          <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-indigo-50 dark:bg-neutral-700 text-indigo-700 dark:text-gray-300 rounded-full text-xs sm:text-sm">
            Modern Tech
          </span>
          <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-indigo-50 dark:bg-neutral-700 text-indigo-700 dark:text-gray-300 rounded-full text-xs sm:text-sm">
            Expert Development
          </span>
        </div>
        <div className="text-sm sm:text-base text-indigo-600 dark:text-emerald-300 font-medium">
          Let&apos;s Build Your Project →
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          I&apos;ve been working with Ghost for years, and I&apos;ve built a number of custom themes and integrations.
        </p>
      </div>
    </div>
  );
} 