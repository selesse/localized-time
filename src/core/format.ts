import { Temporal } from "temporal-polyfill";
import type { ConversionResult, FormatOption, FormatPreset, PopupData } from "./types.js";

/**
 * Preset format configurations (excludes "relative" which is handled separately)
 */
const FORMAT_PRESETS: Record<Exclude<FormatPreset, "relative">, Intl.DateTimeFormatOptions> = {
  short: {
    hour: "numeric",
    minute: "2-digit",
  },
  medium: {
    hour: "numeric",
    minute: "2-digit",
    month: "short",
    day: "numeric",
  },
  long: {
    hour: "numeric",
    minute: "2-digit",
    month: "long",
    day: "numeric",
    year: "numeric",
    weekday: "short",
  },
};

/**
 * Get Intl.DateTimeFormatOptions from a format option
 */
function resolveFormat(format: FormatOption): Intl.DateTimeFormatOptions {
  if (typeof format === "string") {
    // "relative" format doesn't use DateTimeFormat, fallback to medium
    if (format === "relative") {
      return FORMAT_PRESETS.medium;
    }
    return FORMAT_PRESETS[format] || FORMAT_PRESETS.medium;
  }
  return format;
}

/**
 * Format a ZonedDateTime using Intl.DateTimeFormat
 */
export function formatTime(zdt: Temporal.ZonedDateTime, format: FormatOption = "medium"): string {
  const options = resolveFormat(format);
  const formatter = new Intl.DateTimeFormat(undefined, {
    ...options,
    timeZone: zdt.timeZoneId,
  });

  // Convert to a Date for Intl.DateTimeFormat
  const date = new Date(zdt.epochMilliseconds);
  return formatter.format(date);
}

/**
 * Format the hour difference between timezones
 * Returns strings like "+3h", "-9h", "same timezone"
 */
export function formatDiff(hours: number): string {
  if (hours === 0) {
    return "same timezone";
  }

  const sign = hours > 0 ? "+" : "";
  const absHours = Math.abs(hours);

  // Handle fractional hours (e.g., +5:30 timezones)
  if (absHours % 1 !== 0) {
    const wholeHours = Math.floor(absHours);
    const minutes = Math.round((absHours % 1) * 60);
    return `${sign}${hours < 0 ? "-" : ""}${wholeHours}h ${minutes}m`;
  }

  return `${sign}${hours}h`;
}

/**
 * Get a short timezone name (e.g., "PST", "EST", "UTC")
 */
export function getTimezoneName(zdt: Temporal.ZonedDateTime): string {
  const formatter = new Intl.DateTimeFormat(undefined, {
    timeZone: zdt.timeZoneId,
    timeZoneName: "short",
  });

  const parts = formatter.formatToParts(new Date(zdt.epochMilliseconds));
  const tzPart = parts.find((p) => p.type === "timeZoneName");
  return tzPart?.value || zdt.timeZoneId;
}

/**
 * Get a long timezone name (e.g., "Pacific Standard Time")
 */
export function getTimezoneLongName(zdt: Temporal.ZonedDateTime): string {
  const formatter = new Intl.DateTimeFormat(undefined, {
    timeZone: zdt.timeZoneId,
    timeZoneName: "long",
  });

  const parts = formatter.formatToParts(new Date(zdt.epochMilliseconds));
  const tzPart = parts.find((p) => p.type === "timeZoneName");
  return tzPart?.value || zdt.timeZoneId;
}

/**
 * Format a relative time string like "in 5 hours" or "3 days ago"
 * Uses Intl.RelativeTimeFormat for locale-aware output
 */
export function formatRelativeTime(
  zdt: Temporal.ZonedDateTime,
  now?: Temporal.ZonedDateTime,
): string {
  const nowTime = now || Temporal.Now.zonedDateTimeISO(zdt.timeZoneId);
  const diffMs = zdt.epochMilliseconds - nowTime.epochMilliseconds;
  const diffSeconds = Math.round(diffMs / 1000);
  const diffMinutes = Math.round(diffMs / (1000 * 60));
  const diffHours = Math.round(diffMs / (1000 * 60 * 60));
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });

  // Choose the most appropriate unit
  const absDiffMinutes = Math.abs(diffMinutes);
  const absDiffHours = Math.abs(diffHours);
  const absDiffDays = Math.abs(diffDays);

  if (absDiffMinutes < 1) {
    return rtf.format(diffSeconds, "second");
  } else if (absDiffMinutes < 60) {
    return rtf.format(diffMinutes, "minute");
  } else if (absDiffHours < 24) {
    return rtf.format(diffHours, "hour");
  } else if (absDiffDays < 30) {
    return rtf.format(diffDays, "day");
  } else if (absDiffDays < 365) {
    const diffMonths = Math.round(diffDays / 30);
    return rtf.format(diffMonths, "month");
  } else {
    const diffYears = Math.round(diffDays / 365);
    return rtf.format(diffYears, "year");
  }
}

/**
 * Create popup data from a conversion result
 */
export function createPopupData(
  result: ConversionResult,
  format: FormatOption = "medium",
): PopupData {
  return {
    localTimeFormatted: formatTime(result.localTime, format),
    originalTimeFormatted: formatTime(result.originalTime, format),
    localTimezone: getTimezoneName(result.localTime),
    originalTimezone: getTimezoneName(result.originalTime),
    diffFormatted: formatDiff(result.diffHours),
    diffHours: result.diffHours,
  };
}
