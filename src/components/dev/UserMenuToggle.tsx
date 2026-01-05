"use client";

import { User } from "lucide-react";

export default function UserMenuToggle() {
  return (
    <button
      type="button"
      aria-label="Open admin menu"
      onClick={() => {
        try { window.dispatchEvent(new Event('admin-menu-host-toggle')); } catch {}
      }}
      className="fixed bottom-4 right-4 z-[999] grid h-10 w-10 place-items-center rounded-full border border-black/10 bg-white text-neutral-700 shadow-lg transition hover:scale-105 dark:border-white/10 dark:bg-neutral-900 dark:text-white/80"
      style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace' }}
    >
      <User />
    </button>
  );
}
