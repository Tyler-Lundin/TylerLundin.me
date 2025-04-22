import { SiteConfig } from '@/types/site';

export const siteConfig: SiteConfig = {
  site_name: "Tyler Lundin",
  domain: "tylerlundin.me",
  tagline: "Web Developer in Logan, Utah | Northern Utah Web Development",
  booking_url: process.env.NEXT_PUBLIC_BOOKING_URL || "https://slotfox.vercel.app/tyler-lundin-me",
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
      subheadline: "I build beautiful, fast, and functional websites for businesses in Northern Utah. Specializing in custom web development, e-commerce solutions, and digital marketing for Cache Valley businesses.",
      cta: {
        label: "View My Work",
        link: "#projects"
      },
      image: "/images/professional.png"
    },
    {
      type: "about",
      headline: "About Me",
      content: "I'm a web developer based in Logan, Utah, serving businesses throughout Cache Valley and Northern Utah. With a focus on clean design and solid code, I help local businesses establish a strong online presence. Whether you're in Logan, Smithfield, or anywhere in Northern Utah, I'm here to help you build a website that drives real results.",
      image: "/images/professional.png"
    },
    {
      type: "projects",
      headline: "Featured Projects",
      projects: [
        {
          title: "Island Market",
          description: "A modern convenience store website for a local Cache Valley business, featuring real-time store status, weather information, and community highlights. Built with a focus on user experience and responsive design.",
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
          description: "A modern, responsive website for Fast Cache Pawn, a trusted pawn shop in Logan, UT. Features include service listings, Google reviews integration, and local business optimization.",
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
        "Custom Website Design for Northern Utah Businesses",
        "Monthly Site Maintenance",
        "Local SEO Optimization",
        "E-commerce Solutions",
        "Performance Optimization"
      ]
    },
    {
      type: "contact",
      headline: "Let's Connect",
      description: "Serving businesses in Logan, Smithfield, and throughout Cache Valley. Have a project in mind or just want to chat? Reach out and let's make something awesome for your Northern Utah business.",
      email: "placeholder@tylerlundin.me",
      social: {
        github: "https://github.com/tyler-lundin",
        linkedin: "https://linkedin.com/in/tyler-lundin",
        twitter: "https://twitter.com/tylerlundin"
      }
    }
  ],
  footer: {
    text: "© 2025 Tyler Lundin. Serving Northern Utah and Cache Valley.",
    links: [
      { label: "Privacy Policy", url: "/privacy" },
      { label: "GitHub", url: "https://github.com/tyler-lundin" }
    ]
  }
}; 