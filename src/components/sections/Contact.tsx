'use client';

import { ContactSection } from '@/types/site';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/types/database.types';

type ContactSubmission = Database['public']['Tables']['contact_submissions']['Insert']

interface ContactProps {
  section: ContactSection;
}

const SOCIAL_LINKS = [
  {
    name: 'GitHub',
    url: 'https://github.com/tyler-lundin'
  },
  {
    name: "YouTube",
    url: 'https://www.youtube.com/mediocretyler'
  },
  {
    name: "Instagram",
    url: 'https://www.instagram.com/tylerlundin_'
  }
]

export function Contact({ section }: ContactProps) {
  
  const [formData, setFormData] = useState<ContactSubmission>({
    name: '',
    email: '',
    message: '',

    status: 'new'
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setError(null);

    try {
      const { error } = await supabase
        .from('contact_submissions')
        .insert([formData]);

      if (error) throw error;

      setStatus('success');
      setFormData({
        name: '',
        email: '',
        message: '',
        status: 'new'
      });
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Something went wrong');
    }
  };

  return (
    <section id="contact" className="py-32">
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
            {section.description}
          </motion.p>
        </div>

        {/* Contact Methods */}
        <div className="grid md:grid-cols-2 gap-12 mb-24">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 p-4 md:p-8 hover:shadow-pink-500/10 dark:hover:shadow-pink-400/20 transition-all duration-300"
          >
            <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-pink-600 dark:from-cyan-400 dark:to-pink-400 mb-6">Send a Message</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500/50 transition-colors"
                  required
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500/50 transition-colors"
                  required
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500/50 transition-colors"
                  required
                />
              </div>
              {error && (
                <div className="text-rose-500 dark:text-rose-400 text-sm">
                  {error}
                </div>
              )}
              {status === 'success' && (
                <div className="text-emerald-500 dark:text-emerald-400 text-sm">
                  Message sent successfully! I&apos;ll get back to you soon.
                </div>
              )}
              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full py-3 px-6 bg-gradient-to-r from-pink-600 to-purple-600 dark:from-pink-500 dark:to-purple-500 text-white font-medium rounded-lg hover:from-pink-500 hover:to-purple-500 dark:hover:from-pink-400 dark:hover:to-purple-400 transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                {status === 'loading' ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative backdrop-blur-xl bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/10 rounded-2xl shadow-2xl p-6 md:p-8 text-white overflow-hidden"
          >
            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-purple-500/20 to-pink-500/20 dark:from-cyan-600/20 dark:via-purple-600/20 dark:to-pink-600/20" />
            
            {/* Animated grid pattern */}
            <div className="absolute inset-0 bg-grid-white/5 animate-grid" style={{ 
              maskImage: 'linear-gradient(to bottom, transparent, black)', 
              WebkitMaskImage: 'linear-gradient(to bottom, transparent, black)',
              backgroundSize: '50px 50px'
            }} />
            
            <div className="relative z-10">
              <h3 className="text-2xl font-bold mb-8 bg-clip-text text-black/75 dark:text-white/75 bg-gradient-to-r from-white to-white/80">
                Other Ways to Connect
              </h3>
              
              <div className="space-y-8">
                <div className="backdrop-blur-sm bg-white/5 dark:bg-black/10 rounded-xl p-4 border border-white/10">
                  <h4 className="text-lg font-semibold mb-4 text-black/90 dark:text-white/90">Social Media</h4>
                  <div className="flex flex-col gap-3"> 
                  {SOCIAL_LINKS.map((link) => (
                    <a
                      key={link.name}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-black/80 dark:text-white/80 hover:blur-[2px] transition-all duration-300 hover:translate-x-1 flex items-center gap-2"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 dark:bg-emerald-500" />
                      {link.name}
                    </a>
                  ))}
                  </div>
                </div>

                <div className="backdrop-blur-sm bg-white/5 dark:bg-black/10 rounded-xl p-4 border border-white/10">
                  <h4 className="text-lg font-semibold mb-4 text-black/90 dark:text-white/90">Email</h4>
                  <a
                    href={`mailto:${section.email}`}
                    className="text-black/80 dark:text-white/80 hover:blur-[2px] transition-all duration-300 hover:translate-x-1 flex items-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 dark:bg-emerald-500" />
                    {section.email}
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Web Development Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-24"
        >
          <h3 className="text-3xl font-bold text-center mb-12 text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 via-pink-600 to-purple-600 dark:from-cyan-400 dark:via-pink-400 dark:to-purple-400">Web Development FAQ</h3>
          <div className="grid md:grid-cols-2 gap-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-slate-200/50 dark:border-slate-700/50 hover:shadow-pink-500/10 dark:hover:shadow-pink-400/20 transition-all duration-300"
            >
              <h4 className="text-xl font-semibold text-pink-600 dark:text-pink-400 mb-4">How quickly can we start?</h4>
              <p className="text-slate-600 dark:text-slate-300">
                I can typically start new projects within 1-2 weeks. For urgent projects, I can sometimes accommodate a faster start date.
              </p>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-slate-200/50 dark:border-slate-700/50 hover:shadow-pink-500/10 dark:hover:shadow-pink-400/20 transition-all duration-300"
            >
              <h4 className="text-xl font-semibold text-pink-600 dark:text-pink-400 mb-4">What&apos;s the development process?</h4>
              <p className="text-slate-600 dark:text-slate-300">
                We&apos;ll start with a discovery call, then move to design and development. You&apos;ll be involved throughout the process with regular updates and feedback sessions.
              </p>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-slate-200/50 dark:border-slate-700/50 hover:shadow-pink-500/10 dark:hover:shadow-pink-400/20 transition-all duration-300"
            >
              <h4 className="text-xl font-semibold text-pink-600 dark:text-pink-400 mb-4">Do you offer ongoing support?</h4>
              <p className="text-slate-600 dark:text-slate-300">
                Yes! All plans include monthly maintenance and updates. I&apos;m also available for additional support and feature requests.
              </p>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-slate-200/50 dark:border-slate-700/50 hover:shadow-pink-500/10 dark:hover:shadow-pink-400/20 transition-all duration-300"
            >
              <h4 className="text-xl font-semibold text-pink-600 dark:text-pink-400 mb-4">Can I see examples of your work?</h4>
              <p className="text-slate-600 dark:text-slate-300">
                Absolutely! Check out my portfolio section or request specific examples during our initial call.
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
} 