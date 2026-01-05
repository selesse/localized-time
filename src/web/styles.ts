/**
 * Default styles for the localized-time web component
 * Uses CSS custom properties for easy customization
 */
export const styles = `
:host {
  display: inline;
  position: relative;
}

.lt-trigger {
  text-decoration: underline;
  text-decoration-style: dotted;
  text-decoration-color: var(--lt-underline-color, currentColor);
  text-underline-offset: 2px;
  cursor: pointer;
}

.lt-trigger:hover {
  text-decoration-style: solid;
}

.lt-trigger:focus {
  outline: 2px solid var(--lt-focus-color, #0066cc);
  outline-offset: 2px;
  border-radius: 2px;
}

.lt-popup {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  z-index: var(--lt-popup-z-index, 1000);

  background: var(--lt-popup-bg, #ffffff);
  color: var(--lt-popup-color, #1a1a1a);
  border: 1px solid var(--lt-popup-border-color, #e0e0e0);
  border-radius: var(--lt-popup-radius, 8px);
  box-shadow: var(--lt-popup-shadow, 0 4px 12px rgba(0, 0, 0, 0.15));

  padding: 12px 16px;
  min-width: 200px;
  white-space: nowrap;

  font-family: var(--lt-popup-font, system-ui, -apple-system, sans-serif);
  font-size: var(--lt-popup-font-size, 14px);
  line-height: 1.5;
}

.lt-popup::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 6px solid transparent;
  border-top-color: var(--lt-popup-bg, #ffffff);
}

.lt-popup-row {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 4px;
}

.lt-popup-row:last-child {
  margin-bottom: 0;
}

.lt-popup-label {
  color: var(--lt-popup-label-color, #666666);
  font-size: 0.9em;
}

.lt-popup-value {
  font-weight: 500;
}

.lt-popup-local .lt-popup-value {
  font-weight: 700;
  color: var(--lt-popup-local-color, inherit);
}

.lt-popup-diff {
  padding-top: 8px;
  margin-top: 8px;
  border-top: 1px solid var(--lt-popup-divider-color, #e0e0e0);
}

.lt-hidden {
  display: none;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .lt-popup {
    --lt-popup-bg: #2a2a2a;
    --lt-popup-color: #f0f0f0;
    --lt-popup-border-color: #404040;
    --lt-popup-label-color: #999999;
    --lt-popup-divider-color: #404040;
  }

  .lt-popup::after {
    border-top-color: var(--lt-popup-bg, #2a2a2a);
  }
}
`;
