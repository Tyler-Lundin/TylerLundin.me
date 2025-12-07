"use client";

import React from 'react';

type FrameProps = {
  children: React.ReactNode;
  className?: string;
  fluid?: boolean; // when true, fill parent instead of enforcing aspect
};

// A clean MacBook-style frame using pure CSS
export function MacbookFrame({ children, className, fluid = false }: FrameProps) {
  return (
    <div className={[
      'relative w-full',
      fluid ? 'h-full' : 'aspect-[16/10]',
      'mx-auto',
      className,
    ].filter(Boolean).join(' ')}>
      {/* Lid */}
      <div className="absolute inset-x-2 top-0 bottom-6 rounded-t-[18px] border border-black/20 dark:border-white/10 bg-neutral-900/5 dark:bg-white/5 backdrop-blur overflow-hidden shadow-lg">
        {/* Camera notch */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-14 h-1.5 rounded-full bg-black/30 dark:bg-white/20" />
        <div className="absolute top-3.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-black/40 dark:bg-white/30" />

        {/* Screen */}
        <div className="absolute inset-3 rounded-[10px] overflow-hidden bg-black">
          {children}
        </div>
      </div>

      {/* Base */}
      <div className="absolute left-1/2 -translate-x-1/2 bottom-0 w-[88%] h-6 rounded-b-[14px] bg-gradient-to-b from-neutral-300/60 to-neutral-500/60 dark:from-neutral-700/60 dark:to-neutral-900/60 shadow-inner" />
    </div>
  );
}

// An iPhone-style frame using pure CSS
export function IPhoneFrame({ children, className, fluid = false }: FrameProps) {
  return (
    <div className={[
      'relative w-full',
      fluid ? 'h-full' : 'aspect-[9/19]',
      'mx-auto',
      className,
    ].filter(Boolean).join(' ')}>
      {/* Body */}
      <div className="absolute inset-x-6 inset-y-2 rounded-[44px] border-2 border-black/30 dark:border-white/20 bg-neutral-900/5 dark:bg-white/5 shadow-lg" />

      {/* Bezel and screen */}
      <div className="absolute inset-x-7 inset-y-3 rounded-[36px] bg-black overflow-hidden">
        {/* Dynamic Island / Notch */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-24 h-6 rounded-full bg-black/80" />
        {children}
      </div>
    </div>
  );
}

export type DeviceKind = 'macbook' | 'iphone';
