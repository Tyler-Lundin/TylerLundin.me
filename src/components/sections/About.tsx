'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

export function About() {
  return (
    <section id="about" className="py-32">
      
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
              <h2 className="text-5xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-pink-500 to-purple-500 relative w-fit dark:from-cyan-300 dark:via-pink-400 dark:to-purple-400 tracking-tight pb-4 border-b border-black/50 dark:border-white/50">
                Tyler Lundin 
                <small className=" absolute top-0 -translate-y-full md:left-0 md:translate-x-0 left-1/2 -translate-x-1/2 text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed opacity-90">
                The Rogue Webdev
                </small>
              </h2>
              <p className="text-md italic font-medium text-pink-500 pb-4 dark:text-pink-400 border-b border-black/50 dark:border-white/50">
              Nomadic by nature, caffeinated by code, and running on a mix of wanderlust and raw determination. 
              </p>
            </div>
            
            <div className="space-y-6">
              <p className="text-lg text-neutral-700 dark:text-neutral-300 leading-relaxed opacity-90">
                I&apos;m a self-taught developer, gearhead, and builder at heart—someone who thrives on creating from scratch and solving problems with clean code and sharper ideas. Whether I&apos;m fine-tuning a landing page or rebuilding an app backend from the ground up, I bring the same energy: focused, fast-moving, and forward-thinking.
              </p>
              
              <p className="text-lg text-neutral-700 dark:text-neutral-300 leading-relaxed opacity-90">
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
            <div className="relative w-fit h-full overflow-hidden rounded-full border-2 border-black/50 dark:border-white/50">
              <Image src="/images/tyler.png" alt="Tyler Lundin" width={500} height={500} className="object-cover" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
} 