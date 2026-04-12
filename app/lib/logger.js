/**
 * Structured server-side logger.
 *
 * Emits JSON-formatted log lines to stdout so that hosting platforms
 * (Vercel, Railway, etc.) can ingest and filter them easily.
 *
 * Log levels: info | warn | error
 *
 * Usage:
 *   import { logger } from "@/app/lib/logger"
 *   logger.info("ai.call.start", { action: "generateCourse", topic })
 *   logger.error("ai.call.failed", { action: "generateCourse", error: err.message })
 */

function log(level, event, data = {}) {
  const entry = {
    ts: new Date().toISOString(),
    level,
    event,
    ...data,
  }
  const line = JSON.stringify(entry)
  if (level === "error") {
    console.error(line)
  } else if (level === "warn") {
    console.warn(line)
  } else {
    console.log(line)
  }
}

export const logger = {
  info: (event, data) => log("info", event, data),
  warn: (event, data) => log("warn", event, data),
  error: (event, data) => log("error", event, data),
}
