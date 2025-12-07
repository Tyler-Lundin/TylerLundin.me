import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
} 

export function formatDate(dateString?: string) {
    if (!dateString) return ''
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}


export function randomHexColor(theme: 'light' | 'dark') {
  // Random 0–255, clamp brightness based on theme
  const range = theme === 'dark'
    ? [150, 255]  // brighter colors for dark background
    : [0, 120];   // darker colors on light background

  const rand = () => {
    const value = Math.floor(Math.random() * (range[1] - range[0] + 1)) + range[0];
    return value.toString(16).padStart(2, '0'); // Convert to hex, ensure 2 digits
  };

  return `#${rand()}${rand()}${rand()}`;
}
