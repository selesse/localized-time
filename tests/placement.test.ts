import { describe, expect, test } from "bun:test";
import { choosePlacement, horizontalShift } from "../src/core/placement";

describe("choosePlacement", () => {
  test("opens above when the popup fits above the trigger", () => {
    expect(choosePlacement({ top: 400, bottom: 420 }, 115, 768)).toBe("above");
  });

  test("opens below when the popup would run past the top of the viewport", () => {
    expect(choosePlacement({ top: 70, bottom: 90 }, 115, 768)).toBe("below");
  });

  test("counts the gap between the trigger and the popup", () => {
    expect(choosePlacement({ top: 120, bottom: 140 }, 115, 768)).toBe("below");
    expect(choosePlacement({ top: 123, bottom: 143 }, 115, 768)).toBe("above");
  });

  test("picks the roomier side when the popup fits on neither", () => {
    expect(choosePlacement({ top: 60, bottom: 80 }, 115, 150)).toBe("below");
    expect(choosePlacement({ top: 90, bottom: 110 }, 115, 150)).toBe("above");
  });
});

describe("horizontalShift", () => {
  test("leaves a centred popup alone when it fits", () => {
    expect(horizontalShift({ left: 400, right: 480 }, 260, 1024)).toBe(0);
  });

  test("pulls the popup left when it would run past the right edge", () => {
    expect(horizontalShift({ left: 900, right: 980 }, 260, 1024)).toBe(-54);
  });

  test("pushes the popup right when it would run past the left edge", () => {
    expect(horizontalShift({ left: 4, right: 84 }, 260, 1024)).toBe(94);
  });

  test("aligns to the left edge when the popup is wider than the viewport", () => {
    expect(horizontalShift({ left: 100, right: 140 }, 400, 300)).toBe(88);
  });
});
