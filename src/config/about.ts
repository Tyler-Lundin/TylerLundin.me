import type { AboutConfig } from '@/types/about';

function YEARS_SINCE_BIRTH(): string {
  const birth = new Date("1999-03-29");
  const now = new Date();

  const diff = now.getTime() - birth.getTime();
  const years = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25)); // accounts for leap years

  return String(years);
}



export const aboutConfig: AboutConfig = {
  title: 'Tyler Lundin',
  subtitle: 'Web dev in progress',
  tagline:
    "Self-taught, no degree, still figuring it out — but I ship real things for real people.",
  location: 'Spokane, WA', role: 'Self-taught web developer & builder',
  availability: 'open',

  intro: [
    `I'm a ${YEARS_SINCE_BIRTH()} year old self-taught developer, gym rat, and gearhead who fell into web dev by breaking my own projects until they finally worked. No bootcamp, no CS degree — just a lot of hours in the editor and trial-and-error.`,
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
      id: 'suncrest-fitness-center',
      name: 'Suncrest Fitness Center',
      role: 'Redesign Demo',
      tagline: "Steven Counties premiere physical fitness and therapy center",
      href: 'https://sfc-topaz.vercel.app', // when live
    },
  ],

  philosophy: [
    "Be tolerant with others and strict with yourself.",
    `“And your profession?” “Goodness.”`,
    `When you arise in the morning, think of what a precious privilege it is to be alive-to breathe, to think, to enjoy, to love.`,
  ],

  socials: [
    { platform: 'github', label: 'GitHub', href: 'https://github.com/Tyler-Lundin' },
    { platform: 'linkedin', label: 'LinkedIn', href: 'https://linkedin.com/in/tyler-l-81b839378' },
  ],

  ctas: [
    { label: 'Work with me', href: '/contact' },
  ],
};
