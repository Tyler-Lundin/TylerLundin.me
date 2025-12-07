import type { ProjectFull } from '@/types/projects';

export const zevlin: ProjectFull = {
  id: 'zevlin-bike',
  slug: 'zevlin-bike',
  title: 'Zevlin Bike',
  tagline: 'Full ecommerce + admin backend',
  description:
    'End-to-end ecommerce solution featuring a robust admin backend: catalog, pricing, inventory, orders, and analytics.',
  tech: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Vercel'],
  tags: ['Ecommerce', 'Admin', 'Fullstack'],
  links: [{ type: 'live', url: 'https://zevlinbike.com', label: 'Live' }],
  status: 'live',
  isHighlight: true,
  hasCaseStudy: true,
  startedAt: undefined,
  endedAt: undefined,
  media: [
    {
      id: 'zevlin-bike-hero-light',
      type: 'image',
      src: '/projects/zevlin-bike/home-light.png',
      alt: 'Zevlin Bike storefront home (light mode)',
      featured: true,
      variant: 'light',
      autoScroll: true,
    },
    {
      id: 'zevlin-bike-hero-dark',
      type: 'image',
      src: '/projects/zevlin-bike/home-dark.png',
      alt: 'Zevlin Bike storefront home (dark mode)',
      featured: true,
      variant: 'dark',
      autoScroll: true,
    },
  ],
  weight: 5,

  features: [
    {
      title: 'Product catalog with variants',
      summary: 'Rich product detail pages, variant selection, and image galleries.',
      category: 'commerce',
      badges: ['Variants', 'Galleries'],
      mediaIds: ['zevlin-bike-hero-light', 'zevlin-bike-hero-dark'],
    },
    {
      title: 'Fast, accessible storefront',
      summary: 'Optimized for performance and responsiveness across devices.',
      category: 'frontend',
      badges: ['Performance', 'Accessibility'],
    },
    {
      title: 'Admin backend',
      summary: 'Manage products, orders, customers, pricing, and promotions.',
      category: 'admin',
      badges: ['RBAC', 'Modules'],
    },
  ],

  adminBackend: {
    fullFeature: true,
    modules: [
      { name: 'Catalog', features: ['Products', 'Variants', 'Images', 'Collections'] },
      { name: 'Pricing', features: ['Discounts', 'Promotions', 'Currency'] },
      { name: 'Inventory', features: ['Tracking', 'Locations', 'Backorders'] },
      { name: 'Orders', features: ['Statuses', 'Refunds', 'RMA'] },
      { name: 'Customers', features: ['Profiles', 'Addresses', 'Order history'] },
      { name: 'Content', features: ['Pages', 'Banners'] },
      { name: 'Settings', features: ['Shipping', 'Tax', 'Payments'] },
    ],
    permissions: [
      { role: 'admin', permissions: ['*'] },
      {
        role: 'manager',
        permissions: [
          'catalog.read',
          'catalog.write',
          'orders.read',
          'orders.write',
          'customers.read',
          'pricing.read',
          'inventory.read',
        ],
      },
      { role: 'support', permissions: ['orders.read', 'customers.read'] },
    ],
    screenshots: ['zevlin-bike-hero-light', 'zevlin-bike-hero-dark'],
    tech: ['Next.js', 'Tailwind CSS'],
  },

  commerce: {
    catalog: { products: true, variants: true, images: true, collections: true },
    pricing: { discounts: true, promotions: true, currency: 'USD' },
    inventory: { tracked: true, locations: true, backorders: false },
    checkout: { multiStep: true, guest: true, addressValidation: true, shippingCalculator: true },
    orders: { statuses: ['placed', 'paid', 'fulfilled', 'returned'], rma: true, refunds: true },
    payments: { provider: 'Stripe', webhooks: true, methods: ['card', 'apple-pay', 'google-pay'] },
    shipping: { providers: ['UPS', 'USPS'], liveRates: true, zones: true },
    tax: { provider: 'custom', inclusive: false },
  },

  integrations: [
    { name: 'Stripe', category: 'payments' },
    { name: 'Google Analytics', category: 'analytics' },
  ],

  architecture: {
    overview: 'Next.js app deployed to Vercel with edge-optimized pages and server actions.',
    services: ['Storefront', 'Admin'],
    infra: ['Vercel'],
  },

  metrics: [
    { label: 'Homepage LCP', value: '1.9', unit: 's', context: 'mobile p75' },
  ],

  timeline: {
    milestones: [
      { date: '2024-01-01', title: 'Initial build' },
      { date: '2024-03-01', title: 'Admin modules' },
      { date: '2024-05-01', title: 'Launch' },
    ],
  },

  sections: [
    {
      key: 'overview',
      title: 'Overview',
      body:
        'Zevlin Bike combines a fast storefront with a comprehensive admin backend. Merchants manage catalog, pricing, and orders with role-based access.',
      mediaIds: ['zevlin-bike-hero-light'],
    },
    {
      key: 'admin',
      title: 'Admin Backend',
      body:
        'The admin provides modular management for catalog, pricing, inventory, orders, and customers. Permissions enable secure access for different roles.',
      mediaIds: ['zevlin-bike-hero-dark'],
    },
  ],
};

