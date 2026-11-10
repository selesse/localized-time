import {
  type CSSProperties,
  type ReactNode,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  choosePlacement,
  convertTimestamp,
  createPopupData,
  type FormatOption,
  formatRelativeTime,
  formatTime,
  horizontalShift,
  type PopupData,
  type PopupPlacement,
} from "../core/index.js";
import { Popup } from "./Popup.js";

export interface LocalizedTimeProps {
  /** ISO timestamp with timezone (required) */
  from: string;
  /** Override the viewer's timezone */
  viewerTz?: string;
  /** Display format: "short", "medium", "long", or custom options */
  format?: FormatOption;
  /** Additional CSS class for the trigger element */
  className?: string;
  /** Inline styles for the trigger element */
  style?: CSSProperties;
  /**
   * Custom popup renderer. placement is the side of the trigger it should open on;
   * shift is how many pixels to move it off-centre to stay inside the viewport.
   */
  renderPopup?: (data: PopupData, placement: PopupPlacement, shift: number) => ReactNode;
  /** CSS class for the popup */
  popupClassName?: string;
}

const useBrowserLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

const triggerStyles: CSSProperties = {
  display: "inline",
  position: "relative",
  textDecoration: "underline",
  textDecorationStyle: "dotted",
  textDecorationColor: "var(--lt-underline-color, currentColor)",
  textUnderlineOffset: "2px",
  cursor: "pointer",
};

/**
 * React component that displays a timestamp in the viewer's local timezone
 * with a popup showing timezone details on click.
 *
 * @example
 * <LocalizedTime from="2025-05-18T23:00:00-08:00" />
 *
 * @example With custom timezone
 * <LocalizedTime from="2025-05-18T23:00:00-08:00" viewerTz="Europe/Berlin" />
 */
export function LocalizedTime({
  from,
  viewerTz,
  format = "medium",
  className,
  style,
  renderPopup,
  popupClassName,
}: LocalizedTimeProps): ReactNode {
  const [showPopup, setShowPopup] = useState(false);
  const [placement, setPlacement] = useState<PopupPlacement>("above");
  const [shift, setShift] = useState(0);
  const containerRef = useRef<HTMLSpanElement>(null);

  useBrowserLayoutEffect(() => {
    const container = containerRef.current;
    const popup = container?.lastElementChild;
    if (!showPopup || !container || !popup) return;

    const triggerRect = container.getBoundingClientRect();
    const popupRect = popup.getBoundingClientRect();
    const viewportWidth = document.documentElement.clientWidth || window.innerWidth;
    setPlacement(choosePlacement(triggerRect, popupRect.height, window.innerHeight));
    setShift(horizontalShift(triggerRect, popupRect.width, viewportWidth));
  }, [showPopup]);

  // Memoize conversion result
  const conversionResult = useMemo(() => {
    try {
      return convertTimestamp(from, viewerTz);
    } catch {
      return null;
    }
  }, [from, viewerTz]);

  // Memoize display values
  const displayTime = useMemo(() => {
    if (!conversionResult) return null;
    return format === "relative"
      ? formatRelativeTime(conversionResult.localTime)
      : formatTime(conversionResult.localTime, format);
  }, [conversionResult, format]);

  const popupData = useMemo(() => {
    if (!conversionResult) return null;
    // For relative format, use medium for popup display
    const popupFormat = format === "relative" ? "medium" : format;
    return createPopupData(conversionResult, popupFormat);
  }, [conversionResult, format]);

  // Close popup when clicking outside
  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
      setShowPopup(false);
    }
  }, []);

  // Close popup on Escape key
  const handleKeydown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") {
      setShowPopup(false);
      // Return focus to trigger
      containerRef.current?.focus();
    }
  }, []);

  // Add/remove event listeners
  useEffect(() => {
    if (showPopup) {
      document.addEventListener("click", handleClickOutside);
      document.addEventListener("keydown", handleKeydown);
    }
    return () => {
      document.removeEventListener("click", handleClickOutside);
      document.removeEventListener("keydown", handleKeydown);
    };
  }, [showPopup, handleClickOutside, handleKeydown]);

  // Handle click on trigger
  const handleClick = useCallback(() => {
    setShowPopup((prev) => !prev);
  }, []);

  // Handle keyboard activation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleClick();
      }
    },
    [handleClick],
  );

  // Error state
  if (!conversionResult || !displayTime || !popupData) {
    return (
      <span className={className} style={style} title="Invalid timestamp">
        [Invalid time]
      </span>
    );
  }

  return (
    <span
      ref={containerRef}
      className={className}
      style={{ ...triggerStyles, ...style }}
      role="button"
      tabIndex={0}
      aria-expanded={showPopup}
      aria-haspopup="true"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      {displayTime}
      {showPopup &&
        (renderPopup ? (
          renderPopup(popupData, placement, shift)
        ) : (
          <Popup data={popupData} className={popupClassName} placement={placement} shift={shift} />
        ))}
    </span>
  );
}
