'use client';

import { motion } from 'framer-motion';

const printingProjects = [
  {
    title: "Custom Phone Stand",
    description: "Ergonomic phone stand with cable management",
    status: "Completed",
    printer: "Ender 3 Pro",
    material: "PLA",
    printTime: "2h 30m",
    image: "/placeholder-print-1.jpg",
    features: [
      "Adjustable viewing angle",
      "Hidden cable routing",
      "Non-slip base",
      "Modular design"
    ]
  },
  {
    title: "RC Car Parts",
    description: "Custom parts for RC car modification",
    status: "In Progress",
    printer: "Prusa i3 MK3S",
    material: "PETG",
    printTime: "4h 15m",
    image: "/placeholder-print-2.jpg",
    features: [
      "Impact resistant",
      "Waterproof design",
      "Custom mounting points",
      "Reinforced structure"
    ]
  },
  {
    title: "Artistic Vase",
    description: "Decorative vase with organic patterns",
    status: "Completed",
    printer: "Ender 3 Pro",
    material: "PLA",
    printTime: "6h 45m",
    image: "/placeholder-print-3.jpg",
    features: [
      "Vase mode printing",
      "Organic patterns",
      "Watertight design",
      "Multiple color options"
    ]
  }
];

export default function PrintingPage() {
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
            3D Printing Projects
          </h1>
          <p className="text-xl text-slate-600 dark:text-neutral-300 max-w-3xl mx-auto">
            Bringing digital designs to life through additive manufacturing
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {printingProjects.map((project, index) => (
            <motion.div
              key={project.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white dark:bg-neutral-900 rounded-2xl shadow-xl overflow-hidden border border-slate-200 dark:border-neutral-800"
            >
              <div className="aspect-video bg-slate-100 dark:bg-neutral-800 relative">
                <div className="absolute inset-0 flex items-center justify-center text-slate-400 dark:text-neutral-600">
                  [Print Preview]
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
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-slate-500 dark:text-neutral-400">Printer</p>
                    <p className="text-slate-900 dark:text-white">{project.printer}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-neutral-400">Material</p>
                    <p className="text-slate-900 dark:text-white">{project.material}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-neutral-400">Print Time</p>
                    <p className="text-slate-900 dark:text-white">{project.printTime}</p>
                  </div>
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