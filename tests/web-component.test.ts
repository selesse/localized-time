import { afterEach, beforeAll, describe, expect, test } from "bun:test";
import { Window } from "happy-dom";

// Create a window and set up globals
const window = new Window({ url: "https://localhost:8080" });

// Set up globals before importing components
Object.assign(globalThis, {
  window,
  document: window.document,
  HTMLElement: window.HTMLElement,
  customElements: window.customElements,
  Node: window.Node,
  Element: window.Element,
  DocumentFragment: window.DocumentFragment,
  ShadowRoot: window.ShadowRoot,
  MutationObserver: window.MutationObserver,
  getComputedStyle: window.getComputedStyle.bind(window),
});

// Now import the component (after DOM globals exist)
const { register } = await import("../src/web/localized-time");

describe("LocalizedTimeElement", () => {
  beforeAll(() => {
    // Register the custom element
    if (!customElements.get("localized-time")) {
      register("localized-time");
    }
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  test("renders time in viewer timezone", async () => {
    document.body.innerHTML = `
      <localized-time from="2025-05-18T12:00:00Z" viewer-tz="UTC"></localized-time>
    `;

    // Wait for custom element to upgrade
    await new Promise((r) => setTimeout(r, 50));

    const element = document.querySelector("localized-time");
    expect(element).toBeTruthy();

    const shadowRoot = element?.shadowRoot;
    expect(shadowRoot).toBeTruthy();

    const trigger = shadowRoot?.querySelector(".lt-trigger");
    expect(trigger).toBeTruthy();
  });

  test("shows error for missing from attribute", async () => {
    document.body.innerHTML = `<localized-time></localized-time>`;
    await new Promise((r) => setTimeout(r, 50));

    const element = document.querySelector("localized-time");
    const shadowRoot = element?.shadowRoot;
    const content = shadowRoot?.innerHTML || "";

    expect(content).toMatch(/Missing/);
  });

  test("shows error for invalid timestamp", async () => {
    document.body.innerHTML = `
      <localized-time from="not-a-date"></localized-time>
    `;
    await new Promise((r) => setTimeout(r, 50));

    const element = document.querySelector("localized-time");
    const shadowRoot = element?.shadowRoot;
    const content = shadowRoot?.innerHTML || "";

    expect(content).toMatch(/Invalid/);
  });

  test("keeps an invalid timestamp out of the error markup", async () => {
    const element = document.createElement("localized-time");
    element.setAttribute("from", 'x" onmouseover="alert(1)');
    document.body.appendChild(element);
    await new Promise((r) => setTimeout(r, 50));

    const error = element.shadowRoot?.querySelector(".lt-error");
    expect(error?.getAttributeNames().sort()).toEqual(["class", "title"]);
    expect(error?.getAttribute("title")).toContain('x" onmouseover="alert(1)');
  });

  test("respects format attribute", async () => {
    document.body.innerHTML = `
      <localized-time from="2025-05-18T12:00:00Z" viewer-tz="UTC" format="long"></localized-time>
    `;
    await new Promise((r) => setTimeout(r, 50));

    const element = document.querySelector("localized-time");
    const trigger = element?.shadowRoot?.querySelector(".lt-trigger");

    // Long format should include year
    expect(trigger?.textContent).toMatch(/2025/);
  });

  test("has popup hidden by default", async () => {
    document.body.innerHTML = `
      <localized-time from="2025-05-18T12:00:00Z" viewer-tz="UTC"></localized-time>
    `;
    await new Promise((r) => setTimeout(r, 50));

    const element = document.querySelector("localized-time");
    const popup = element?.shadowRoot?.querySelector(".lt-popup");

    expect(popup?.classList.contains("lt-hidden")).toBe(true);
  });

  test("has correct ARIA attributes", async () => {
    document.body.innerHTML = `
      <localized-time from="2025-05-18T12:00:00Z" viewer-tz="UTC"></localized-time>
    `;
    await new Promise((r) => setTimeout(r, 50));

    const element = document.querySelector("localized-time");
    const trigger = element?.shadowRoot?.querySelector(".lt-trigger");

    expect(trigger?.getAttribute("role")).toBe("button");
    expect(trigger?.getAttribute("tabindex")).toBe("0");
    expect(trigger?.getAttribute("aria-expanded")).toBe("false");
  });

  test("popup contains timezone sections", async () => {
    document.body.innerHTML = `
      <localized-time from="2025-05-18T12:00:00Z" viewer-tz="UTC"></localized-time>
    `;
    await new Promise((r) => setTimeout(r, 50));

    const element = document.querySelector("localized-time");
    const popup = element?.shadowRoot?.querySelector(".lt-popup");

    expect(popup?.querySelector(".lt-popup-local")).toBeTruthy();
    expect(popup?.querySelector(".lt-popup-original")).toBeTruthy();
    expect(popup?.querySelector(".lt-popup-diff")).toBeTruthy();
  });

  describe("popup placement", () => {
    async function openWithTriggerAt(top: number) {
      document.body.innerHTML = `
        <localized-time from="2025-05-18T12:00:00Z" viewer-tz="UTC"></localized-time>
      `;
      await new Promise((r) => setTimeout(r, 50));

      const shadowRoot = document.querySelector("localized-time")?.shadowRoot;
      const trigger = shadowRoot?.querySelector(".lt-trigger") as HTMLElement;
      const popup = shadowRoot?.querySelector(".lt-popup") as HTMLElement;
      trigger.getBoundingClientRect = () => ({ top, bottom: top + 20 }) as DOMRect;
      popup.getBoundingClientRect = () => ({ height: 115 }) as DOMRect;

      trigger.click();
      return popup;
    }

    test("opens above the trigger when there is room", async () => {
      const popup = await openWithTriggerAt(400);

      expect(popup.classList.contains("lt-hidden")).toBe(false);
      expect(popup.classList.contains("lt-below")).toBe(false);
    });

    test("opens below the trigger near the top of the viewport", async () => {
      const popup = await openWithTriggerAt(70);

      expect(popup.classList.contains("lt-hidden")).toBe(false);
      expect(popup.classList.contains("lt-below")).toBe(true);
    });
  });
});

describe("register function", () => {
  test("registers custom element with default tag name", () => {
    expect(customElements.get("localized-time")).toBeTruthy();
  });

  test("does not throw when registering same tag twice", () => {
    // Should not throw - register is idempotent for same tag name
    expect(() => register("localized-time")).not.toThrow();
  });
});
