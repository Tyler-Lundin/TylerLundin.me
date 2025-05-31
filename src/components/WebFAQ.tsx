import { motion } from "framer-motion";

export default function WebFAQ() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="px-4 py-12 lg:py-24 max-w-7xl mx-auto"
    >
      <div className="text-center mb-16">
        <h3 className="text-4xl font-semibold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-500">
          Quick Answers
        </h3>
        <p className="text-slate-400 max-w-2xl mx-auto text-base tracking-wide">
          Common questions about working together, answered in seconds
        </p>
      </div>

      <div className="grid gap-8">
        {[
          {
            title: "Start Time",
            content: "1-2 days for new projects. Faster starts available for urgent needs.",
            icon: (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            )
          },
          {
            title: "Process",
            content: "Quick discussion → Quote → Agreement → Start. Simple and efficient.",
            icon: (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            )
          },
          {
            title: "Support",
            content: "Monthly maintenance included. Available for updates and new features.",
            icon: (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            )
          }
        ].map(({ title, content, icon }, idx) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 * idx }}
            className="group relative transition-all rounded-2xl border border-white/10 bg-white/5 dark:bg-white/5 backdrop-blur-md p-6 shadow-inner  transition-all duration-300"
          >
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-white/10 border border-black/20 dark:border-white/20 text-cyan-400">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {icon}
                </svg>
              </div>
              <div>
                <h4 className="text-lg font-medium text-black dark:text-white tracking-wide mb-1">
                  {title}
                </h4>
                <p className="text-black dark:text-white text-sm leading-relaxed tracking-wide">
                  {content}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
