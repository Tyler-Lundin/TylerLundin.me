'use client';

import { HobbiesSection } from '@/types/site';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

interface HobbiesProps {
  section: HobbiesSection;
}

const expertiseAreas = [
  {
    name: 'Web Development',
    description: 'Building modern, responsive websites and web applications',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
    features: [
      'Custom Website Development',
      'E-commerce Solutions',
      'Web Applications',
      'Performance Optimization',
      'Modern Tech Stack'
    ],
    cta: 'View Projects',
    link: '/projects',
    featured: true
  },
  {
    name: 'Bodybuilding',
    description: 'Fitness enthusiast sharing workout routines and progress',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
    features: [
      'Workout Programs',
      'Progress Tracking',
      'Nutrition Tips',
      'YouTube Channel',
      'Personal Training'
    ],
    cta: 'Watch Videos',
    link: 'https://youtube.com/@tylerlundin',
    featured: false
  },
  {
    name: 'Game Development',
    description: 'Creating immersive gaming experiences',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    features: [
      'Unity Development',
      'Game Design',
      '3D Modeling',
      'WIP Projects',
      'Game Mechanics'
    ],
    cta: 'View Projects',
    link: '/game-dev',
    featured: false
  },
  {
    name: '3D Printing',
    description: 'Bringing digital designs to life',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
    ),
    features: [
      'Custom Prints',
      'Design Portfolio',
      'Print Gallery',
      'Technical Projects',
      'Print Services'
    ],
    cta: 'View Gallery',
    link: '/3d-printing',
    featured: false
  },
  {
    name: 'Vehicles',
    description: 'Automotive enthusiast and project showcase',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
      </svg>
    ),
    features: [
      'Project Cars',
      'Modifications',
      'Build Logs',
      'Vehicle Profiles',
      'Maintenance Tips'
    ],
    cta: 'View Vehicles',
    link: '/vehicles',
    featured: false
  }
];

export function Hobbies({ section }: HobbiesProps) {
  const [selectedArea, setSelectedArea] = useState<typeof expertiseAreas[0] | null>(null);

  return (
    <section id="services" className="py-32 bg-gradient-to-b from-gray-200/50 to-white/50 dark:from-black/50 dark:to-gray-900/50 backdrop-blur-lg">
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

        {/* Expertise Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {expertiseAreas.map((area, index) => (
            <motion.button
              key={area.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 * index }}
              onClick={() => setSelectedArea(area)}
              className={`p-6 rounded-xl transition-all aspect-video duration-300 ease-in-out transform hover:-translate-y-1 group ${
                area.featured 
                  ? 'bg-gradient-to-br from-pink-600 via-purple-600 to-rose-600 dark:from-pink-500 dark:via-purple-500 dark:to-rose-500 text-white shadow-xl hover:shadow-purple-500/40 dark:hover:shadow-purple-400/50' 
                  : 'bg-white dark:bg-neutral-900/70 border border-slate-200 dark:border-neutral-800/80 text-slate-800 dark:text-neutral-100 hover:bg-slate-50 dark:hover:bg-neutral-800/90 hover:shadow-pink-500/20 dark:hover:shadow-pink-400/30'
              }`}
            >
              <div className="flex items-center mb-4">
                <div className={`p-2 rounded-lg ${
                  area.featured 
                    ? 'bg-white/20 text-white' 
                    : 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400'
                }`}>
                  {area.icon}
                </div>
                <h3 className="text-xl font-semibold ml-3 transition-colors">{area.name}</h3>
              </div>
              <p className="text-sm opacity-70 group-hover:opacity-90 transition-opacity text-left">{area.description}</p>
            </motion.button>
          ))}
        </div>

        {/* Modal for Detailed View */}
        <AnimatePresence>
          {selectedArea && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4"
              onClick={() => setSelectedArea(null)}
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
                    <div className="flex items-center">
                      <div className={`p-3 rounded-lg ${
                        selectedArea.featured 
                          ? 'bg-gradient-to-br from-pink-600 via-purple-600 to-rose-600 text-white' 
                          : 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400'
                      }`}>
                        {selectedArea.icon}
                      </div>
                      <div className="ml-4">
                        <h3 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 via-pink-600 to-purple-600 dark:from-cyan-400 dark:via-pink-400 dark:to-purple-400 mb-2">{selectedArea.name}</h3>
                        <p className="text-slate-600 dark:text-neutral-300">{selectedArea.description}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedArea(null)}
                      className="text-slate-400 hover:text-pink-500 dark:text-neutral-600 dark:hover:text-pink-400 transition-colors"
                    >
                      <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <ul className="space-y-4 mb-8">
                    {selectedArea.features.map((feature) => (
                      <li key={feature} className="flex items-start">
                        <svg className="h-6 w-6 text-pink-500 dark:text-pink-400 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-slate-700 dark:text-neutral-200">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <a
                    href={selectedArea.link}
                    target={selectedArea.link.startsWith('http') ? '_blank' : undefined}
                    rel={selectedArea.link.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className={`block w-full py-3.5 px-6 rounded-lg font-medium text-center transition-all duration-300 ease-in-out shadow-md hover:shadow-lg transform hover:-translate-y-0.5 ${
                      selectedArea.featured
                        ? 'bg-gradient-to-r from-pink-600 via-purple-600 to-rose-600 dark:from-pink-500 dark:via-purple-500 dark:to-rose-500 text-white hover:from-pink-500 hover:to-rose-500'
                        : 'bg-cyan-500 text-white hover:bg-cyan-400 dark:bg-cyan-600 dark:text-white dark:hover:bg-cyan-500'
                    }`}
                  >
                    {selectedArea.cta}
                  </a>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
} 