export default function DashboardHeader({ title }: { title: string }) {
  const handleSignOut = () => {
    document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    window.location.href = '/';
  };

  return (
    <header className="relative z-50 backdrop-blur-md overflow-hidden rounded-2xl bg-white/5 dark:bg-black/10 border-b border-white/10 dark:border-white/5 shadow-[0_0_20px_rgba(255,255,255,0.05)]">
      {/* Futuristic gradient shimmer */}
      <div className="absolute inset-0 bg-gradient-to-tr from-cyan-400/20 via-fuchsia-500/20 to-indigo-500/20 pointer-events-none" />

      <div className="relative flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-sm" />
          <h1 className="text-xl sm:text-2xl font-light tracking-wider text-gray-800 dark:text-white/90 drop-shadow-sm">
            {title}
          </h1>
        </div>

        <button
          onClick={handleSignOut}
          className="group relative flex items-center gap-2 px-4 py-1.5 text-xs sm:text-sm font-medium dark:text-white text-black/80 bg-red-500/10 rounded-lg border border-red-500/20 hover:bg-red-500/20 hover:text-white/90 transition-all duration-300 backdrop-blur-sm"
        >
          <span className="relative z-10">Sign Out</span>
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/30 to-red-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
        </button>
      </div>
    </header>
  );
}
