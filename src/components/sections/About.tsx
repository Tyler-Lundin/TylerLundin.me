'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import AnimatedBackground from '../AnimatedBackground';

export function About() {
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
            className="space-y-8"
          >
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Tyler Lundin: The Rogue Webdev
              </h2>
              <p className="text-xl font-bold text-indigo-600 mb-2">
              Nomadic by nature, caffeinated by code, and running on a mix of wanderlust and raw determination. 
              </p>
            </div>
            
            <div className="space-y-6">
              <p className="text-md text-gray-600 leading-relaxed">
                I&apos;m a self-taught developer, gearhead, and builder at heart—someone who thrives on creating from scratch and solving problems with clean code and sharper ideas. Whether I&apos;m fine-tuning a landing page or rebuilding an app backend from the ground up, I bring the same energy: focused, fast-moving, and forward-thinking.
              </p>
              
              <p className="text-md text-gray-600 leading-relaxed">
              Based in Spokane, I specialize in high-performance sites, custom booking platforms, and local-first SEO strategies that make businesses hard to miss. No fluff, no gimmicks—just handcrafted digital tools that do the job.
              </p>
            </div>
          </motion.div>

          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="hidden md:flex justify-center items-center"
          >
            <motion.div 
              className="w-[400px] h-[400px] relative bg-gradient-to-r from-red-900 via-white/75 to-blue-900 rounded-full overflow-hidden"
              animate={{ 
                y: [0, -10, 0],
              }}
              transition={{ 
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <AnimatedBackground>
                <Image
                  src="/images/tyler.png"
                  alt="Tyler Lundin"
                  width={400}
                  height={400}
                  className="absolute z-50 -rotate-2"
                />
              </AnimatedBackground>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
} 