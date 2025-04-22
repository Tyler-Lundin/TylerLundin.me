import Link from 'next/link';

interface GhostProjectProps {
  isExpanded?: boolean;
}

export function GhostProject({ isExpanded = false }: GhostProjectProps) {
  return (
    <div className={`bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow ${
      isExpanded ? 'w-full max-w-2xl' : 'w-full max-w-md'
    }`}>
      <div className="relative aspect-video bg-gradient-to-br from-indigo-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center p-6">
          <div className="text-4xl sm:text-5xl mb-4">✨</div>
          <h3 className="text-lg sm:text-xl font-bold text-indigo-900 mb-2">
            Your Project Here
          </h3>
          <p className="text-sm sm:text-base text-indigo-700 mb-4">
            Let's build something amazing together
          </p>
        </div>
      </div>
      <div className="p-4 sm:p-6">
        <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
          <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs sm:text-sm">
            Your Vision
          </span>
          <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs sm:text-sm">
            Modern Tech
          </span>
          <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs sm:text-sm">
            Expert Development
          </span>
        </div>
        <Link
          href="/contact"
          className="inline-block w-full text-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm sm:text-base font-medium"
        >
          Let's Build Your Project →
        </Link>
      </div>
    </div>
  );
} 