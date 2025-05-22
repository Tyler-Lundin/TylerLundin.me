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
    <section id="services" className="py-32 bg-gradient-to-b from-slate-50 to-white dark:from-black dark:to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-24">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-5xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 via-pink-600 to-purple-600 dark:from-cyan-400 dark:via-pink-400 dark:to-purple-400 tracking-tight leading-tight pb-2"
          >
            {section.headline}
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl text-slate-600 dark:text-neutral-300 max-w-3xl mx-auto leading-relaxed"
          >
            {section.subheadline}
          </motion.p>
        </div>

        {/* Compact Pricing Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-16">
          {tiers.map((tier, index) => (
            <motion.button
              key={tier.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 * index }}
              onClick={() => setSelectedTier(tier)}
              className={`p-6 rounded-xl transition-all duration-300 ease-in-out transform hover:-translate-y-1 group ${
                tier.featured 
                  ? 'bg-gradient-to-br from-pink-600 via-purple-600 to-rose-600 dark:from-pink-500 dark:via-purple-500 dark:to-rose-500 text-white shadow-xl hover:shadow-purple-500/40 dark:hover:shadow-purple-400/50' 
                  : 'bg-white dark:bg-neutral-900/70 border border-slate-200 dark:border-neutral-800/80 text-slate-800 dark:text-neutral-100 hover:bg-slate-50 dark:hover:bg-neutral-800/90 hover:shadow-pink-500/20 dark:hover:shadow-pink-400/30'
              }`}
            >
              <h3 className="text-xl font-semibold mb-2 group-hover:text-white transition-colors">{tier.name}</h3>
              <div className="mb-2">
                <span className="text-3xl font-bold group-hover:text-white transition-colors">{tier.price}</span>
                <span className="text-sm opacity-70 group-hover:opacity-90 transition-opacity">/month</span>
              </div>
              <p className="text-sm opacity-70 group-hover:opacity-90 transition-opacity">{tier.description}</p>
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
              className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4"
              onClick={() => setSelectedTier(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800/70 rounded-2xl shadow-2xl shadow-purple-500/20 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                onClick={e => e.stopPropagation()}
              >
                <div className="p-8">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 via-pink-600 to-purple-600 dark:from-cyan-400 dark:via-pink-400 dark:to-purple-400 mb-2">{selectedTier.name}</h3>
                      <p className="text-slate-600 dark:text-neutral-300">{selectedTier.description}</p>
                    </div>
                    <button
                      onClick={() => setSelectedTier(null)}
                      className="text-slate-400 hover:text-pink-500 dark:text-neutral-600 dark:hover:text-pink-400 transition-colors"
                    >
                      <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-slate-900 dark:text-white">{selectedTier.price}</span>
                    <span className="text-slate-500 dark:text-neutral-400">/month</span>
                  </div>
                  <ul className="space-y-4 mb-8">
                    {selectedTier.features.map((feature) => (
                      <li key={feature} className="flex items-start">
                        <svg className="h-6 w-6 text-pink-500 dark:text-pink-400 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-slate-700 dark:text-neutral-200">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    className={`w-full py-3.5 px-6 rounded-lg font-medium transition-all duration-300 ease-in-out shadow-md hover:shadow-lg transform hover:-translate-y-0.5 ${
                      selectedTier.featured
                        ? 'bg-gradient-to-r from-pink-600 via-purple-600 to-rose-600 dark:from-pink-500 dark:via-purple-500 dark:to-rose-500 text-white hover:from-pink-500 hover:to-rose-500'
                        : 'bg-cyan-500 text-white hover:bg-cyan-400 dark:bg-cyan-600 dark:text-white dark:hover:bg-cyan-500'
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
          className="mt-24"
        >
          <div className="bg-white dark:bg-neutral-900/60 rounded-2xl shadow-xl overflow-hidden border border-slate-200 dark:border-neutral-800/50">
            <div className="grid md:grid-cols-3">
              {/* Left Content */}
              <div className="md:col-span-2 p-6 md:p-8 lg:p-12">
                <h3 className="text-3xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 via-pink-600 to-purple-600 dark:from-cyan-400 dark:via-pink-400 dark:to-purple-400">Need Something Different?</h3>
                <p className="text-slate-600 dark:text-neutral-300 mb-8 leading-relaxed">
                  I understand that every business has unique needs and budgets. Here are some flexible options:
                </p>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-slate-50 dark:bg-neutral-800/40 rounded-xl p-6 border border-slate-200 dark:border-neutral-700/60">
                    <h4 className="text-xl font-semibold text-pink-600 dark:text-pink-400 mb-3">One-Time Build</h4>
                    <p className="text-slate-600 dark:text-neutral-300 mb-4 text-sm">
                      Perfect if you want to handle maintenance yourself. One-time fee for setup ($300–$800 depending on scope).
                    </p>
                    <ul className="space-y-2 text-slate-600 dark:text-neutral-300 text-sm">
                      <li className="flex items-center">
                        <svg className="h-5 w-5 text-cyan-500 dark:text-cyan-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Custom website built to your specs
                      </li>
                      <li className="flex items-center">
                        <svg className="h-5 w-5 text-cyan-500 dark:text-cyan-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Full hosting handoff
                      </li>
                      <li className="flex items-center">
                        <svg className="h-5 w-5 text-cyan-500 dark:text-cyan-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Documentation and training
                      </li>
                    </ul>
                  </div>
                  <div className="bg-slate-50 dark:bg-neutral-800/40 rounded-xl p-6 border border-slate-200 dark:border-neutral-700/60">
                    <h4 className="text-xl font-semibold text-pink-600 dark:text-pink-400 mb-3">Basic Hosting</h4>
                    <p className="text-slate-600 dark:text-neutral-300 mb-4 text-sm">
                      If you just need hosting and basic maintenance after your one-time build.
                    </p>
                    <ul className="space-y-2 text-slate-600 dark:text-neutral-300 text-sm">
                      <li className="flex items-center">
                        <svg className="h-5 w-5 text-cyan-500 dark:text-cyan-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        $15–$25/month
                      </li>
                      <li className="flex items-center">
                        <svg className="h-5 w-5 text-cyan-500 dark:text-cyan-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Hosting + security updates
                      </li>
                      <li className="flex items-center">
                        <svg className="h-5 w-5 text-cyan-500 dark:text-cyan-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Domain management
                      </li>
                    </ul>
                  </div>
                </div>
                <p className="text-slate-600 dark:text-neutral-300 mt-8 text-sm">
                  Need a custom plan or have a specific budget in mind? Just reach out — I work with all budgets and will find a solution that works for you.
                </p>
              </div>
              
              {/* Right Content - Visual Element */}
              <div className="hidden md:block bg-gradient-to-br from-purple-600 via-pink-600 to-rose-600 dark:from-purple-700 dark:via-pink-700 dark:to-rose-600 p-8 md:p-12 relative overflow-hidden">
                <div className="absolute inset-0 bg-grid-pink-300/10 dark:bg-grid-pink-400/10" />
                <div className="relative z-10 h-full flex flex-col justify-center">
                  <div className="text-white text-center">
                    <svg className="h-20 w-20 mx-auto mb-6 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <h4 className="text-2xl font-bold mb-4">Custom Solutions</h4>
                    <p className="text-rose-100 dark:text-pink-200 opacity-90 mb-6">
                      Every project is unique. Let&apos;s work together to create a solution that fits your specific needs and budget.
                    </p>
                    <div className="space-y-3">
                      <div className="bg-white/15 dark:bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                        <h5 className="font-semibold mb-1">Project-Based</h5>
                        <p className="text-sm text-rose-100 dark:text-pink-200 opacity-80">Pay once, own forever</p>
                      </div>
                      <div className="bg-white/15 dark:bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                        <h5 className="font-semibold mb-1">Subscription</h5>
                        <p className="text-sm text-rose-100 dark:text-pink-200 opacity-80">Ongoing support & updates</p>
                      </div>
                      <div className="bg-white/15 dark:bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                        <h5 className="font-semibold mb-1">Hybrid</h5>
                        <p className="text-sm text-rose-100 dark:text-pink-200 opacity-80">Mix of both approaches</p>
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
          <h3 className="text-4xl font-bold text-center mb-16 text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 via-pink-600 to-purple-600 dark:from-cyan-400 dark:via-pink-400 dark:to-purple-400 tracking-tight">Frequently Asked Questions</h3>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                q: "How does the live development process work?",
                a: "We'll schedule development sessions where you can watch me build your website in real-time. You'll have direct input on design decisions, and we can make changes immediately based on your feedback."
              },
              {
                q: "What's included in the monthly fee?",
                a: "Your monthly fee covers hosting, maintenance, updates, and support. It's an all-inclusive package that ensures your website stays up-to-date and running smoothly."
              },
              {
                q: "Can I upgrade or downgrade my plan?",
                a: "Yes, you can change your plan at any time. Upgrades take effect immediately, while downgrades will apply at the start of your next billing cycle."
              },
              {
                q: "What if I need custom features?",
                a: "Custom features can be added to any plan for an additional fee. We'll discuss your specific needs and provide a custom quote for the additional development work."
              }
            ].map((faq, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                className="bg-white dark:bg-neutral-900/70 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-neutral-800/70 hover:shadow-pink-500/20 dark:hover:shadow-pink-400/30 transition-shadow"
              >
                <h4 className="text-xl font-semibold text-pink-600 dark:text-pink-400 mb-3">{faq.q}</h4>
                <p className="text-slate-600 dark:text-neutral-300 leading-relaxed">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
} 