import type { ProjectFull } from '@/types/projects';


export const cmsProject = {
  id: 'p1',
  slug: 'zevlinbike-store',
  title: 'Zevlin Bike eCommerce Store',
  client_id: 'c1',
  status: 'in_progress',
  priority: 'high',
  created_at: '2025-12-25T18:00:00Z',
  client: { id: 'c1', name: 'Zevlin Bike' },
  services: [
    { id: 's1', key: 'website', name: 'Website' },
    { id: 's2', key: 'ecommerce', name: 'eCommerce' },
    { id: 's3', key: 'payments', name: 'Payments (Stripe)' },
    { id: 's4', key: 'shipping', name: 'Shipping (Shippo)' },
    { id: 's5', key: 'cms', name: 'Admin CMS' },
    { id: 's6', key: 'blog', name: 'Blog' }
  ],
  links: [
    { id: 'l1', type: 'production', url: 'https://zevlinbike.com', label: 'Production', is_client_visible: true, created_at: '2025-12-25T18:15:00Z' },
    { id: 'l2', type: 'staging', url: 'https://staging.zevlinbike.com', label: 'Staging', is_client_visible: true, created_at: '2025-12-25T18:16:00Z' },
    { id: 'l3', type: 'admin', url: 'https://zevlinbike.com/admin', label: 'Admin Dashboard', is_client_visible: false, created_at: '2025-12-25T18:17:00Z' }
  ],
  lists: [
    {
      id: 'g1',
      key: 'goals',
      title: 'MVP Launch Goals',
      created_at: '2025-12-25T18:05:00Z',
      items: [
        { id: 'i1', title: 'Implement checkout with Stripe', status: 'in_progress', priority: 'high', assignee_user_id: null, due_at: '2025-12-27T23:59:59Z', sort: 1, is_client_visible: true, created_at: '2025-12-25T18:30:00Z' },
        { id: 'i2', title: 'Configure Shippo webhook and rates', status: 'todo', priority: 'normal', assignee_user_id: null, due_at: '2025-12-28T23:59:59Z', sort: 2, is_client_visible: true, created_at: '2025-12-25T18:31:00Z' },
        { id: 'i3', title: 'Seed product catalog and inventory', status: 'in_progress', priority: 'normal', assignee_user_id: null, due_at: null, sort: 3, is_client_visible: true, created_at: '2025-12-25T18:32:00Z' },
        { id: 'i4', title: 'Harden Supabase auth & RLS policies', status: 'todo', priority: 'high', assignee_user_id: null, due_at: null, sort: 4, is_client_visible: false, created_at: '2025-12-25T18:33:00Z' },
        { id: 'i5', title: 'Publish Privacy & Shipping pages', status: 'in_progress', priority: 'normal', assignee_user_id: null, due_at: null, sort: 5, is_client_visible: true, created_at: '2025-12-25T18:34:00Z' }
      ]
    }
  ],
  notes: [
    { id: 'n1', author_id: 'u_admin', body: 'MVP scope set: Next.js + Supabase, Stripe payments, Shippo shipping, admin CMS, blog. Target one-week MVP.', is_private: true, created_at: '2025-12-25T18:45:00Z' },
    { id: 'n2', author_id: 'u_admin', body: 'Domains to treat as internal: zevlinbike.com, www.zevlinbike.com.', is_private: false, created_at: '2025-12-25T18:46:00Z' }
  ]
} as const;





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

