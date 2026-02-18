/**
 * Structured logging for API errors
 */

type LogLevel = "error" | "warn" | "info";

interface LogEntry {
  level: LogLevel;
  message: string;
  route?: string;
  error?: string;
  stack?: string;
  details?: Record<string, unknown>;
}

function formatEntry(entry: LogEntry): string {
  const obj = {
    timestamp: new Date().toISOString(),
    ...entry,
  };
  return JSON.stringify(obj);
}

export function logApiError(route: string, err: unknown, details?: Record<string, unknown>) {
  const entry: LogEntry = {
    level: "error",
    message: err instanceof Error ? err.message : "Unknown error",
    route,
    error: err instanceof Error ? err.message : String(err),
    stack: err instanceof Error ? err.stack : undefined,
    details,
  };
  if (process.env.NODE_ENV === "development") {
    console.error(formatEntry(entry));
  } else {
    console.error(formatEntry(entry));
  }
}
