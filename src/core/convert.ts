import { Temporal } from "temporal-polyfill";
import type { ConversionResult } from "./types.js";

/**
 * Parse an ISO timestamp string into a Temporal.ZonedDateTime
 * Supports formats like:
 * - "2025-05-18T23:00:00-08:00" (offset)
 * - "2025-05-18T23:00:00[America/Los_Angeles]" (IANA timezone)
 * - "2025-05-18T23:00:00-08:00[America/Los_Angeles]" (both)
 */
export function parseTimestamp(from: string): Temporal.ZonedDateTime {
  // Try parsing as ISO with offset or IANA timezone
  try {
    // If it has a bracketed timezone, use that
    if (from.includes("[")) {
      return Temporal.ZonedDateTime.from(from);
    }

    // If it has an offset, parse as Instant then convert
    // We need to infer the timezone from the offset for display
    const instant = Temporal.Instant.from(from);

    // Extract offset from the string to determine timezone
    const offsetMatch = from.match(/([+-])(\d{2}):?(\d{2})$/);
    if (offsetMatch) {
      const [, sign, hours, minutes] = offsetMatch;

      // Use the offset as a fixed timezone
      const offsetString = `${sign}${hours}:${minutes}`;
      return instant.toZonedDateTimeISO(offsetString);
    }

    // If it ends with Z, it's UTC
    if (from.endsWith("Z")) {
      return instant.toZonedDateTimeISO("UTC");
    }

    throw new Error(`Cannot parse timestamp: ${from}`);
  } catch {
    throw new Error(
      `Invalid timestamp format: "${from}". Expected ISO 8601 format with timezone offset or IANA timezone.`,
    );
  }
}

/**
 * Convert a ZonedDateTime to a different timezone
 */
export function convertToZone(zdt: Temporal.ZonedDateTime, zone: string): Temporal.ZonedDateTime {
  return zdt.withTimeZone(zone);
}

/**
 * Get the current viewer's timezone
 */
export function getViewerTimezone(): string {
  return Temporal.Now.timeZoneId();
}

/**
 * Calculate the time difference in hours between two ZonedDateTimes
 * Returns positive if local is ahead of original
 */
export function getTimeDiff(
  original: Temporal.ZonedDateTime,
  local: Temporal.ZonedDateTime,
): number {
  const originalOffset = original.offsetNanoseconds;
  const localOffset = local.offsetNanoseconds;

  // Convert nanoseconds to hours
  const diffNanos = localOffset - originalOffset;
  return diffNanos / (60 * 60 * 1_000_000_000);
}

/**
 * Convert a timestamp to the viewer's timezone and return full conversion result
 */
export function convertTimestamp(from: string, viewerTz?: string): ConversionResult {
  const originalTime = parseTimestamp(from);
  const viewerTimezone = viewerTz || getViewerTimezone();
  const localTime = convertToZone(originalTime, viewerTimezone);
  const diffHours = getTimeDiff(originalTime, localTime);

  return {
    localTime,
    originalTime,
    diffHours,
    viewerTimezone,
    originalTimezone: originalTime.timeZoneId,
  };
}
