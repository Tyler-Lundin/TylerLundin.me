import { ImageSlideshow } from '@/components/ImageSlideshow';

interface BookingProjectProps {
  isExpanded?: boolean;
}

const BOOKING_IMAGES = [
  '/images/slot-fox-0.png',
  '/images/slot-fox-1.png',
  '/images/slot-fox-2.png',
  '/images/slot-fox-3.png',
];

export function FoxLotProject({ isExpanded = false }: BookingProjectProps) {
  const tech_stack = [
    "Next.js 15",
    "React 19",
    "TypeScript",
    "Tailwind CSS",
    "Supabase",
    "Luxon",
    "PostgreSQL"
  ];

  return (
    <div className={`bg-white dark:bg-neutral-800 border border-black/25 dark:border-white/25 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow ${
      isExpanded ? 'w-full max-w-2xl' : 'w-full max-w-md'
    }`}>
      <ImageSlideshow 
        images={BOOKING_IMAGES}
        interval={6000}
        className={isExpanded ? 'aspect-[16/9]' : 'aspect-video object-cover object-top'}
      />
      <div className="p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          FoxLot
        </h3>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-3 sm:mb-4">
          A self-hosted booking system built with modern web technologies, featuring timezone-aware scheduling, 
          admin dashboard, and email notifications. The system provides a clean, minimalist interface for clients 
          to book time while giving administrators full control over availability and data management.
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
        <h3
          className="inline-block text-sm sm:text-base text-indigo-600 dark:text-emerald-300 hover:text-indigo-700 dark:hover:text-emerald-400 font-medium"
        >
          View Project →
        </h3>
      </div>
    </div>
  );
} 