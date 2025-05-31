export default function DashboardSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="relative rounded-2xl border border-white/10 bg-white/5 dark:bg-white/5 backdrop-blur-lg p-4 sm:p-6 shadow-[0_0_20px_rgba(255,255,255,0.03)] space-y-4 transition-colors duration-300">
      <h2 className="text-lg sm:text-xl font-light tracking-wide text-black dark:text-white/90 border-b border-white/10 pb-2">
        {title}
      </h2>
      <div className="text-black dark:text-white/80">{children}</div>
    </section>
  );
}
