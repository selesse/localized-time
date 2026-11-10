import { afterEach, describe, expect, test } from "bun:test";
import { Window } from "happy-dom";

const window = new Window({ url: "https://localhost:8080" });

Object.assign(globalThis, {
  window,
  document: window.document,
  navigator: window.navigator,
  HTMLElement: window.HTMLElement,
  Node: window.Node,
  Element: window.Element,
  MouseEvent: window.MouseEvent,
  KeyboardEvent: window.KeyboardEvent,
  IS_REACT_ACT_ENVIRONMENT: true,
});

const { act } = await import("react");
const { createRoot } = await import("react-dom/client");
const { LocalizedTime } = await import("../src/react/index");

function stubLayout(triggerTop: number, triggerLeft: number) {
  window.HTMLElement.prototype.getBoundingClientRect = function (this: HTMLElement) {
    if (this.getAttribute("role") === "tooltip") return { height: 115, width: 260 } as DOMRect;
    return {
      top: triggerTop,
      bottom: triggerTop + 20,
      left: triggerLeft,
      right: triggerLeft + 80,
    } as DOMRect;
  } as () => DOMRect;
}

async function openWithTriggerAt(
  triggerTop: number,
  element = <LocalizedTime from="2025-05-18T12:00:00Z" viewerTz="UTC" />,
  triggerLeft = 400,
) {
  stubLayout(triggerTop, triggerLeft);
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  await act(async () => root.render(element));

  const trigger = container.querySelector('[role="button"]') as HTMLElement;
  await act(async () => trigger.click());
  return { container, root };
}

describe("LocalizedTime popup placement", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  test("opens above the trigger when there is room", async () => {
    const { container, root } = await openWithTriggerAt(400);

    const popup = container.querySelector('[role="tooltip"]');
    expect(popup?.getAttribute("data-placement")).toBe("above");
    act(() => root.unmount());
  });

  test("opens below the trigger near the top of the viewport", async () => {
    const { container, root } = await openWithTriggerAt(70);

    const popup = container.querySelector('[role="tooltip"]');
    expect(popup?.getAttribute("data-placement")).toBe("below");
    act(() => root.unmount());
  });

  test("passes the placement to a custom popup renderer", async () => {
    const { container, root } = await openWithTriggerAt(
      70,
      <LocalizedTime
        from="2025-05-18T12:00:00Z"
        viewerTz="UTC"
        renderPopup={(_data, placement) => (
          <div role="tooltip" data-custom={placement}>
            custom
          </div>
        )}
      />,
    );

    const popup = container.querySelector('[role="tooltip"]');
    expect(popup?.getAttribute("data-custom")).toBe("below");
    act(() => root.unmount());
  });

  test("shifts back inside the viewport near the right edge", async () => {
    const { container, root } = await openWithTriggerAt(
      400,
      <LocalizedTime from="2025-05-18T12:00:00Z" viewerTz="UTC" />,
      900,
    );

    const popup = container.querySelector('[role="tooltip"]') as HTMLElement;
    expect(popup.style.transform).toBe("translateX(calc(-50% + -54px))");
    act(() => root.unmount());
  });

  test("passes the shift to a custom popup renderer", async () => {
    const { container, root } = await openWithTriggerAt(
      400,
      <LocalizedTime
        from="2025-05-18T12:00:00Z"
        viewerTz="UTC"
        renderPopup={(_data, _placement, shift) => (
          <div role="tooltip" data-shift={shift}>
            custom
          </div>
        )}
      />,
      900,
    );

    const popup = container.querySelector('[role="tooltip"]');
    expect(popup?.getAttribute("data-shift")).toBe("-54");
    act(() => root.unmount());
  });
});

describe("LocalizedTime popup clicks", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  test("stays open when the popup itself is clicked", async () => {
    const { container, root } = await openWithTriggerAt(400);

    const value = container.querySelector('[role="tooltip"] span') as HTMLElement;
    await act(async () => value.click());

    expect(container.querySelector('[role="tooltip"]')).toBeTruthy();
    act(() => root.unmount());
  });

  test("closes when the trigger is clicked again", async () => {
    const { container, root } = await openWithTriggerAt(400);

    const trigger = container.querySelector('[role="button"]') as HTMLElement;
    await act(async () => trigger.click());

    expect(container.querySelector('[role="tooltip"]')).toBeNull();
    act(() => root.unmount());
  });
});
