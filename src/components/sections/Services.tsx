'use client';

import { ServicesSection } from '@/types/site';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

interface ServicesProps {
  section: ServicesSection;
}
const tiers = [
  {
    name: 'Starter',
    price: '$29',
    description: 'For tight budgets or simple landing pages',
    features: [
      '1-page static site',
      'Mobile responsive',
      'Basic contact form or link',
      'Fast turnaround',
      'Simple maintenance'
    ],
    cta: 'Get Started'
  },
  {
    name: 'Basic',
    price: '$49',
    description: 'Perfect for small businesses, solopreneurs, or side hustles',
    features: [
      'Custom 1–2 page website (Home + Contact/About)',
      'Mobile-optimized responsive design',
      'Contact form setup with email delivery',
      'Lightweight SEO (meta tags, speed, accessibility)',
      'Monthly maintenance (bug fixes, small updates)',
      'Optional live development sessions with client input',
      'Hosting on Vercel included'
    ],
    cta: 'Get Started'
  },
  {
    name: 'Professional',
    price: '$89',
    description: 'Ideal for growing brands who want more control and visibility',
    features: [
      'Everything in Basic',
      'Up to 5 pages total',
      'Custom scroll animations & subtle transitions',
      'Blog or CMS integration (Markdown, Notion, Supabase)',
      'Social media links and OG preview cards',
      'Google Analytics setup',
      'Advanced SEO (schema, sitemap, basic keyword targeting)',
      'Priority support & faster turnaround'
    ],
    cta: 'Get Started',
    featured: true
  },
  {
    name: 'Premium',
    price: '$149',
    description: 'For businesses that need real tools, not just a pretty site',
    features: [
      'Everything in Professional',
      'Custom dashboard or admin panel development',
      'E-commerce setup (Stripe, LemonSqueezy, etc.)',
      'Real backend features (auth, gated content, forms)',
      'API integrations (Calendly, Zapier, CRMs, Stripe)',
      'Custom micro-interactions (UX animations, feedback states)',
      'Scalable codebase and deployment setup',
      'Up to 2 hours/month of feature tweaks or updates',
      '24/7 message-based support (Slack, Discord, email)'
    ],
    cta: 'Get Started'
  }
];

export function Services({ section }: ServicesProps) {
  const [selectedTier, setSelectedTier] = useState<typeof tiers[0] | null>(null);

  return (
    <section id="services" className="py-32 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-24">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-5xl font-bold text-gray-900 mb-6"
          >
            {section.headline}
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl text-gray-600 max-w-3xl mx-auto"
          >
            I build beautiful, functional websites with your direct input. Watch your site come to life in real-time during our development sessions.
          </motion.p>
        </div>

        {/* Compact Pricing Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-16">
          {tiers.map((tier, index) => (
            <motion.button
              key={tier.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 * index }}
              onClick={() => setSelectedTier(tier)}
              className={`p-6 rounded-xl shadow-lg transition-all duration-200 hover:shadow-xl ${
                tier.featured 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-white text-gray-900 hover:bg-gray-50'
              }`}
            >
              <h3 className="text-xl font-bold mb-2">{tier.name}</h3>
              <div className="mb-2">
                <span className="text-2xl font-bold">{tier.price}</span>
                <span className="text-sm opacity-80">/month</span>
              </div>
              <p className="text-sm opacity-80">{tier.description}</p>
            </motion.button>
          ))}
        </div>

        {/* Modal for Detailed View */}
        <AnimatePresence>
          {selectedTier && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
              onClick={() => setSelectedTier(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                onClick={e => e.stopPropagation()}
              >
                <div className="p-8">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">{selectedTier.name}</h3>
                      <p className="text-gray-600">{selectedTier.description}</p>
                    </div>
                    <button
                      onClick={() => setSelectedTier(null)}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-gray-900">{selectedTier.price}</span>
                    <span className="text-gray-600">/month</span>
                  </div>
                  <ul className="space-y-4 mb-8">
                    {selectedTier.features.map((feature) => (
                      <li key={feature} className="flex items-start">
                        <svg className="h-6 w-6 text-indigo-600 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
                      selectedTier.featured
                        ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    {selectedTier.cta}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Flexible Pricing Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-16"
        >
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="grid md:grid-cols-3">
              {/* Left Content */}
              <div className="md:col-span-2 p-8 md:p-12">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Need Something Different?</h3>
                <p className="text-gray-600 mb-6">
                  I understand that every business has unique needs and budgets. Here are some flexible options:
                </p>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h4 className="text-xl font-semibold text-gray-900 mb-3">One-Time Build</h4>
                    <p className="text-gray-600 mb-4">
                      Perfect if you want to handle maintenance yourself. One-time fee for setup ($300–$800 depending on scope).
                    </p>
                    <ul className="space-y-2 text-gray-600">
                      <li className="flex items-center">
                        <svg className="h-5 w-5 text-indigo-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Custom website built to your specs
                      </li>
                      <li className="flex items-center">
                        <svg className="h-5 w-5 text-indigo-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Full hosting handoff
                      </li>
                      <li className="flex items-center">
                        <svg className="h-5 w-5 text-indigo-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Documentation and training
                      </li>
                    </ul>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h4 className="text-xl font-semibold text-gray-900 mb-3">Basic Hosting</h4>
                    <p className="text-gray-600 mb-4">
                      If you just need hosting and basic maintenance after your one-time build.
                    </p>
                    <ul className="space-y-2 text-gray-600">
                      <li className="flex items-center">
                        <svg className="h-5 w-5 text-indigo-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        $15–$25/month
                      </li>
                      <li className="flex items-center">
                        <svg className="h-5 w-5 text-indigo-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Hosting + security updates
                      </li>
                      <li className="flex items-center">
                        <svg className="h-5 w-5 text-indigo-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Domain management
                      </li>
                    </ul>
                  </div>
                </div>
                <p className="text-gray-600 mt-8">
                  Need a custom plan or have a specific budget in mind? Just reach out — I work with all budgets and will find a solution that works for you.
                </p>
              </div>
              
              {/* Right Content - Visual Element */}
              <div className="hidden md:block bg-gradient-to-br from-indigo-500 to-purple-600 p-8 md:p-12 relative overflow-hidden">
                <div className="absolute inset-0 bg-grid-white/10" />
                <div className="relative z-10 h-full flex flex-col justify-center">
                  <div className="text-white text-center">
                    <svg className="h-24 w-24 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <h4 className="text-2xl font-bold mb-4">Custom Solutions</h4>
                    <p className="text-indigo-100 mb-6">
                      Every project is unique. Let's work together to create a solution that fits your specific needs and budget.
                    </p>
                    <div className="space-y-4">
                      <div className="bg-white/10 rounded-lg p-4">
                        <h5 className="font-semibold mb-2">Project-Based</h5>
                        <p className="text-sm text-indigo-100">Pay once, own forever</p>
                      </div>
                      <div className="bg-white/10 rounded-lg p-4">
                        <h5 className="font-semibold mb-2">Subscription</h5>
                        <p className="text-sm text-indigo-100">Ongoing support & updates</p>
                      </div>
                      <div className="bg-white/10 rounded-lg p-4">
                        <h5 className="font-semibold mb-2">Hybrid</h5>
                        <p className="text-sm text-indigo-100">Mix of both approaches</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* FAQ Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-32"
        >
          <h3 className="text-3xl font-bold text-gray-900 text-center mb-12">Frequently Asked Questions</h3>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h4 className="text-xl font-semibold text-gray-900 mb-4">How does the live development process work?</h4>
              <p className="text-gray-600">
                We'll schedule development sessions where you can watch me build your website in real-time. You'll have direct input on design decisions, and we can make changes immediately based on your feedback.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h4 className="text-xl font-semibold text-gray-900 mb-4">What's included in the monthly fee?</h4>
              <p className="text-gray-600">
                Your monthly fee covers hosting, maintenance, updates, and support. It's an all-inclusive package that ensures your website stays up-to-date and running smoothly.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h4 className="text-xl font-semibold text-gray-900 mb-4">Can I upgrade or downgrade my plan?</h4>
              <p className="text-gray-600">
                Yes, you can change your plan at any time. Upgrades take effect immediately, while downgrades will apply at the start of your next billing cycle.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h4 className="text-xl font-semibold text-gray-900 mb-4">What if I need custom features?</h4>
              <p className="text-gray-600">
                Custom features can be added to any plan for an additional fee. We'll discuss your specific needs and provide a custom quote for the additional development work.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
} 