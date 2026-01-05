import { Temporal } from "temporal-polyfill";
import type { TimeAdapter } from "./types.js";

/**
 * Temporal API adapter (default)
 */
export const temporalAdapter: TimeAdapter<Temporal.ZonedDateTime> = {
  parse(isoString: string): Temporal.ZonedDateTime {
    // If it has a bracketed timezone, use that
    if (isoString.includes("[")) {
      return Temporal.ZonedDateTime.from(isoString);
    }

    // Parse as Instant then convert based on offset
    const instant = Temporal.Instant.from(isoString);

    // Extract offset from the string
    const offsetMatch = isoString.match(/([+-])(\d{2}):?(\d{2})$/);
    if (offsetMatch) {
      const [, sign, hours, minutes] = offsetMatch;
      const offsetString = `${sign}${hours}:${minutes}`;
      return instant.toZonedDateTimeISO(offsetString);
    }

    // UTC
    if (isoString.endsWith("Z")) {
      return instant.toZonedDateTimeISO("UTC");
    }

    throw new Error(`Cannot parse timestamp: ${isoString}`);
  },

  toZone(dt: Temporal.ZonedDateTime, timezone: string): Temporal.ZonedDateTime {
    return dt.withTimeZone(timezone);
  },

  getViewerTimezone(): string {
    return Temporal.Now.timeZoneId();
  },

  getTimezone(dt: Temporal.ZonedDateTime): string {
    return dt.timeZoneId;
  },

  getOffsetHours(dt: Temporal.ZonedDateTime): number {
    return dt.offsetNanoseconds / (60 * 60 * 1_000_000_000);
  },

  toEpochMillis(dt: Temporal.ZonedDateTime): number {
    return dt.epochMilliseconds;
  },
};
