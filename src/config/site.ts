import { SiteConfig } from '@/types/site';

export const siteConfig: SiteConfig = {
  site_name: "Tyler Lundin",
  domain: "tylerlundin.me",
  tagline: "Developer • Tinkerer • Creator",
  theme: {
    colors: {
      primary: "#4F46E5",
      accent: "#FBBF24",
      background: "#F9FAFB",
      text: "#1F2937"
    },
    font: "Inter, sans-serif",
    style: "minimal, modern, clean"
  },
  sections: [
    {
      type: "hero",
      headline: "I'm Tyler",
      subheadline: "I build beautiful, fast, and functional websites. I'm all about clean code, user-first design, and meaningful results.",
      cta: {
        label: "View My Work",
        link: "#projects"
      },
      image: "/images/hero.jpeg"
    },
    {
      type: "about",
      headline: "About Me",
      content: "I'm a self-taught web developer with a bias for action and zero patience for corporate fluff. I build things the hard way — from scratch — whether it's a web app, a broken-down engine, or a life worth living. Clean design, solid code, real impact — that's what I care about. This site isn't some polished brochure. It's me, unfiltered. If that works for you, cool — let's build something that actually matters.",
      image: "/images/profile.jpg"
    },
    {
      type: "projects",
      headline: "Featured Projects",
      projects: [
        {
          title: "Island Market",
          description: "A modern convenience store website featuring real-time store status, weather information, and community highlights. Built with a focus on user experience and responsive design, the site includes dynamic store hours display, Instagram integration, and a clean, intuitive interface.",
          tech_stack: [
            "Next.js 15",
            "React 19",
            "TypeScript",
            "Tailwind CSS 4",
            "Vercel Deployment",
            "ESLint",
            "PostCSS"
          ],
          image: "/images/island-market-preview.png",
          link: "https://github.com/tyler-lundin/island-market"
        },
        {
          title: "Fast Cache Pawn Website",
          description: "A modern, responsive website for Fast Cache Pawn, a trusted pawn shop in Logan, UT. Features include service listings, Google reviews integration, contact information, and a beautiful UI with animations and parallax effects.",
          tech_stack: [
            "Next.js 15",
            "React 19",
            "TypeScript",
            "Tailwind CSS 4",
            "Framer Motion",
            "Google Maps API",
            "Geist Font"
          ],
          image: "/images/fast-cache-pawn-0.png",
          link: "https://fastcachepawn.com"
        },
        {
          title: "MyCarTool",
          description: "A side project for managing personal car repairs and service records. Designed to be a mechanic's digital companion.",
          tech_stack: ["React", "Firebase", "Framer Motion"],
          image: "/images/mycar.png",
          link: "#"
        },
        {
          title: "Dev Portfolio Template",
          description: "A sleek portfolio template built for developers. Mobile-friendly, dark mode, and easy to customize.",
          tech_stack: ["Next.js", "Tailwind", "Markdown"],
          image: "/images/dev-portfolio-template.png",
          link: "#"
        }
      ]
    },
    {
      type: "services",
      headline: "What I Offer",
      items: [
        "Custom Website Design",
        "Monthly Site Maintenance",
        "Freelance Web Development",
        "Landing Page Builds",
        "Performance Optimization"
      ]
    },
    {
      type: "contact",
      headline: "Let's Connect",
      description: "Have a project in mind or just want to chat? Reach out and let's make something awesome.",
      email: "placeholder@tylerlundin.me",
      social: {
        github: "https://github.com/tyler-lundin",
        linkedin: "https://linkedin.com/in/tyler-lundin",
        twitter: "https://twitter.com/tylerlundin"
      }
    }
  ],
  footer: {
    text: "© 2025 Tyler Lundin. All rights reserved.",
    links: [
      { label: "Privacy Policy", url: "/privacy" },
      { label: "GitHub", url: "https://github.com/tyler-lundin" }
    ]
  }
}; 