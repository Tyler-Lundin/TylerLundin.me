import { ImageSlideshow } from '../ImageSlideshow';

interface IslandMarketProjectProps {
  isExpanded?: boolean;
}

const ISLAND_MARKET_IMAGES = [
  '/images/island-market-0.png',
  '/images/island-market-1.png',
  '/images/island-market-2.png',
  '/images/island-market-3.png',
  '/images/island-market-4.png',
  '/images/island-market-5.png',
  '/images/island-market-6.png',
];

export function IslandMarketProject({ isExpanded = false }: IslandMarketProjectProps) {
  const tech_stack = [
    "Next.js 15",
    "React 19",
    "TypeScript",
    "Tailwind CSS 4",
    "Vercel Deployment",
    "ESLint",
    "PostCSS"
  ];

  return (
    <div className={`bg-white dark:bg-neutral-800 border border-black/25 dark:border-white/25 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow cursor-pointer ${
      isExpanded ? 'w-full max-w-2xl' : 'w-full max-w-md'
    }`}>
      <ImageSlideshow 
        images={ISLAND_MARKET_IMAGES}
        interval={6000}
        className={isExpanded ? 'aspect-[16/9]' : 'aspect-video'}
      />
      <div className="p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Island Market
        </h3>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-3 sm:mb-4">
          A modern convenience store website featuring real-time store status, weather information, and community highlights. 
          Built with a focus on user experience and responsive design, the site includes dynamic store hours display, 
          Instagram integration, and a clean, intuitive interface.
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
        <div className="text-sm sm:text-base text-indigo-600 dark:text-emerald-300 font-medium">
          View Project →
        </div>
      </div>
    </div>
  );
} 