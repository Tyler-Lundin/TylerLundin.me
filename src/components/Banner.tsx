"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { ChevronRight, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface LatestStatus {
  status_text: string;
  created_at: string;
}

const formatDate = (dateString?: string) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

export default function Banner({ isVisible, setIsVisible }: { isVisible: boolean, setIsVisible: (isVisible: boolean) => void }) {
  const [latestStatus, setLatestStatus] = useState<LatestStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const supabase = createClient();
  useEffect(() => {
    const fetchLatestStatus = async () => {
      try {
        const { data, error } = await supabase
          .from("journal_entries")
          .select("status_text, created_at")
          .eq("published", true)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            setLatestStatus(null);
          } else {
            throw error;
          }
        } else {
          setLatestStatus(data);
        }
      } catch (error) {
        console.error("Error fetching latest status:", error);
        setLatestStatus(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLatestStatus();
  }, [supabase]);

  if (isLoading || !latestStatus) return null;

  return (
    <>
      {/* Height spacer */}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "1.75rem" }}
            exit={{ height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="w-full"
          />
        )}
      </AnimatePresence>

      {/* Overlay banner */}
      <AnimatePresence>
        {isVisible ? (
          <motion.div
            initial={{ y: "-100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "-100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            className="fixed top-0 left-0 right-0 z-[200] backdrop-blur-md bg-white/70 dark:bg-black/60 text-black dark:text-white text-[11px] font-medium shadow-sm border-b border-black/10 dark:border-white/10"
          >
            <div className="max-w-7xl mx-auto px-3 h-7 flex items-center justify-between">
              {/* Left */}
              <div className="flex items-center gap-2 overflow-hidden truncate pr-2">
                <div className="flex flex-col leading-none">
                  <span className="text-[10px] text-black/60 dark:text-white/50">Tyler</span>
                  <span className="text-[9px] hidden sm:block text-black/50 dark:text-white/40">{formatDate(latestStatus?.created_at)}</span>
                </div>
                <ChevronRight className="w-3 h-3 hidden sm:block text-black/40 dark:text-white/30 shrink-0" />
                <span className="truncate text-black dark:text-white">
                  {latestStatus?.status_text || "No updates"}
                </span>
              </div>

              {/* Right */}
              <div className="flex items-center gap-2">
                <Link
                  href="/feed"
                  className="text-[10px] whitespace-nowrap text-black/50 dark:text-white/40 hover:text-black dark:hover:text-white underline underline-offset-2 transition"
                >
                  view all
                </Link>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsVisible(false)}
                  aria-label="Close banner"
                  className="text-black/40 dark:text-white/30 hover:text-black dark:hover:text-white transition p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.button
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            onClick={() => setIsVisible(true)}
            className="fixed top-0 shadow-lg left-1/2 -translate-x-1/2 z-[100] bg-white/70 dark:bg-black/60 text-black dark:text-white px-2 py-1 rounded-b-lg text-[10px] backdrop-blur-md shadow-sm hover:bg-white/90 dark:hover:bg-black/80 transition"
          >
            <div className="flex items-center gap-2">
              <span>Show Status</span>
              <div className="h-2 w-2 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 animate-pulse shadow-sm" />
            </div>
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}
