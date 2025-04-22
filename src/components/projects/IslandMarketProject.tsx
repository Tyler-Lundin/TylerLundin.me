import { ImageSlideshow } from '../ImageSlideshow';
import Link from 'next/link';

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
    <div className={`bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow ${
      isExpanded ? 'w-full max-w-2xl' : 'w-full max-w-md'
    }`}>
      <ImageSlideshow 
        images={ISLAND_MARKET_IMAGES}
        interval={6000}
        className={isExpanded ? 'aspect-[16/9]' : 'aspect-video'}
      />
      <div className="p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
          Island Market
        </h3>
        <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">
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
        <Link
          href="https://island-market.vercel.app/"
          className="inline-block text-sm sm:text-base text-indigo-600 hover:text-indigo-700 font-medium"
          target="_blank"
          rel="noopener noreferrer"
        >
          View Project →
        </Link>
      </div>
    </div>
  );
} 