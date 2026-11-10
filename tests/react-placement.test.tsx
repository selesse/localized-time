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

function stubLayout(triggerTop: number) {
  window.HTMLElement.prototype.getBoundingClientRect = function (this: HTMLElement) {
    if (this.getAttribute("role") === "tooltip") return { height: 115 } as DOMRect;
    return { top: triggerTop, bottom: triggerTop + 20 } as DOMRect;
  } as () => DOMRect;
}

async function openWithTriggerAt(
  triggerTop: number,
  element = <LocalizedTime from="2025-05-18T12:00:00Z" viewerTz="UTC" />,
) {
  stubLayout(triggerTop);
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
});
