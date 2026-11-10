import { describe, expect, test } from "bun:test";
import { parseTimestamp } from "../src/core/convert";
import { relativeRefreshDelay } from "../src/core/format";

const now = parseTimestamp("2026-01-01T12:00:00Z");

describe("relativeRefreshDelay", () => {
  test("ticks every second while showing seconds", () => {
    expect(relativeRefreshDelay(now.subtract({ seconds: 20 }), now)).toBe(1_000);
    expect(relativeRefreshDelay(now.add({ seconds: 20 }), now)).toBe(1_000);
  });

  test("ticks every 10 seconds while showing minutes", () => {
    expect(relativeRefreshDelay(now.subtract({ minutes: 5 }), now)).toBe(10_000);
  });

  test("ticks every minute while showing hours", () => {
    expect(relativeRefreshDelay(now.subtract({ hours: 3 }), now)).toBe(60_000);
  });

  test("ticks every hour beyond a day", () => {
    expect(relativeRefreshDelay(now.subtract({ days: 3 }), now)).toBe(3_600_000);
  });
});
