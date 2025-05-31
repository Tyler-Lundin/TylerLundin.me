'use client';

import { motion } from 'framer-motion';

const vehicleProjects = [
  {
    title: "1995 Toyota Supra",
    description: "Twin-turbo build with custom body modifications",
    status: "In Progress",
    year: "1995",
    make: "Toyota",
    model: "Supra",
    image: "/placeholder-vehicle-1.jpg",
    modifications: [
      "Twin-turbo setup",
      "Custom widebody kit",
      "Coilover suspension",
      "Custom exhaust system"
    ]
  },
  {
    title: "2020 Tesla Model 3",
    description: "Performance model with custom wrap and wheels",
    status: "Completed",
    year: "2020",
    make: "Tesla",
    model: "Model 3",
    image: "/placeholder-vehicle-2.jpg",
    modifications: [
      "Custom vinyl wrap",
      "Performance wheels",
      "Lowering springs",
      "Tinted windows"
    ]
  },
  {
    title: "1989 Nissan Skyline",
    description: "R32 GTR restoration project",
    status: "Planning",
    year: "1989",
    make: "Nissan",
    model: "Skyline R32",
    image: "/placeholder-vehicle-3.jpg",
    modifications: [
      "Full engine rebuild",
      "Restored interior",
      "Custom paint job",
      "Performance upgrades"
    ]
  }
];

export default function VehiclesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-black dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 via-pink-600 to-purple-600 dark:from-cyan-400 dark:via-pink-400 dark:to-purple-400">
            Vehicle Projects
          </h1>
          <p className="text-xl text-slate-600 dark:text-neutral-300 max-w-3xl mx-auto">
            Showcasing automotive passion through custom builds and modifications
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {vehicleProjects.map((project, index) => (
            <motion.div
              key={project.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white dark:bg-neutral-900 rounded-2xl shadow-xl overflow-hidden border border-slate-200 dark:border-neutral-800"
            >
              <div className="aspect-video bg-slate-100 dark:bg-neutral-800 relative">
                <div className="absolute inset-0 flex items-center justify-center text-slate-400 dark:text-neutral-600">
                  [Vehicle Preview]
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
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-slate-500 dark:text-neutral-400">Year</p>
                    <p className="text-slate-900 dark:text-white">{project.year}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-neutral-400">Make</p>
                    <p className="text-slate-900 dark:text-white">{project.make}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-neutral-400">Model</p>
                    <p className="text-slate-900 dark:text-white">{project.model}</p>
                  </div>
                </div>
                <ul className="space-y-2 mb-6">
                  {project.modifications.map((mod) => (
                    <li key={mod} className="flex items-center text-sm text-slate-600 dark:text-neutral-300">
                      <svg className="w-4 h-4 mr-2 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {mod}
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