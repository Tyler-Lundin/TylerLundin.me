import { ImageSlideshow } from '../ImageSlideshow';

interface FastCachePawnProjectProps {
  isExpanded?: boolean;
}

const FAST_CACHE_PAWN_IMAGES = [
  '/images/fast-cache-pawn-0.png',
  '/images/fast-cache-pawn-1.png',
  '/images/fast-cache-pawn-2.png',
  '/images/fast-cache-pawn-3.png',
  '/images/fast-cache-pawn-4.png',
  '/images/fast-cache-pawn-5.png',
  '/images/fast-cache-pawn-6.png',
  '/images/fast-cache-pawn-7.png',
];

export function FastCachePawnProject({ isExpanded = false }: FastCachePawnProjectProps) {
  const tech_stack = [
    "Next.js 15",
    "React 19",
    "TypeScript",
    "Tailwind CSS 4",
    "Framer Motion",
    "Google Maps API",
    "Geist Font"
  ];

  return (
    <div className={`bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow cursor-pointer ${
      isExpanded ? 'w-full max-w-2xl' : 'w-full max-w-md'
    }`}>
      <div className="relative">
        <ImageSlideshow 
          images={FAST_CACHE_PAWN_IMAGES}
          interval={6000}
          className={isExpanded ? 'aspect-[16/9]' : 'aspect-video'}
        />
      </div>
      <div className="p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
          Fast Cache Pawn Website
        </h3>
        <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">
          A modern, responsive website for Fast Cache Pawn, a trusted pawn shop in Logan, UT. 
          Features include service listings, Google reviews integration, contact information, 
          and a beautiful UI with animations and parallax effects.
        </p>
        <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
          {tech_stack.map((tech) => (
            <span
              key={tech}
              className="px-2 sm:px-3 py-0.5 sm:py-1 bg-gray-100 text-gray-700 rounded-full text-xs sm:text-sm"
            >
              {tech}
            </span>
          ))}
        </div>
        <div className="text-sm sm:text-base text-indigo-600 font-medium">
          View Project →
        </div>
      </div>
    </div>
  );
} 