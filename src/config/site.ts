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
      headline: "Building Bold Websites for Businesses Ready to Stand Out",
      subheadline: "I'm Tyler, a freelance web developer based in Northern Utah. I build sleek, blazing-fast websites that don't just look good—they perform. From custom booking systems to full-blown e-commerce, I help local businesses get seen, get booked, and get paid. Let's make your online presence impossible to ignore.",
      cta: {
        label: "View My Work",
        link: "#projects"
      },
      image: "/images/professional.png"
    },
    {
      type: "about",
      headline: "read about me",
      content: "I'm a web developer based in Logan, Utah, serving businesses throughout Cache Valley and Northern Utah. With a focus on clean design and solid code, I help local businesses establish a strong online presence. Whether you're in Logan, Smithfield, or anywhere in Northern Utah, I'm here to help you build a website that drives real results.",
      image: "/images/professional.png"
    },
    {
      type: "projects",
      headline: "view my projects",
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
          link: "https://island-market.vercel.app/"
        },
        {
          title: "Fast Cache Pawn",
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
      ]
    },
    {
      type: "services",
      headline: "how much will it cost?",
      subheadline: "Transparent pricing for quality work",
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
      headline: "contact me",
      description: "Serving businesses in Logan, Smithfield, and throughout Cache Valley. Have a project in mind or just want to chat? Reach out and let's make something awesome for your Northern Utah business.",
      email: "msg@tylerlundin.me",
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