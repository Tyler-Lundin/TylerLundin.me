export type Service = {
  slug: string;
  title: string;
  summary: string;
};

export const services: Service[] = [
  {
    slug: "web-hosting",
    title: "Web Hosting",
    summary: "Fast, secure hosting with SSL, backups, and monitoring.",
  },
  {
    slug: "web-design",
    title: "Web Design",
    summary: "Clean, modern designs optimized for conversion and speed.",
  },
  {
    slug: "logo-design",
    title: "Logo Design",
    summary: "Memorable brand identity tailored to your audience.",
  },
  {
    slug: "dashboards-data",
    title: "Custom Dashboards & Data",
    summary: "Functional dashboards, data pipelines, and visualizations.",
  },
  {
    slug: "authentication",
    title: "Authentication Systems",
    summary: "Secure auth, roles, and protected areas users can trust.",
  },
];

