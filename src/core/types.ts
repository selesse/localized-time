import type { Temporal } from "temporal-polyfill";

/**
 * Format options for displaying time
 */
export type FormatPreset = "short" | "medium" | "long" | "relative";

export type FormatOption = FormatPreset | Intl.DateTimeFormatOptions;

/**
 * Options for localizing a timestamp
 */
export interface LocalizedTimeOptions {
  /** ISO timestamp string with timezone (e.g., "2025-05-18T23:00:00-08:00") */
  from: string;
  /** Override the viewer's timezone (e.g., "Europe/Berlin") */
  viewerTz?: string;
  /** Format for displaying the time */
  format?: FormatOption;
}

/**
 * Result of converting a timestamp between timezones
 */
export interface ConversionResult {
  /** The time in the viewer's local timezone */
  localTime: Temporal.ZonedDateTime;
  /** The original time with its source timezone */
  originalTime: Temporal.ZonedDateTime;
  /** Difference in hours between local and original (positive = local is ahead) */
  diffHours: number;
  /** The viewer's timezone ID */
  viewerTimezone: string;
  /** The original timezone ID */
  originalTimezone: string;
}

/**
 * Data provided to popup renderers
 */
export interface PopupData {
  localTimeFormatted: string;
  originalTimeFormatted: string;
  localTimezone: string;
  originalTimezone: string;
  diffFormatted: string;
  diffHours: number;
}
