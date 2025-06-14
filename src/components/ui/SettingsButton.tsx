'use client';

import Image from 'next/image';
import { useState } from 'react';

export function SettingsButton() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      className="fixed bottom-6 right-6 z-50 p-3 bg-white dark:bg-neutral-800 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label="Settings"
    >
      <div className="relative w-6 h-6">
        <Image
          src="/gear-icon.webp"
          alt="Settings"
          fill
          className={`transition-transform duration-300 ${isHovered ? 'rotate-180' : ''}`}
        />
      </div>
    </button>
  );
} 