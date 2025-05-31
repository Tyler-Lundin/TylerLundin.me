'use client';

import { motion } from 'framer-motion';

const gameProjects = [
  {
    title: "Space Explorer",
    description: "A 3D space exploration game built with Unity",
    status: "In Development",
    technologies: ["Unity", "C#", "Blender"],
    image: "/placeholder-game-1.jpg",
    features: [
      "Procedural planet generation",
      "Space combat system",
      "Resource management",
      "Trading mechanics"
    ]
  },
  {
    title: "Pixel Adventure",
    description: "2D platformer with retro aesthetics",
    status: "Concept",
    technologies: ["Unity", "Pixel Art", "C#"],
    image: "/placeholder-game-2.jpg",
    features: [
      "Classic platforming mechanics",
      "Custom pixel art assets",
      "Multiple levels",
      "Power-up system"
    ]
  },
  {
    title: "VR Experience",
    description: "Immersive VR environment for architectural visualization",
    status: "Planning",
    technologies: ["Unity", "VR SDK", "3D Modeling"],
    image: "/placeholder-game-3.jpg",
    features: [
      "VR interaction system",
      "Real-time lighting",
      "Physics-based interactions",
      "Multi-user support"
    ]
  }
];

export default function GameDevPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-black dark:to-gray-900 py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 via-pink-600 to-purple-600 dark:from-cyan-400 dark:via-pink-400 dark:to-purple-400">
            Game Development Projects
          </h1>
          <p className="text-xl text-slate-600 dark:text-neutral-300 max-w-3xl mx-auto">
            Exploring the intersection of creativity and technology through game development
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {gameProjects.map((project, index) => (
            <motion.div
              key={project.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white dark:bg-neutral-900 rounded-2xl shadow-xl overflow-hidden border border-slate-200 dark:border-neutral-800"
            >
              <div className="aspect-video bg-slate-100 dark:bg-neutral-800 relative">
                <div className="absolute inset-0 flex items-center justify-center text-slate-400 dark:text-neutral-600">
                  [Game Preview]
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">{project.title}</h3>
                  <span className="px-3 py-1 text-sm rounded-full bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400">
                    {project.status}
                  </span>
                </div>
                <p className="text-slate-600 dark:text-neutral-300 mb-4">{project.description}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.technologies.map((tech) => (
                    <span
                      key={tech}
                      className="px-2 py-1 text-xs rounded-md bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-neutral-300"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
                <ul className="space-y-2 mb-6">
                  {project.features.map((feature) => (
                    <li key={feature} className="flex items-center text-sm text-slate-600 dark:text-neutral-300">
                      <svg className="w-4 h-4 mr-2 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                <button className="w-full py-2 px-4 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-lg hover:from-pink-500 hover:to-purple-500 transition-all duration-300">
                  View Details
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
} 