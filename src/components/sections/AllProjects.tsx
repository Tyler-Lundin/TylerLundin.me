'use client';

import { ProjectsSection } from '@/types/site';
import { motion } from 'framer-motion';
import { MainFocusBanner } from './MainFocusBanner';

interface projectsProps {
  section: ProjectsSection;
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
      'Modern Technologies'
    ],
    cta: 'View Projects',
    link: '/projects/web-dev',
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
    link: 'https://youtube.com/@MediocreTyler',
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
    link: '/projects/3d-printing',
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
    link: '/projects/vehicles',
    featured: false
  }
];

export function AllProjects({ section }: projectsProps) {
  const mainFocus = expertiseAreas.find(area => area.name === 'Web Development');
  const otherInterests = expertiseAreas.filter(area => area.name !== 'Web Development');

  return (
    <section id="services" className="py-40 bg-gradient-to-b from-gray-100/50 to-white/50 dark:from-black/50 dark:to-gray-900/50 ">
      <div className="max-w-[90rem] mx-auto px-6 sm:px-8 lg:px-12">
        {/* Hero Section */}
        <div className="text-center mb-32">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-7xl font-black mb-8 text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 via-pink-600 to-purple-600 dark:from-cyan-400 dark:via-pink-400 dark:to-purple-400 tracking-tight leading-[1.1]"
          >
            {section.headline}
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="text-2xl text-slate-600 dark:text-neutral-300 max-w-4xl mx-auto leading-relaxed"
          >
            {section.subheadline}
          </motion.p>
        </div>

        {/* Main Focus - Web Development */}
        {mainFocus && (
          <MainFocusBanner
            title={mainFocus.name}
            description={mainFocus.description}
            features={mainFocus.features}
            link={mainFocus.link}
          />
        )}

        {/* Other Interests Section */}
        <div className="text-center mb-16">
          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-4xl font-bold text-slate-800 dark:text-neutral-100 mb-4"
          >
            Other Interests
          </motion.h3>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-xl text-slate-600 dark:text-neutral-300"
          >
            Here&apos;s what else I&apos;m passionate about
          </motion.p>
        </div>

        {/* Other Interest Cards */}
        <div className="grid lg:grid-cols-3 gap-6">
          {otherInterests.map((area, index) => (
            <motion.a
              href={area.link}
              target="_blank"
              rel="noopener noreferrer"
              key={area.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.2 * index }}
              className="group relative p-8 shadow rounded-2xl bg-white/40 dark:bg-neutral-900/40 backdrop-blur-lg border border-white/20 dark:border-neutral-800/50 text-slate-800 dark:text-neutral-100 hover:bg-white/50 dark:hover:bg-neutral-900/50 transition-all duration-500 ease-in-out transform hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:hover:shadow-[0_8px_30px_rgb(0,0,0,0.3)]"
            >
              <div className="flex items-center mb-6">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-pink-500/10 to-purple-500/10 dark:from-pink-500/20 dark:to-purple-500/20 text-pink-600 dark:text-pink-400 group-hover:scale-110 transition-transform duration-300">
                  {area.icon}
                </div>
                <h3 className="text-xl font-semibold ml-4 bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">{area.name}</h3>
              </div>
              <p className="text-base text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">{area.description}</p>
              <div className="flex flex-wrap gap-2">
                {area.features.map((feature, idx) => (
                  <span 
                    key={idx} 
                    className="px-3 py-1.5 rounded-full text-sm font-medium bg-gradient-to-r from-pink-500/10 to-purple-500/10 dark:from-pink-500/20 dark:to-purple-500/20 text-pink-600 dark:text-pink-400 border border-pink-200/20 dark:border-pink-500/20 backdrop-blur-sm"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
} 