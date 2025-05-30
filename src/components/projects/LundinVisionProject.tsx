import { ImageSlideshow } from '../ImageSlideshow';

interface LundinVisionProjectProps {
  isExpanded?: boolean;
}

const LUNDIN_VISION_IMAGES = [
  '/images/lundin-vision-0.png',
  '/images/lundin-vision-1.png',
  '/images/lundin-vision-2.png',
  '/images/lundin-vision-3.png',
];

export function LundinVisionProject({ isExpanded = false }: LundinVisionProjectProps) {
  const tech_stack = [
    "Next.js",
    "TypeScript",
    "React",
    "Tailwind CSS",
    "shadcn/ui",
    "Heroicons",
    "App Router"
  ];

  return (
    <div className={`bg-white dark:bg-neutral-800 border border-black/25 dark:border-white/25 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow cursor-pointer ${
      isExpanded ? 'w-full max-w-2xl' : 'w-full max-w-md'
    }`}>
      <ImageSlideshow 
        images={LUNDIN_VISION_IMAGES}
        interval={6000}
        className={isExpanded ? 'aspect-[16/9]' : 'aspect-video'}
      />
      <div className="p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Lundin Vision
        </h3>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-3 sm:mb-4">
          A sophisticated medical practice website combining modern web technologies with luxury aesthetics. 
          Features include comprehensive service information, team profiles, appointment scheduling, 
          and a responsive design with dark mode support.
        </p>
        <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
          {tech_stack.map((tech) => (
            <span
              key={tech}
              className="px-2 sm:px-3 py-0.5 sm:py-1 bg-gray-100 dark:bg-neutral-700 text-gray-700 dark:text-gray-300 rounded-full text-xs sm:text-sm"
            >
              {tech}
            </span>
          ))}
        </div>
        <a 
          href="https://lundin-vision.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block text-sm sm:text-base text-indigo-600 dark:text-emerald-300 font-medium hover:text-indigo-500 dark:hover:text-emerald-200 transition-colors duration-200"
        >
          View Project →
        </a>
      </div>
    </div>
  );
} 