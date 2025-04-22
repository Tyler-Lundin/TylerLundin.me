import { ImageSlideshow } from '@/components/ImageSlideshow';
import Link from 'next/link';

interface BookingProjectProps {
  isExpanded?: boolean;
}

const BOOKING_IMAGES = [
  '/images/slot-fox-0.png',
  '/images/slot-fox-1.png',
  '/images/slot-fox-2.png',
  '/images/slot-fox-3.png',
];

export function BookingProject({ isExpanded = false }: BookingProjectProps) {
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
    <div className={`bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow ${
      isExpanded ? 'w-full max-w-2xl' : 'w-full max-w-md'
    }`}>
      <ImageSlideshow 
        images={BOOKING_IMAGES}
        interval={6000}
        className={isExpanded ? 'aspect-[16/9]' : 'aspect-video'}
      />
      <div className="p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
          Custom Booking System
        </h3>
        <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">
          A self-hosted booking system built with modern web technologies, featuring timezone-aware scheduling, 
          admin dashboard, and email notifications. The system provides a clean, minimalist interface for clients 
          to book time while giving administrators full control over availability and data management.
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
          href="https://booking.vercel.app/"
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