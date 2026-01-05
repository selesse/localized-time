/**
 * Example Luxon adapter - shows how to implement support for other libraries
 *
 * To use:
 * 1. Install luxon: `bun add luxon`
 * 2. Rename this file to luxon.ts
 * 3. Uncomment the code below
 */

/*
import { DateTime } from "luxon";
import type { TimeAdapter } from "./types.js";

export const luxonAdapter: TimeAdapter<DateTime> = {
  parse(isoString: string): DateTime {
    const dt = DateTime.fromISO(isoString, { setZone: true });
    if (!dt.isValid) {
      throw new Error(`Cannot parse timestamp: ${isoString}`);
    }
    return dt;
  },

  toZone(dt: DateTime, timezone: string): DateTime {
    return dt.setZone(timezone);
  },

  getViewerTimezone(): string {
    return DateTime.local().zoneName ?? "UTC";
  },

  getTimezone(dt: DateTime): string {
    return dt.zoneName ?? "UTC";
  },

  getOffsetHours(dt: DateTime): number {
    return dt.offset / 60; // Luxon gives offset in minutes
  },

  toEpochMillis(dt: DateTime): number {
    return dt.toMillis();
  },
};
*/

export {};
