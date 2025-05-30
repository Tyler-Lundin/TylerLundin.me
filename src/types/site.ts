export interface SiteConfig {
  site_name: string;
  domain: string;
  tagline: string;
  booking_url: string;
  theme: {
    colors: {
      primary: string;
      accent: string;
      background: string;
      text: string;
    };
    font: string;
    style: string;
  };
  sections: Section[];
  footer: {
    text: string;
    links: Array<{
      label: string;
      url: string;
    }>;
  };
}

export type Section = 
  | HomeSection
  | AboutSection
  | ProjectsSection
  | ServicesSection
  | ContactSection;

interface BaseSection {
  type: string;
  headline: string;
}

export interface HomeSection extends BaseSection {
  type: 'home';
  tagline?: string;
  subheadline: string;
  cta: {
    label: string;
    link: string;
  };
  image: string;
}

export interface AboutSection extends BaseSection {
  type: 'about';
  content: string;
  image: string;
}

export interface Project {
  title: string;
  description: string;
  tech_stack: string[];
  image: string;
  link: string;
}

export interface ProjectsSection extends BaseSection {
  type: 'projects';
  projects: Project[];
}

export interface ServicesSection extends BaseSection {
  type: 'services';
  items: string[];
  subheadline: string;
}

export interface ContactSection extends BaseSection {
  type: 'contact';
  description: string;
  email: string;
  social: {
    github: string;
    linkedin: string;
    twitter: string;
  };
} 