"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  variant?: "dark" | "light";
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  variant = "dark",
  className,
}: EmptyStateProps) {
  const isLight = variant === "light";
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-12 px-4 text-center",
        className
      )}
    >
      {icon && (
        <div
          className={cn(
            "mb-4 flex h-16 w-16 items-center justify-center rounded-full",
            isLight ? "bg-slate-200 text-slate-500" : "bg-zinc-800 text-zinc-500"
          )}
        >
          {icon}
        </div>
      )}
      <h3 className={cn("text-lg font-semibold", isLight ? "text-slate-800" : "text-white")}>
        {title}
      </h3>
      {description && (
        <p className={cn("mt-2 max-w-sm text-sm", isLight ? "text-slate-600" : "text-zinc-400")}>
          {description}
        </p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
