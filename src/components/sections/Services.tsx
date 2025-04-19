'use client';

import { ServicesSection } from '@/types/site';
import { motion } from 'framer-motion';

interface ServicesProps {
  section: ServicesSection;
}

const tiers = [
  {
    name: 'Basic',
    price: '$49',
    description: 'Perfect for small businesses and startups',
    features: [
      'Basic website design and development',
      'Mobile-responsive layout',
      'Contact form integration',
      'Basic SEO optimization',
      'Monthly maintenance and updates',
      'Live development sessions with client input',
      '1-2 pages'
    ],
    cta: 'Get Started'
  },
  {
    name: 'Professional',
    price: '$89',
    description: 'Ideal for growing businesses',
    features: [
      'Everything in Basic',
      'Custom animations and interactions',
      'Blog integration',
      'Social media integration',
      'Advanced SEO optimization',
      'Analytics setup',
      '3-5 pages',
      'Priority support'
    ],
    cta: 'Get Started',
    featured: true
  },
  {
    name: 'Premium',
    price: '$149',
    description: 'For businesses needing advanced features',
    features: [
      'Everything in Professional',
      'Custom dashboard development',
      'E-commerce integration',
      'Advanced functionality',
      'API integrations',
      'Custom animations and micro-interactions',
      'Unlimited pages',
      '24/7 priority support'
    ],
    cta: 'Get Started'
  }
];

export function Services({ section }: ServicesProps) {
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

        {/* Unique Value Proposition */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mb-32 bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          <div className="grid md:grid-cols-2">
            <div className="p-12">
              <h3 className="text-3xl font-bold text-gray-900 mb-6">Live Development Experience</h3>
              <p className="text-lg text-gray-600 mb-8">
                Unlike traditional web development, I work with you in real-time. Watch as your website takes shape, provide instant feedback, and see changes happen right before your eyes.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-indigo-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-600">Real-time collaboration and feedback</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-indigo-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-600">Transparent development process</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-indigo-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-600">No surprises or hidden costs</span>
                </li>
              </ul>
            </div>
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-12 flex items-center justify-center">
              <div className="text-white text-center">
                <svg className="h-24 w-24 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <h4 className="text-2xl font-bold mb-4">See Your Vision Come to Life</h4>
                <p className="text-indigo-100">
                  Experience the magic of watching your website being built in real-time, with your input shaping every decision.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Pricing Tiers */}
        <div className="grid md:grid-cols-3 gap-8">
          {tiers.map((tier, index) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 * index }}
              className={`bg-white rounded-2xl shadow-xl overflow-hidden ${
                tier.featured ? 'ring-2 ring-indigo-500' : ''
              }`}
            >
              <div className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{tier.name}</h3>
                <p className="text-gray-600 mb-6">{tier.description}</p>
                <div className="mb-8">
                  <span className="text-4xl font-bold text-gray-900">{tier.price}</span>
                  <span className="text-gray-600">/month</span>
                </div>
                <ul className="space-y-4 mb-8">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start">
                      <svg className="h-6 w-6 text-indigo-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
                    tier.featured
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  {tier.cta}
                </button>
              </div>
            </motion.div>
          ))}
        </div>

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
                We&apos;ll schedule development sessions where you can watch me build your website in real-time. You&apos;ll have direct input on design decisions, and we can make changes immediately based on your feedback.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h4 className="text-xl font-semibold text-gray-900 mb-4">What&apos;s included in the monthly fee?</h4>
              <p className="text-gray-600">
                Your monthly fee covers hosting, maintenance, updates, and support. It&apos;s an all-inclusive package that ensures your website stays up-to-date and running smoothly.
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
                Custom features can be added to any plan for an additional fee. We&apos;ll discuss your specific needs and provide a custom quote for the additional development work.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
} 