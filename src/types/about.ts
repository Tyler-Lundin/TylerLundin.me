export interface AboutImage {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
  rounded?: boolean; // render as circle when true
}

export interface AboutCTA {
  label: string;
  href: string;
  external?: boolean; // open in new tab
}

export interface AboutSocialLink {
  platform: 'github' | 'linkedin' | 'x' | 'email' | 'website' | 'other';
  label: string;        // e.g. "GitHub", "LinkedIn"
  href: string;         // URL or mailto:
  icon?: string;        // optional icon key if your UI uses one
}

export interface AboutStat {
  label: string;        // e.g. "Hours in the editor"
  value: string;        // e.g. "1000+"
  helperText?: string;  // e.g. "Self-taught, project-first"
}

export interface AboutProjectHighlight {
  id?: string;          // project id or slug to render a nested card
  name: string;         // "ZevlinBike"
  role?: string;        // "Solo dev", "Lead builder"
  tagline?: string;     // "Custom Next.js + Supabase e-commerce rebuild"
  href?: string;        // case study / live link
}

export interface AboutConfig {
  // Core identity
  title: string;
  subtitle?: string;     // small label above or near title ("The Rogue Webdev")
  tagline?: string;      // short italic line
  intro: string[];       // paragraphs

  // Context / positioning
  location?: string;     // "Spokane, WA"
  role?: string;         // "Self-taught web developer & builder"
  availability?: 'open' | 'limited' | 'closed';

  // Visuals
  images: AboutImage[];  // mapped gallery

  // Content blocks
  highlights?: string[];               // quick bullets
  skills?: string[];                   // tags/pills
  stats?: AboutStat[];                 // numeric / punchy stats
  projectHighlights?: AboutProjectHighlight[]; // key projects to show under About
  philosophy?: string[];               // optional short principles / beliefs

  // Links
  socials?: AboutSocialLink[];
  ctas?: AboutCTA[];
}
