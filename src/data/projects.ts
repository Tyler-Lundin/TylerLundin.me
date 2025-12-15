import type { Project } from '@/types/projects';

// Seed data for initial showcase. Replace media with real screenshots/videos later.
export const projects: Project[] = [
  {
    id: 'zevlin-bike',
    slug: 'zevlin-bike',
    title: 'Zevlin Bike',
    tagline: 'Ride longer. Chafe less.',
    description:
      'E-commerce experience for performance cycling gear with clean product presentation and fast checkout.',
    tech: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Vercel'],
    services: ['Design', 'Frontend', 'E-commerce'],
    features: ['Product galleries', 'Variant selection', 'Fast checkout'],
    integrations: ['Stripe', 'Analytics'],
    links: [
      { type: 'live', url: 'https://zevlinbike.com', label: 'Live' },
    ],
    media: [
      {
        id: 'zevlin-bike-hero-light',
        type: 'image',
        src: '/projects/zevlin-bike/home-light.webp',
        alt: 'Zevlin Bike preview light',
        featured: true,
        variant: 'light',
        autoScroll: true,
      },
      {
        id: 'zevlin-bike-hero-dark',
        type: 'image',
        src: '/projects/zevlin-bike/home-dark.webp',
        alt: 'Zevlin Bike preview light',
        featured: true,
        variant: 'dark',
        autoScroll: true,
      }
    ],
    weight: 5,
    heroShowcase: true,
  },
  {
    id: 'iron-ankr',
    slug: 'iron-ankr',
    title: 'Iron Ankr',
    tagline: 'Precision lifting gear for serious pulling days.',
    description:
      'Marketing site with bold visual identity and responsive layouts across devices.',
    tech: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS'],
    services: ['Design', 'Frontend'],
    features: ['Hero motion', 'Responsive grids'],
    links: [
      { type: 'live', url: 'https://ironankr.com', label: 'Live' },
    ],
    media: [
      {
        id: 'iron-ankr-light',
        type: 'image',
        src: '/projects/iron-ankr/home-light.webp',
        alt: 'Iron Ankr preview light',
        featured: true,
        variant: 'light',
        autoScroll: false,
      },
      {
        id: 'iron-ankr-dark',
        type: 'image',
        src: '/projects/iron-ankr/home-dark.webp',
        alt: 'Iron Ankr preview dark',
        featured: false,
        variant: 'dark',
        autoScroll: false,
      },
    ],
    weight: 6,
    heroShowcase: true,
  },
  {
    id: 'island-market',
    slug: 'island-market',
    title: 'Island Market',
    tagline: 'A century of community, tradition, and quality',
    description:
      'A modern convenience store website featuring real-time store status, weather information, and community highlights.',
    tech: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Vercel'],
    links: [
      { type: 'live', url: 'https://island-market.vercel.app', label: 'Live' },
    ],
    media: [
      {
        id: 'island-market-hero',
        type: 'image',
        src: '/projects/island-market/home-light.webp', // TODO: replace with real screenshot
        alt: 'Island Market preview',
        featured: true,
      },
    ],
    weight: 10,
    heroShowcase: false,
  },
  {
    id: 'fast-cache-pawn',
    slug: 'fast-cache-pawn',
    title: 'Fast Cache Pawn',
    tagline: 'Fast Cache Pawn — a modern landing page for a local pawn shop.',
    description:
      'Responsive website with service listings, Google reviews integration, and local business optimization.',
    tech: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Framer Motion'],
    links: [
      { type: 'live', url: 'https://fastcachepawn.vercel.app/', label: 'Live' },
    ],
    media: [
      {
        id: 'fcp-hero',
        type: 'image',
        src: '/projects/fast-cache-pawn/home-light.webp', // TODO: replace with real screenshot
        alt: 'Fast Cache Pawn preview',
        featured: true,
      },
    ],
    weight: 20,
    heroShowcase: true,
  },
  {
    id: 'suncrest-fitness-center',
    slug: 'suncrest-fitness-center',
    title: 'Suncrest Fitness Center',
    tagline: 'Join a community of achievers. Train for life.',
    description:
      'Fitness center website with membership information, class schedules, and facility details.',
    tech: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS'],
    links: [
      { type: 'live', url: 'https://sfc-topaz.vercel.app/', label: 'Live' },
    ],
    media: [
      { id: 'sfc-hero-light', type: 'image', src: '/projects/suncrest-fitness-center/home-light.webp', alt: 'Suncrest Fitness Center preview', featured: true, }, 
      { id: 'sfc-hero-dark', type: 'image', src: '/projects/suncrest-fitness-center/home-dark.webp', alt: 'Suncrest Fitness Center home dark preview', featured: true, }, 
      { id: 'sfc-about-light', type: 'image', src: '/projects/suncrest-fitness-center/about-light.webp', alt: 'Suncrest Fitness Center about light preview', featured: true, }, 
      { id: 'sfc-memberships-light', type: 'image', src: '/projects/suncrest-fitness-center/memberships-light.webp', alt: 'Suncrest Fitness Center memberships light preview', featured: true, }, 
      { id: 'sfc-schedule-light', type: 'image', src: '/projects/suncrest-fitness-center/schedule-light.webp', alt: 'Suncrest Fitness Center schedule light preview', featured: true, }, 
    ],
    weight: 30,
    heroShowcase: true,
  },
];
