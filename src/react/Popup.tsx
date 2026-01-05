import type { ReactNode } from "react";
import type { PopupData } from "../core/types.js";

export interface PopupProps {
  data: PopupData;
  className?: string;
}

const defaultStyles = {
  popup: {
    position: "absolute" as const,
    bottom: "calc(100% + 8px)",
    left: "50%",
    transform: "translateX(-50%)",
    zIndex: 1000,
    background: "var(--lt-popup-bg, #ffffff)",
    color: "var(--lt-popup-color, #1a1a1a)",
    border: "1px solid var(--lt-popup-border-color, #e0e0e0)",
    borderRadius: "var(--lt-popup-radius, 8px)",
    boxShadow: "var(--lt-popup-shadow, 0 4px 12px rgba(0, 0, 0, 0.15))",
    padding: "12px 16px",
    minWidth: "200px",
    whiteSpace: "nowrap" as const,
    fontFamily: "var(--lt-popup-font, system-ui, -apple-system, sans-serif)",
    fontSize: "var(--lt-popup-font-size, 14px)",
    lineHeight: 1.5,
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    gap: "16px",
    marginBottom: "4px",
  },
  lastRow: {
    marginBottom: 0,
  },
  label: {
    color: "var(--lt-popup-label-color, #666666)",
    fontSize: "0.9em",
  },
  value: {
    fontWeight: 500,
  },
  localValue: {
    fontWeight: 700,
  },
  diffRow: {
    paddingTop: "8px",
    marginTop: "8px",
    borderTop: "1px solid var(--lt-popup-divider-color, #e0e0e0)",
  },
  arrow: {
    content: '""',
    position: "absolute" as const,
    top: "100%",
    left: "50%",
    transform: "translateX(-50%)",
    border: "6px solid transparent",
    borderTopColor: "var(--lt-popup-bg, #ffffff)",
  },
};

/**
 * Default popup component for displaying timezone details
 */
export function Popup({ data, className }: PopupProps): ReactNode {
  return (
    <div className={className} style={defaultStyles.popup} role="tooltip" aria-live="polite">
      <div style={defaultStyles.row}>
        <span style={defaultStyles.label}>Your time:</span>
        <span style={{ ...defaultStyles.value, ...defaultStyles.localValue }}>
          {data.localTimeFormatted} ({data.localTimezone})
        </span>
      </div>
      <div style={defaultStyles.row}>
        <span style={defaultStyles.label}>Original:</span>
        <span style={defaultStyles.value}>
          {data.originalTimeFormatted} ({data.originalTimezone})
        </span>
      </div>
      <div style={{ ...defaultStyles.row, ...defaultStyles.lastRow, ...defaultStyles.diffRow }}>
        <span style={defaultStyles.label}>Difference:</span>
        <span style={defaultStyles.value}>{data.diffFormatted}</span>
      </div>
      <span style={defaultStyles.arrow} aria-hidden="true" />
    </div>
  );
}
