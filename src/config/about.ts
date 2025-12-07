import type { AboutConfig } from '@/types/about';
export const aboutConfig: AboutConfig = {
  title: 'Tyler Lundin',
  subtitle: 'The Rogue Webdev',
  tagline:
    'Nomadic by nature, caffeinated by code — building fast, clean, modern web experiences.',
  location: 'Spokane, WA',
  role: 'Self-taught web developer & builder',
  availability: 'open',

  intro: [
    "I'm a self-taught developer, gearhead, and builder at heart—someone who thrives on creating from scratch and solving problems with clean code and sharper ideas.",
    'I specialize in high-performance sites, custom e-commerce builds, and local-first SEO that helps small businesses punch above their weight.',
  ],

  images: [
    { src: '/images/tyler.png', alt: 'Tyler', rounded: true, width: 800, height: 800 },
  ],

  highlights: [
    'Performance-first builds',
    'Accessible, responsive UI',
    'Local-first SEO mindset',
  ],

  skills: [
    'Next.js',
    'React',
    'TypeScript',
    'Supabase',
    'Tailwind',
    'Stripe',
    'Framer Motion',
  ],

  stats: [
    { label: 'Hours in the editor', value: '1000+', helperText: 'Self-taught and project-driven' },
    { label: 'Real-world projects', value: '5+', helperText: 'From convenience stores to e-commerce' },
  ],

  projectHighlights: [
    {
      name: 'ZevlinBike',
      role: 'Solo dev',
      tagline: 'Custom Next.js + Supabase e-commerce rebuild',
      href: 'https://zevlinbike.com',
    },
    {
      name: 'IronAnkr',
      role: 'Founder & dev',
      tagline: 'Fitness strap brand and storefront built from scratch',
      href: 'https://ironankr.com', // when live
    },
  ],

  philosophy: [
    'Ship small, ship often.',
    'Keep the stack simple enough to maintain when motivation dips.',
    'Build for real people, not just for the portfolio screenshot.',
  ],

  socials: [
    { platform: 'github', label: 'GitHub', href: 'https://github.com/Tyler-Lundin' },
    { platform: 'linkedin', label: 'LinkedIn', href: 'https://linkedin.com/in/tyler-l-81b839378' },
  ],

  ctas: [
    { label: 'Work with me', href: '/contact' },
  ],
};

