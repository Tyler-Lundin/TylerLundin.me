'use client';
import { useEffect, useState } from "react";

export const useSystemTheme = () => {
    // Check for the presence of window to avoid server-side rendering errors
    const isServer = typeof window === 'undefined';
  
    const [theme, setTheme] = useState(
      isServer ? 'light' : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    );
  
    useEffect(() => {
      // If we're on the server, do nothing.
      if (isServer) return;
  
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      const handleChange = (e: MediaQueryListEvent) => {
        setTheme(e.matches ? 'dark' : 'light');
      };
  
      // Add listener for changes
      mediaQuery.addEventListener('change', handleChange);
  
      // Cleanup listener on component unmount
      return () => mediaQuery.removeEventListener('change', handleChange);
    }, [isServer]);
  
    return theme;
  };