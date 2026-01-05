import { describe, expect, test } from "bun:test";
import { convertTimestamp, convertToZone, getTimeDiff, parseTimestamp } from "../src/core/convert";

describe("parseTimestamp", () => {
  test("parses ISO string with positive offset", () => {
    const result = parseTimestamp("2025-05-18T23:00:00+09:00");
    expect(result.hour).toBe(23);
    expect(result.minute).toBe(0);
    expect(result.timeZoneId).toBe("+09:00");
  });

  test("parses ISO string with negative offset", () => {
    const result = parseTimestamp("2025-05-18T23:00:00-08:00");
    expect(result.hour).toBe(23);
    expect(result.timeZoneId).toBe("-08:00");
  });

  test("parses ISO string with UTC (Z)", () => {
    const result = parseTimestamp("2025-05-18T23:00:00Z");
    expect(result.hour).toBe(23);
    expect(result.timeZoneId).toBe("UTC");
  });

  test("throws on invalid format", () => {
    expect(() => parseTimestamp("not a date")).toThrow();
    expect(() => parseTimestamp("2025-05-18")).toThrow(); // No time
    expect(() => parseTimestamp("2025-05-18T23:00:00")).toThrow(); // No timezone
  });
});

describe("convertToZone", () => {
  test("converts from one offset to UTC", () => {
    const original = parseTimestamp("2025-05-18T16:00:00-08:00");
    const utc = convertToZone(original, "UTC");

    // 4 PM at -08:00 = midnight UTC next day
    expect(utc.hour).toBe(0);
    expect(utc.day).toBe(19);
  });

  test("converts UTC to different timezone", () => {
    const utc = parseTimestamp("2025-05-18T12:00:00Z");
    const tokyo = convertToZone(utc, "Asia/Tokyo");

    // UTC 12:00 = Tokyo 21:00 (UTC+9)
    expect(tokyo.hour).toBe(21);
    expect(tokyo.day).toBe(18);
  });

  test("preserves instant when converting", () => {
    const original = parseTimestamp("2025-05-18T23:00:00-08:00");
    const converted = convertToZone(original, "UTC");

    // Both should represent the same instant
    expect(original.epochMilliseconds).toBe(converted.epochMilliseconds);
  });
});

describe("getTimeDiff", () => {
  test("calculates positive difference (local ahead)", () => {
    // Use fixed offsets to avoid DST complexity
    const behind = parseTimestamp("2025-05-18T23:00:00-08:00");
    const utc = convertToZone(behind, "UTC");

    // UTC is 8 hours ahead of -08:00
    const diff = getTimeDiff(behind, utc);
    expect(diff).toBe(8);
  });

  test("calculates negative difference (local behind)", () => {
    const utc = parseTimestamp("2025-05-18T23:00:00Z");
    const behind = convertToZone(utc, "-08:00");

    const diff = getTimeDiff(utc, behind);
    expect(diff).toBe(-8);
  });

  test("returns 0 for same timezone", () => {
    const time = parseTimestamp("2025-05-18T23:00:00-08:00");
    const diff = getTimeDiff(time, time);
    expect(diff).toBe(0);
  });
});

describe("convertTimestamp", () => {
  test("returns complete conversion result", () => {
    const result = convertTimestamp("2025-05-18T23:00:00Z", "UTC");

    expect(result.originalTime.hour).toBe(23);
    expect(result.localTime.hour).toBe(23);
    expect(result.diffHours).toBe(0);
    expect(result.originalTimezone).toBe("UTC");
    expect(result.viewerTimezone).toBe("UTC");
  });

  test("converts from UTC to offset timezone", () => {
    const result = convertTimestamp("2025-05-18T12:00:00Z", "+09:00");

    expect(result.originalTime.hour).toBe(12);
    expect(result.localTime.hour).toBe(21); // UTC+9
    expect(result.diffHours).toBe(9);
  });

  test("uses viewer timezone when not specified", () => {
    const result = convertTimestamp("2025-05-18T23:00:00Z");

    // Should use system timezone
    expect(result.viewerTimezone).toBeTruthy();
    expect(result.localTime).toBeTruthy();
  });
});
