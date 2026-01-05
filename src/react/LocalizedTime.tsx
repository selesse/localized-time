import {
  type CSSProperties,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  convertTimestamp,
  createPopupData,
  type FormatOption,
  formatRelativeTime,
  formatTime,
  type PopupData,
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
  /** Custom popup renderer */
  renderPopup?: (data: PopupData) => ReactNode;
  /** CSS class for the popup */
  popupClassName?: string;
}

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
  const containerRef = useRef<HTMLSpanElement>(null);

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
          renderPopup(popupData)
        ) : (
          <Popup data={popupData} className={popupClassName} />
        ))}
    </span>
  );
}
