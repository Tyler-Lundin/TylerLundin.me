"use client"

export default function SettingsModule() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Settings</h2>
      <p className="text-sm text-neutral-600 dark:text-neutral-300">Reserved for system toggles, tokens, and controls.</p>
      <div className="rounded-lg border border-black/10 dark:border-white/10 p-4">
        <p className="text-sm opacity-80">Coming soon: environment quick view, token checks, feature flags.</p>
      </div>
    </div>
  )
}

