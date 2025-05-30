'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Roboto_Mono } from 'next/font/google';

const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-roboto-mono',
});

const GET_NEXT_CHAR_DELAY = () => Math.random() * (100 - 50) + 90;
const GET_DELETE_CHAR_DELAY = () => Math.random() * (60 - 30) + 30;

const PAUSE_AFTER_TYPING = 1200;
const ROLES = [
  'Web Dev',
  'Bodybuilding',
  'Game Dev',
  '3D Printing & CAD',
  'Off-Roading',
];

type Phase = 'typing' | 'paused' | 'deleting';

export default function TerminalBanner() {
  const [currentRoleIndex, setCurrentRoleIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [phase, setPhase] = useState<Phase>('typing');

  useEffect(() => {
    const fullText = ROLES[currentRoleIndex];

    if (phase === 'typing') {
      if (displayedText.length < fullText.length) {
        const timeout = setTimeout(() => {
          setDisplayedText(fullText.slice(0, displayedText.length + 1));
        }, GET_NEXT_CHAR_DELAY());
        return () => clearTimeout(timeout);
      } else {
        const pause = setTimeout(() => setPhase('paused'), PAUSE_AFTER_TYPING);
        return () => clearTimeout(pause);
      }
    }

    if (phase === 'paused') {
      const pause = setTimeout(() => setPhase('deleting'), 300);
      return () => clearTimeout(pause);
    }

    if (phase === 'deleting') {
      if (displayedText.length > 0) {
        const timeout = setTimeout(() => {
          setDisplayedText(displayedText.slice(0, -1));
        }, GET_DELETE_CHAR_DELAY());
        return () => clearTimeout(timeout);
      } else {
        setPhase('typing');
        setCurrentRoleIndex((prev) => (prev + 1) % ROLES.length);
      }
    }
  }, [phase, displayedText, currentRoleIndex]);

  return (
    <div className="relative w-full overflow-hidden">
    <motion.div
      style={robotoMono.style}
      className="text-center bg-white/50 dark:bg-black/50 overflow-hidden rounded-lg px-4 backdrop-blur-sm sm:text-left justify-self-start"
    >
      <h2 className="text-2xl font-mono text-neutral-800 dark:text-neutral-200 tracking-tight whitespace-nowrap">
        <span className="text-green-500">λ</span>{' '}
        <span>{displayedText}</span>
        <span className="animate-blink">_</span>
      </h2>
    </motion.div>
    <small className="absolute text-xs bg-white/50 dark:bg-black/50 backdrop-blur-sm right-0 top-1/2 -translate-y-1/2 text-neutral-800 dark:text-neutral-200">
        {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
      </small>
      </div>
  );
}
