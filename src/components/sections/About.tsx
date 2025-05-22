'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';

export function About() {
  return (
    <section id="about" className="py-32 bg-slate-900 dark:bg-black">
      
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
              <h2 className="text-5xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-pink-500 to-purple-500 dark:from-cyan-300 dark:via-pink-400 dark:to-purple-400 tracking-tight">
                Tyler Lundin: The Rogue Webdev
              </h2>
              <p className="text-2xl font-medium text-pink-500 dark:text-pink-400 mb-4">
              Nomadic by nature, caffeinated by code, and running on a mix of wanderlust and raw determination. 
              </p>
            </div>
            
            <div className="space-y-6">
              <p className="text-lg text-neutral-400 dark:text-neutral-300 leading-relaxed opacity-90">
                I&apos;m a self-taught developer, gearhead, and builder at heart—someone who thrives on creating from scratch and solving problems with clean code and sharper ideas. Whether I&apos;m fine-tuning a landing page or rebuilding an app backend from the ground up, I bring the same energy: focused, fast-moving, and forward-thinking.
              </p>
              
              <p className="text-lg text-neutral-400 dark:text-neutral-300 leading-relaxed opacity-90">
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
              className="w-[400px] h-[400px] group relative bg-gradient-to-br from-purple-700 via-pink-600 to-rose-500 dark:from-purple-800 dark:via-pink-700 dark:to-rose-600 rounded-full overflow-hidden shadow-xl shadow-pink-500/30 dark:shadow-pink-400/40"
              animate={{ 
                y: [0, -10, 0],
              }}
              transition={{ 
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
                <Image
                  src="/images/tyler.png"
                  alt="Tyler Lundin"
                  width={400}
                  height={400}
                  className="absolute z-10 -rotate-2 scale-95 group-hover:scale-100 rounded-full transition-transform duration-300"
                />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
} 