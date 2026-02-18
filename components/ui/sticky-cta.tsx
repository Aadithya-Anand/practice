"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface StickyCTAProps {
  children: ReactNode;
  className?: string;
}

export function StickyCTA({ children, className }: StickyCTAProps) {
  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn(
        "fixed bottom-0 left-0 right-0 z-40 border-t border-zinc-800/80 bg-zinc-950/90 p-4 backdrop-blur-md lg:hidden",
        className
      )}
    >
      {children}
    </motion.div>
  );
}
