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

export default function Banner() {
  const [isVisible, setIsVisible] = useState(true);
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
            // This error code indicates no rows were returned
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

  // If there are no entries and we're not loading, don't show the banner
  if (isLoading || !latestStatus) {
    return null;
  }

  return (
    <>
      {/* Height spacer */}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "2.5rem" }}
            exit={{ height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="w-full"
          />
        )}
      </AnimatePresence>

      {/* Fixed banner */}
      <AnimatePresence>
        {isVisible ? (
          <motion.div
            initial={{ y: "-100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "-100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
            className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-black/60 text-white text-xs"
          >
            <div className="max-w-7xl mx-auto px-4 h-10 flex items-center justify-between">
              {/* Left Side */}
              <div className="flex items-center gap-2 overflow-hidden truncate">
                <div className="flex flex-col leading-tight">
                  <span className="text-gray-200">Tyler</span>
                  <span className="text-gray-300 text-[10px]">{formatDate(latestStatus?.created_at)}</span>
                </div>
                <ChevronRight className="w-3 h-3 text-gray-400 shrink-0" />
                {isLoading ? (
                  <span className="text-gray-400 italic text-xs truncate">loading...</span>
                ) : latestStatus ? (
                  <span className="font-normal truncate">{latestStatus.status_text}</span>
                ) : null}
              </div>

              {/* Right Side */}
              <div className="flex items-center gap-2 shrink-0 ml-2">
                <Link
                  href="/feed"
                  className="text-gray-400 hover:text-white transition text-[11px] underline underline-offset-2"
                >
                  view all
                </Link>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsVisible(false)}
                  className="text-gray-400 hover:text-white transition p-1 rounded-full"
                  aria-label="Close banner"
                >
                  <X className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.button
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            onClick={() => setIsVisible(true)}
            className="fixed top-0 left-1/2 -translate-x-1/2 z-[100] bg-black/70 text-white px-2 py-1 rounded-b-md text-[11px] font-medium backdrop-blur-md hover:bg-black/90 transition"
          >
            <div className="h-2 w-2 bg-gradient-to-r from-indigo-500 via-pink-500 to-yellow-500 rounded-full animate-pulse" />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}
