'use client';

import Image from 'next/image';
import { AboutSection } from '@/types/site';
import { motion } from 'framer-motion';

interface AboutProps {
  section: AboutSection;
}

export function About({ section }: AboutProps) {
  return (
    <section id="about" className="py-32 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-6">{section.headline}</h2>
            <p className="text-lg text-gray-600 mb-8">{section.content}</p>
          </motion.div>

          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative aspect-square rounded-2xl overflow-hidden shadow-xl"
          >
            <Image
              src={section.image}
              alt="Professional portrait"
              fill
              className="object-cover"
              priority
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
} 