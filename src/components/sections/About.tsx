'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { AboutSection } from '@/types/site';
import { motion } from 'framer-motion';

interface AboutProps {
  section: AboutSection;
}

export function About({ section }: AboutProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Define media items with their type and source
  const mediaItems = [
    { type: 'image', src: '/images/about-1.jpg' },
    { type: 'image', src: '/images/about-0.jpg' },
    { type: 'video', src: '/videos/clip-1.mp4' },
    { type: 'video', src: '/videos/clip-2.mp4' },
    { type: 'image', src: '/images/about-2.jpg' },
    { type: 'video', src: '/videos/clip-0.mp4' },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % mediaItems.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [mediaItems.length]);

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

          {/* Media Gallery */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative aspect-square rounded-2xl overflow-hidden shadow-xl"
          >
            {mediaItems.map((item, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-opacity duration-1000 ${
                  index === currentIndex ? 'opacity-100' : 'opacity-0'
                }`}
              >
                {item.type === 'video' ? (
                  <video
                    className="w-full h-full object-cover"
                    autoPlay
                    muted
                    loop
                    playsInline
                  >
                    <source src={item.src} type="video/mp4" />
                  </video>
                ) : (
                  <Image
                    src={item.src}
                    alt="About section image"
                    fill
                    className={`object-cover ${item.src === '/images/about-2.jpg' ? 'object-top' : ''}`}
                  />
                )}
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
} 