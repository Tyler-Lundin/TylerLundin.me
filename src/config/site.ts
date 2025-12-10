import { SiteConfig } from '@/types/site';

export const siteConfig: SiteConfig = {
  site_name: "Tyler Lundin",
  domain: "tylerlundin.me",
  tagline: "Web Developer in Spokane, WA | Spokane Web Development",
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
      type: "home",
      headline: "home",
      subheadline: "I'm Tyler, a freelance web developer based in Spokane, WA. I build sleek, blazing-fast websites that don't just look good—they perform. From custom booking systems to full-blown e-commerce, I help local businesses get seen, get booked, and get paid. Let's make your online presence impossible to ignore.",
      cta: {
        label: "portfolio",
        link: "#projects"
      },
      image: "/images/tyler.png"
    },
    {
      type: "about",
      headline: "about",
      content: "I'm a web developer based in Spokane, WA, serving businesses throughout the Inland Northwest. With a focus on clean design and solid code, I help local businesses establish a strong online presence. Whether you're in Spokane, Spokane Valley, or anywhere in the Inland Northwest, I'm here to help you build a website that drives real results.",
      image: "/images/tyler.png"
    },
    {
      type: "projects",
      headline: "projects",
      subheadline: "Web development and related services only: Web Hosting, Web Design, Logo Design, Custom Dashboards & Data, Authentication Systems.",
      items: [
        "Web Development",
        "Web Hosting",
        "Web Design",
        "Logo Design",
        "Custom Dashboards & Data",
        "Authentication Systems"
      ]
    },
    { type: "blog", headline: "blog" },
    {
      type: "contact",
      headline: "contact",
      description: "Serving businesses in Spokane and throughout the Inland Northwest. Have a project in mind or just want to chat? Reach out and let's make something awesome for your Spokane business.",
      email: "msg@tylerlundin.me",
      social: {
        github: "https://github.com/tyler-lundin",
        linkedin: "https://linkedin.com/in/tyler-lundin",
        twitter: "https://twitter.com/tylerlundin"
      }
    },
    
  ],
  footer: {
    text: "© 2025 Tyler Lundin. Serving Spokane and the Inland Northwest.",
    links: [
      { label: "Privacy Policy", url: "/privacy" },
      { label: "GitHub", url: "https://github.com/tyler-lundin" }
    ]
  }
}; 
