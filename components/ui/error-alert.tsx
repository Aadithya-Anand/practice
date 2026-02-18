"use client";

import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ErrorAlertProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorAlert({
  title = "Something went wrong",
  message,
  onRetry,
  className,
}: ErrorAlertProps) {
  return (
    <div
      role="alert"
      className={cn(
        "rounded-lg border border-red-500/40 bg-red-500/10 p-4 text-red-400",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" aria-hidden />
        <div className="flex-1 min-w-0">
          <p className="font-medium">{title}</p>
          <p className="mt-1 text-sm text-red-300/90">{message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-3 text-sm font-medium underline underline-offset-2 hover:no-underline focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-zinc-900 rounded"
            >
              Try again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
