'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, CheckSquare, MessageSquare, Link as LinkIcon, FileText, X, Command } from 'lucide-react';

type ShortcutOption = {
  key: string;
  label: string;
  icon: any;
  action: () => void;
  description: string;
};

type ShortcutMenuProps = {
  onNewTask?: () => void;
};

export default function ShortcutMenu({ onNewTask }: ShortcutMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleNewTask = useCallback(() => {
    if (onNewTask) {
      onNewTask();
    } else {
      window.dispatchEvent(new CustomEvent('open-ai-task-wizard'));
    }
  }, [onNewTask]);

  const options: ShortcutOption[] = [
    {
      key: 't',
      label: 'New AI Task',
      icon: CheckSquare,
      action: () => {
        setIsOpen(false);
        handleNewTask();
      },
      description: 'Draft a new coding task with AI context'
    },
  ];

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Ignore if typing in an input
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
      return;
    }

    if (e.key.toLowerCase() === 'n' && !isOpen) {
      e.preventDefault();
      setIsOpen(true);
    } else if (e.key === 'Escape' && isOpen) {
      setIsOpen(false);
    } else if (isOpen) {
      const option = options.find(opt => opt.key === e.key.toLowerCase());
      if (option) {
        e.preventDefault();
        option.action();
      }
    }
  }, [isOpen, options]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setIsOpen(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800"
          >
            <div className="px-6 py-4 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/50 dark:bg-neutral-900/50">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-neutral-900 dark:bg-white rounded-md">
                  <Plus className="size-4 text-white dark:text-neutral-900" />
                </div>
                <h2 className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wider">Quick Create</h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-neutral-400 border border-neutral-200 dark:border-neutral-700 px-1.5 py-0.5 rounded uppercase">Esc to close</span>
                <button onClick={() => setIsOpen(false)} className="p-1 text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors">
                  <X className="size-4" />
                </button>
              </div>
            </div>

            <div className="p-2">
              <div className="grid grid-cols-1 gap-1">
                {options.map((option) => (
                  <button
                    key={option.key}
                    onClick={option.action}
                    className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 group transition-all text-left"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-500 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/40 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        <option.icon className="size-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-neutral-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
                          {option.label}
                        </h3>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                          {option.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                       <span className="text-[10px] font-black text-neutral-400 group-hover:text-blue-400 uppercase tracking-widest mr-2">Press</span>
                       <kbd className="size-7 flex items-center justify-center rounded-md bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-black text-neutral-600 dark:text-neutral-300 shadow-sm group-hover:border-blue-300 dark:group-hover:border-blue-700 transition-colors">
                         {option.key.toUpperCase()}
                       </kbd>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="px-6 py-3 bg-neutral-50 dark:bg-neutral-900/50 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
               <div className="flex items-center gap-2 text-[10px] font-bold text-neutral-400">
                 <Command className="size-3" />
                 SHORTCUTS ENABLED
               </div>
               <div className="text-[10px] font-bold text-neutral-400 italic">
                 New features coming soon
               </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
