"use client"

export default function NicheFilter({ defaultValue, niches }: { defaultValue: string, niches: string[] }) {
  return (
    <form>
      <select 
        name="niche" 
        defaultValue={defaultValue}
        onChange={(e) => e.target.form?.requestSubmit()}
        className="h-10 px-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm capitalize"
      >
        <option value="">All Niches</option>
        {niches.map(n => (
          <option key={n} value={n}>{n}</option>
        ))}
      </select>
    </form>
  )
}