"use client";

import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

export function MapSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex h-[400px] w-full flex-col gap-6 rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-6 md:h-[50vh] lg:h-[70vh]"
      aria-label="Loading map"
    >
      <div className="flex gap-4">
        <Skeleton className="h-12 flex-1 rounded-xl" />
        <Skeleton className="h-12 flex-1 rounded-xl" />
      </div>
      <Skeleton className="h-full min-h-[280px] w-full rounded-xl" />
    </motion.div>
  );
}
