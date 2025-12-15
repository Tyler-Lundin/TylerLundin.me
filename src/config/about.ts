import type { AboutConfig } from '@/types/about';

function YEARS_SINCE_BIRTH(): string {
  const birth = new Date("1999-03-29");
  const now = new Date();
  const diff = now.getTime() - birth.getTime();
  const years = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  return String(years);
}

export const aboutConfig: AboutConfig = {
  title: 'Tyler Lundin',
  subtitle: 'Independent Web Developer',
  tagline:
    "Fast, modern websites for real businesses — built to get you more calls.",
  location: 'Spokane, WA',
  role: 'Web Developer & Builder',
  availability: 'open',

  intro: [
    `I’m a ${YEARS_SINCE_BIRTH()} year old Spokane-based developer, gym rat, and gearhead. I learned by building real projects — break it, fix it, rebuild it — until the work got clean, fast, and reliable.`,
    "Today I build modern small-business websites that load quickly, work smoothly on phones, and make it easy for customers to contact you.",
    "If we work together, you’ll get clear communication, practical recommendations, and a site that’s built to convert — not impress other developers.",
  ],

  images: [
    // Note from your screenshot: swap this to a real photo when ready
    { src: '/images/tyler.png', alt: 'Tyler', rounded: true, width: 800, height: 800 },
  ],

  highlights: [
    'Performance-first builds that load fast',
    'Layouts that feel solid on mobile and desktop',
    'Practical SEO + content structure for local search',
    'Conversion-focused pages: services, reviews, and clear CTAs',
  ],

  skills: [
    'Next.js',
    'React',
    'TypeScript',
    'Supabase',
    'Tailwind',
    'Stripe',
  ],

  stats: [
    { label: 'Focus', value: 'More calls', helperText: 'Clear CTA + contact-first structure' },
    { label: 'Build style', value: 'Mobile-first', helperText: 'Designed for phone users first' },
    { label: 'Performance', value: 'Fast load', helperText: 'Optimized images + lean pages' },
    { label: 'Communication', value: 'Straightforward', helperText: 'No jargon, no runaround' },
    { label: 'Availability', value: 'Accepting clients', helperText: 'Limited slots to stay responsive' },
  ],

  projectHighlights: [
    {
      id: 'zevlin-bike',
      name: 'ZevlinBike',
      role: 'Solo Dev',
      tagline: 'E-commerce storefront rebuild for a cycling chamois-cream brand',
      href: 'https://zevlinbike.com',
    },
    {
      id: 'suncrest-fitness-center',
      name: 'Suncrest Fitness Center',
      role: 'Redesign Concept',
      tagline: "Concept redesign for a local fitness & therapy gym",
      href: 'https://sfc-topaz.vercel.app',
    },
  ],

  philosophy: [
    "Be tolerant with others and strict with yourself.",
    `“And your profession?” “Goodness.”`,
    `When you arise in the morning, think of what a precious privilege it is to be alive—to breathe, to think, to enjoy, to love.`,
  ],

  socials: [
    { platform: 'github', label: 'GitHub', href: 'https://github.com/Tyler-Lundin' },
    { platform: 'linkedin', label: 'LinkedIn', href: 'https://linkedin.com/in/tyler-l-81b839378' },
  ],

  ctas: [
    { label: 'Work with me', href: '/contact' },
  ],
};
