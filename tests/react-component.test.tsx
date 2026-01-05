import { describe, expect, test } from "bun:test";
import { renderToString } from "react-dom/server";
import { LocalizedTime, Popup } from "../src/react/index";

describe("LocalizedTime React Component", () => {
  test("renders time string", () => {
    const html = renderToString(<LocalizedTime from="2025-05-18T12:00:00Z" viewerTz="UTC" />);

    expect(html).toContain("12"); // Should contain hour
    expect(html).toContain("May"); // Should contain month (medium format)
  });

  test("renders with short format", () => {
    const html = renderToString(
      <LocalizedTime from="2025-05-18T12:00:00Z" viewerTz="UTC" format="short" />,
    );

    expect(html).toContain("12");
    expect(html).not.toContain("May"); // Short format doesn't include month
  });

  test("renders with long format", () => {
    const html = renderToString(
      <LocalizedTime from="2025-05-18T12:00:00Z" viewerTz="UTC" format="long" />,
    );

    expect(html).toContain("2025"); // Long format includes year
    expect(html).toContain("May");
  });

  test("has correct ARIA attributes", () => {
    const html = renderToString(<LocalizedTime from="2025-05-18T12:00:00Z" viewerTz="UTC" />);

    expect(html).toContain('role="button"');
    expect(html).toContain('tabindex="0"');
    expect(html).toContain('aria-expanded="false"');
    expect(html).toContain('aria-haspopup="true"');
  });

  test("applies custom className", () => {
    const html = renderToString(
      <LocalizedTime from="2025-05-18T12:00:00Z" viewerTz="UTC" className="my-custom-class" />,
    );

    expect(html).toContain("my-custom-class");
  });

  test("renders error state for invalid timestamp", () => {
    const html = renderToString(<LocalizedTime from="invalid-date" viewerTz="UTC" />);

    expect(html).toContain("Invalid");
  });
});

describe("Popup Component", () => {
  test("renders popup data", () => {
    const popupData = {
      localTimeFormatted: "May 18, 12:00 PM",
      originalTimeFormatted: "May 18, 12:00 PM",
      localTimezone: "UTC",
      originalTimezone: "UTC",
      diffFormatted: "same timezone",
      diffHours: 0,
    };

    const html = renderToString(<Popup data={popupData} />);

    expect(html).toContain("Your time:");
    expect(html).toContain("Original:");
    expect(html).toContain("Difference:");
    expect(html).toContain("May 18, 12:00 PM");
    expect(html).toContain("UTC");
    expect(html).toContain("same timezone");
  });

  test("renders timezone difference", () => {
    const popupData = {
      localTimeFormatted: "May 18, 9:00 PM",
      originalTimeFormatted: "May 18, 12:00 PM",
      localTimezone: "JST",
      originalTimezone: "UTC",
      diffFormatted: "+9h",
      diffHours: 9,
    };

    const html = renderToString(<Popup data={popupData} />);

    expect(html).toContain("+9h");
    expect(html).toContain("JST");
    expect(html).toContain("UTC");
  });

  test("applies custom className", () => {
    const popupData = {
      localTimeFormatted: "12:00 PM",
      originalTimeFormatted: "12:00 PM",
      localTimezone: "UTC",
      originalTimezone: "UTC",
      diffFormatted: "same timezone",
      diffHours: 0,
    };

    const html = renderToString(<Popup data={popupData} className="custom-popup" />);

    expect(html).toContain("custom-popup");
  });
});
