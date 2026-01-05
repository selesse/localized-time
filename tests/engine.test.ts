import { describe, expect, test } from "bun:test";
import { temporalAdapter } from "../src/core/adapters/temporal";
import type { TimeAdapter } from "../src/core/adapters/types";
import { createEngine, defaultEngine, LocalizedTimeEngine } from "../src/core/engine";

describe("LocalizedTimeEngine", () => {
  test("converts timestamps using adapter", () => {
    const engine = new LocalizedTimeEngine(temporalAdapter);
    const result = engine.convert("2025-05-18T12:00:00Z", "+09:00");

    expect(result.diffHours).toBe(9);
    expect(result.originalTimezone).toBe("UTC");
    expect(result.viewerTimezone).toBe("+09:00");
  });

  test("provides epoch millis for formatting", () => {
    const engine = new LocalizedTimeEngine(temporalAdapter);
    const result = engine.convert("2025-05-18T23:00:00Z", "UTC");

    const millis = engine.toEpochMillis(result.localTime);
    expect(millis).toBe(new Date("2025-05-18T23:00:00Z").getTime());
  });

  test("extracts timezone from datetime", () => {
    const engine = new LocalizedTimeEngine(temporalAdapter);
    const result = engine.convert("2025-05-18T23:00:00-08:00", "UTC");

    expect(engine.getTimezone(result.localTime)).toBe("UTC");
  });
});

describe("defaultEngine", () => {
  test("is pre-configured with Temporal adapter", () => {
    const result = defaultEngine.convert("2025-05-18T23:00:00Z", "UTC");
    expect(result.localTime).toBeTruthy();
  });
});

describe("createEngine", () => {
  test("creates engine with custom adapter", () => {
    // Mock adapter for testing
    const mockAdapter: TimeAdapter<{ time: string; tz: string }> = {
      parse: (iso) => ({ time: iso, tz: "UTC" }),
      toZone: (dt, tz) => ({ ...dt, tz }),
      getViewerTimezone: () => "America/New_York",
      getTimezone: (dt) => dt.tz,
      getOffsetHours: () => 0,
      toEpochMillis: () => Date.now(),
    };

    const engine = createEngine(mockAdapter);
    const result = engine.convert("2025-05-18T23:00:00Z", "Europe/Paris");

    expect(result.viewerTimezone).toBe("Europe/Paris");
    expect(engine.getTimezone(result.localTime)).toBe("Europe/Paris");
  });
});

describe("TimeAdapter interface", () => {
  test("temporalAdapter implements all required methods", () => {
    expect(typeof temporalAdapter.parse).toBe("function");
    expect(typeof temporalAdapter.toZone).toBe("function");
    expect(typeof temporalAdapter.getViewerTimezone).toBe("function");
    expect(typeof temporalAdapter.getTimezone).toBe("function");
    expect(typeof temporalAdapter.getOffsetHours).toBe("function");
    expect(typeof temporalAdapter.toEpochMillis).toBe("function");
  });

  test("temporalAdapter.parse handles UTC", () => {
    const utc = temporalAdapter.parse("2025-05-18T23:00:00Z");
    expect(temporalAdapter.getTimezone(utc)).toBe("UTC");
  });

  test("temporalAdapter.parse handles offsets", () => {
    const offset = temporalAdapter.parse("2025-05-18T23:00:00-08:00");
    expect(temporalAdapter.getTimezone(offset)).toBe("-08:00");
  });

  test("temporalAdapter.toZone converts between timezones", () => {
    const utc = temporalAdapter.parse("2025-05-18T12:00:00Z");
    const tokyo = temporalAdapter.toZone(utc, "Asia/Tokyo");
    expect(temporalAdapter.getTimezone(tokyo)).toBe("Asia/Tokyo");
  });
});
