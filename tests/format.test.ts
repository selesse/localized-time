import { describe, expect, test } from "bun:test";
import { Temporal } from "temporal-polyfill";
import { convertTimestamp, parseTimestamp } from "../src/core/convert";
import {
  createPopupData,
  formatDiff,
  formatRelativeTime,
  formatTime,
  getTimezoneName,
} from "../src/core/format";

describe("formatTime", () => {
  test("formats with short preset", () => {
    const time = parseTimestamp("2025-05-18T14:30:00-08:00");
    const formatted = formatTime(time, "short");

    // Should contain hour and minute
    expect(formatted).toMatch(/2:30/);
  });

  test("formats with medium preset", () => {
    const time = parseTimestamp("2025-05-18T14:30:00-08:00");
    const formatted = formatTime(time, "medium");

    // Should contain month, day, hour, minute
    expect(formatted).toMatch(/May/);
    expect(formatted).toMatch(/18/);
    expect(formatted).toMatch(/2:30/);
  });

  test("formats with long preset", () => {
    const time = parseTimestamp("2025-05-18T14:30:00-08:00");
    const formatted = formatTime(time, "long");

    // Should contain weekday, month, day, year
    expect(formatted).toMatch(/May/);
    expect(formatted).toMatch(/18/);
    expect(formatted).toMatch(/2025/);
  });

  test("accepts custom Intl options", () => {
    const time = parseTimestamp("2025-05-18T14:30:00-08:00");
    const formatted = formatTime(time, { hour: "2-digit", minute: "2-digit", hour12: false });

    expect(formatted).toMatch(/14:30/);
  });
});

describe("formatDiff", () => {
  test("formats positive hours", () => {
    expect(formatDiff(3)).toBe("+3h");
    expect(formatDiff(12)).toBe("+12h");
  });

  test("formats negative hours", () => {
    expect(formatDiff(-3)).toBe("-3h");
    expect(formatDiff(-9)).toBe("-9h");
  });

  test("formats zero as same timezone", () => {
    expect(formatDiff(0)).toBe("same timezone");
  });

  test("formats fractional hours", () => {
    const result = formatDiff(5.5);
    expect(result).toMatch(/5h/);
    expect(result).toMatch(/30m/);
  });

  test("formats negative fractional hours", () => {
    const result = formatDiff(-5.5);
    expect(result).toMatch(/5h/);
    expect(result).toMatch(/30m/);
  });
});

describe("getTimezoneName", () => {
  test("returns short timezone name", () => {
    const time = parseTimestamp("2025-01-18T14:30:00Z");
    const name = getTimezoneName(time);

    // Should be something like "UTC" or "GMT"
    expect(name).toBeTruthy();
    expect(typeof name).toBe("string");
  });
});

describe("createPopupData", () => {
  test("creates complete popup data", () => {
    // Use UTC to UTC to avoid DST issues
    const result = convertTimestamp("2025-05-18T23:00:00Z", "UTC");
    const popupData = createPopupData(result);

    expect(popupData.localTimeFormatted).toBeTruthy();
    expect(popupData.originalTimeFormatted).toBeTruthy();
    expect(popupData.localTimezone).toBeTruthy();
    expect(popupData.originalTimezone).toBeTruthy();
    expect(popupData.diffFormatted).toBe("same timezone");
    expect(popupData.diffHours).toBe(0);
  });

  test("shows difference for different timezones", () => {
    const result = convertTimestamp("2025-05-18T12:00:00Z", "+09:00");
    const popupData = createPopupData(result);

    expect(popupData.diffFormatted).toBe("+9h");
    expect(popupData.diffHours).toBe(9);
  });

  test("respects format option", () => {
    const result = convertTimestamp("2025-05-18T23:00:00Z", "UTC");
    const shortData = createPopupData(result, "short");
    const longData = createPopupData(result, "long");

    // Long format should be longer than short
    expect(longData.localTimeFormatted.length).toBeGreaterThan(shortData.localTimeFormatted.length);
  });
});

describe("formatRelativeTime", () => {
  // Helper to create a fixed "now" time for consistent testing
  const createNow = (isoString: string) => Temporal.ZonedDateTime.from(isoString);

  test("formats future time in seconds", () => {
    const now = createNow("2025-05-18T12:00:00Z[UTC]");
    const future = createNow("2025-05-18T12:00:20Z[UTC]");
    const result = formatRelativeTime(future, now);

    // 20 seconds is < 1 minute, so should use seconds
    expect(result).toMatch(/20|second/i);
  });

  test("formats future time in minutes", () => {
    const now = createNow("2025-05-18T12:00:00Z[UTC]");
    const future = createNow("2025-05-18T12:15:00Z[UTC]");
    const result = formatRelativeTime(future, now);

    expect(result).toMatch(/15|minute/i);
  });

  test("formats future time in hours", () => {
    const now = createNow("2025-05-18T12:00:00Z[UTC]");
    const future = createNow("2025-05-18T17:00:00Z[UTC]");
    const result = formatRelativeTime(future, now);

    expect(result).toMatch(/5|hour/i);
  });

  test("formats future time in days", () => {
    const now = createNow("2025-05-18T12:00:00Z[UTC]");
    const future = createNow("2025-05-21T12:00:00Z[UTC]");
    const result = formatRelativeTime(future, now);

    expect(result).toMatch(/3|day/i);
  });

  test("formats past time in hours", () => {
    const now = createNow("2025-05-18T17:00:00Z[UTC]");
    const past = createNow("2025-05-18T12:00:00Z[UTC]");
    const result = formatRelativeTime(past, now);

    expect(result).toMatch(/5|hour|ago/i);
  });

  test("formats past time in days", () => {
    const now = createNow("2025-05-21T12:00:00Z[UTC]");
    const past = createNow("2025-05-18T12:00:00Z[UTC]");
    const result = formatRelativeTime(past, now);

    expect(result).toMatch(/3|day|ago/i);
  });

  test("formats time in months", () => {
    const now = createNow("2025-05-18T12:00:00Z[UTC]");
    const future = createNow("2025-08-18T12:00:00Z[UTC]");
    const result = formatRelativeTime(future, now);

    expect(result).toMatch(/3|month/i);
  });

  test("formats time in years", () => {
    const now = createNow("2025-05-18T12:00:00Z[UTC]");
    const future = createNow("2027-05-18T12:00:00Z[UTC]");
    const result = formatRelativeTime(future, now);

    expect(result).toMatch(/2|year/i);
  });

  test("works with parsed timestamps", () => {
    const now = createNow("2025-05-18T12:00:00Z[UTC]");
    const future = parseTimestamp("2025-05-18T15:00:00Z");
    const result = formatRelativeTime(future, now);

    expect(result).toMatch(/3|hour/i);
  });
});
