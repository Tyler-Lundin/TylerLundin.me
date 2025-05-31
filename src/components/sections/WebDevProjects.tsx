'use client';

import { WebDevSection } from '@/types/site';
import { ProjectPreview } from '../projects/ProjectPreview';
import WebFAQ from '../WebFAQ';

interface WebDevProjectsProps {
  section: WebDevSection;
}

const WEB_DEV_PROJECTS = [
  {
    title: "Lundin Vision",
    description: "A sophisticated medical practice website combining modern web technologies with luxury aesthetics. Features include comprehensive service information, team profiles, appointment scheduling, and a responsive design with dark mode support.",
    techStack: [
      "Next.js",
      "TypeScript",
      "React",
      "Tailwind CSS",
      "shadcn/ui",
      "Heroicons",
      "Google Maps API",
      "App Router"
    ],
    projectUrl: "https://lundin-vision.vercel.app",
    isInternalLink: false
  },
  {
    title: "Island Market",
    description: "A modern convenience store website featuring real-time store status, weather information, and community highlights. Built with a focus on user experience and responsive design, the site includes dynamic store hours display, Instagram integration, and a clean, intuitive interface.",
    techStack: [
      "Next.js 15",
      "React 19",
      "TypeScript",
      "Tailwind CSS 4",
      "Vercel Deployment",
      "ESLint",
      "PostCSS"
    ],
    projectUrl: "https://island-market.vercel.app",
    isInternalLink: false
  },
  {
    title: "Fast Cache Pawn Website",
    description: "A modern, responsive website for Fast Cache Pawn, a trusted pawn shop in Logan, UT. Features include service listings, Google reviews integration, contact information, and a beautiful UI with animations and parallax effects.",
    techStack: [
      "Next.js 15",
      "React 19",
      "TypeScript",
      "Tailwind CSS 4",
      "Framer Motion",
      "Google Maps API",
      "Geist Font"
    ],
    projectUrl: "https://fastcachepawn.vercel.app",
    isInternalLink: false
  },
  {
    title: "Foxlot - Booking Platform [WIP]",
    description: "A modern booking platform for with the goal of branding around the design of a random animal, which happened to be a fox.",
    techStack: [
      "Next.js 15",
      "React 19",
      "TypeScript",
      "Tailwind CSS 4",
    ],
    projectUrl: "https://www.foxlot.app",
    isInternalLink: false
  },
  {
    title: "Willows Yardscapes",
    description: "A modern, responsive website for Willows Yardscapes, a landscaping company. Features include service listings, Google reviews integration, contact information, and a beautiful UI with animations and parallax effects.",
    techStack: [
      "Next.js 15",
      "React 19",
      "TypeScript",
    ],
    projectUrl: "https://www.willows-yardscapes.com/",
    isInternalLink: false
  },
  {
    title: "Your Project Here",
    description: "Let's build something amazing together. I've been working with Ghost for years, and I've built a number of custom themes and integrations.",
    techStack: [
      "Your Vision",
      "Modern Tech",
      "Expert Development"
    ],
    projectUrl: "/contact",
    isInternalLink: true
  },
];

export function WebDevProjects({ section }: WebDevProjectsProps) {
  return (
    <section id="projects" className="min-h-screen py-20 relative overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 dark:from-blue-500/5 dark:via-purple-500/5 dark:to-pink-500/5 animate-gradient" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <h2 className="text-5xl font-bold mb-16 text-center">
          <span className="relative">
            {section.headline}
            <span className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 blur-xl -z-10" />
          </span>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {WEB_DEV_PROJECTS.map((project, index) => (
            <ProjectPreview
              key={index}
              {...project}
            />
          ))}
        </div>
      </div>
      <WebFAQ />
    </section>
  );
} 
