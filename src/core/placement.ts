export type PopupPlacement = "above" | "below";

export const POPUP_GAP = 8;

export const VIEWPORT_MARGIN = 8;

/**
 * Choose which side of the trigger the popup opens on.
 * Prefers above; flips below when the popup would run past the top of the viewport,
 * and picks the roomier side when it fits on neither.
 */
export function choosePlacement(
  trigger: { top: number; bottom: number },
  popupHeight: number,
  viewportHeight: number,
): PopupPlacement {
  const roomAbove = trigger.top - POPUP_GAP;
  const roomBelow = viewportHeight - trigger.bottom - POPUP_GAP;

  if (popupHeight <= roomAbove) return "above";
  if (popupHeight <= roomBelow) return "below";
  return roomBelow > roomAbove ? "below" : "above";
}

/**
 * Pixels to move a popup centred on the trigger so it stays inside the viewport.
 * A popup wider than the viewport is aligned to the left edge.
 */
export function horizontalShift(
  trigger: { left: number; right: number },
  popupWidth: number,
  viewportWidth: number,
): number {
  const centredLeft = (trigger.left + trigger.right) / 2 - popupWidth / 2;
  const maxLeft = viewportWidth - VIEWPORT_MARGIN - popupWidth;
  const left = Math.max(VIEWPORT_MARGIN, Math.min(centredLeft, maxLeft));
  return left - centredLeft;
}
