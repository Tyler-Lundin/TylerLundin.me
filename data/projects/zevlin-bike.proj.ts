export const project = {
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

export default project;

