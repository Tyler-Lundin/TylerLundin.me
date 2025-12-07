import type { AboutConfig } from '@/types/about';
export const aboutConfig: AboutConfig = {
  title: 'Tyler Lundin',
  subtitle: 'Web dev in progress',
  tagline:
    "Self-taught, no degree, still figuring it out — but I ship real things for real people.",
  location: 'Spokane, WA',
  role: 'Self-taught web developer & builder',
  availability: 'open',

  intro: [
    "I'm a self-taught developer, gym rat, and gearhead who fell into web dev by breaking my own projects until they finally worked. No bootcamp, no CS degree — just a lot of hours in the editor and trial-and-error.",
    "I'm not a 10-year senior engineer, but I do build fast, clean sites that actually load, work on phones, and make it easier for small businesses to sell things and be found online.",
    "I’m still stacking experience and tightening up my craft, so I care a lot more about long-term fit and honest collaboration than pretending I run a 20-person agency.",
  ],

  images: [
    { src: '/images/tyler.png', alt: 'Tyler', rounded: true, width: 800, height: 800 },
  ],

  highlights: [
    'Performance-focused builds (no bloated theme stacks)',
    'Responsive layouts that don’t fall apart on mobile',
    'Practical SEO and content structure for small brands',
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
    {
      label: 'Hours in the editor',
      value: '1000+',
      helperText: 'Learned by building, not just tutorials',
    },
    {
      label: 'Real-world projects',
      value: '3–5',
      helperText: 'Family business, personal brands, and experiments',
    },
  ],

  projectHighlights: [
    {
      id: 'zevlin-bike',
      name: 'ZevlinBike',
      role: 'Solo dev',
      tagline: 'Custom Next.js + Supabase e-commerce rebuild for a cycling skincare brand',
      href: 'https://zevlinbike.com',
    },
    {
      id: 'iron-ankr',
      name: 'IronAnkr',
      role: 'Founder & dev',
      tagline: 'Lifting strap brand and storefront, built from scratch and still evolving',
      href: 'https://ironankr.com', // when live
    },
  ],

  philosophy: [
    "It's not what I do, it's how I do it",
    "The only thing I can control is myself",
    "Gently lower the weight, don't let gravity or momentum do it for you!",
    "Try to be happy"
  ],

  socials: [
    { platform: 'github', label: 'GitHub', href: 'https://github.com/Tyler-Lundin' },
    { platform: 'linkedin', label: 'LinkedIn', href: 'https://linkedin.com/in/tyler-l-81b839378' },
  ],

  ctas: [
    { label: 'Work with me', href: '/contact' },
  ],
};
