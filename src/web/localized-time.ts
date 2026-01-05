import {
  convertTimestamp,
  createPopupData,
  type FormatOption,
  formatRelativeTime,
  formatTime,
} from "../core/index.js";
import { styles } from "./styles.js";

/**
 * A web component that displays a timestamp in the viewer's local timezone
 * with a popup showing timezone details on click.
 *
 * @example
 * <localized-time from="2025-05-18T23:00:00-08:00"></localized-time>
 *
 * @attr from - ISO timestamp with timezone (required)
 * @attr viewer-tz - Override viewer's timezone
 * @attr format - Display format: "short", "medium", "long"
 */
export class LocalizedTimeElement extends HTMLElement {
  static observedAttributes = ["from", "viewer-tz", "format"];

  private shadow: ShadowRoot;
  private popupVisible = false;
  private boundHandleOutsideClick: (e: MouseEvent) => void;
  private boundHandleKeydown: (e: KeyboardEvent) => void;

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });
    this.boundHandleOutsideClick = this.handleOutsideClick.bind(this);
    this.boundHandleKeydown = this.handleKeydown.bind(this);
  }

  connectedCallback() {
    this.render();
  }

  disconnectedCallback() {
    this.removeEventListeners();
  }

  attributeChangedCallback() {
    this.render();
  }

  private get from(): string {
    return this.getAttribute("from") || "";
  }

  private get viewerTz(): string | undefined {
    return this.getAttribute("viewer-tz") || undefined;
  }

  private get format(): FormatOption {
    const attr = this.getAttribute("format");
    if (attr === "short" || attr === "medium" || attr === "long" || attr === "relative") {
      return attr;
    }
    return "medium";
  }

  private render() {
    if (!this.from) {
      this.shadow.innerHTML = `<span class="lt-error">Missing "from" attribute</span>`;
      return;
    }

    try {
      const result = convertTimestamp(this.from, this.viewerTz);
      const displayTime =
        this.format === "relative"
          ? formatRelativeTime(result.localTime)
          : formatTime(result.localTime, this.format);
      const popupData = createPopupData(
        result,
        this.format === "relative" ? "medium" : this.format,
      );

      this.shadow.innerHTML = `
        <style>${styles}</style>
        <span
          class="lt-trigger"
          role="button"
          tabindex="0"
          aria-expanded="false"
          aria-haspopup="true"
        >${displayTime}</span>
        <div class="lt-popup lt-hidden" role="tooltip" aria-live="polite">
          <div class="lt-popup-row lt-popup-local">
            <span class="lt-popup-label">Your time:</span>
            <span class="lt-popup-value">${popupData.localTimeFormatted} (${popupData.localTimezone})</span>
          </div>
          <div class="lt-popup-row lt-popup-original">
            <span class="lt-popup-label">Original:</span>
            <span class="lt-popup-value">${popupData.originalTimeFormatted} (${popupData.originalTimezone})</span>
          </div>
          <div class="lt-popup-row lt-popup-diff">
            <span class="lt-popup-label">Difference:</span>
            <span class="lt-popup-value">${popupData.diffFormatted}</span>
          </div>
        </div>
      `;

      this.setupEventListeners();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Invalid timestamp";
      this.shadow.innerHTML = `
        <style>${styles}</style>
        <span class="lt-error" title="${message}">[Invalid time]</span>
      `;
    }
  }

  private setupEventListeners() {
    const trigger = this.shadow.querySelector(".lt-trigger");
    if (trigger) {
      trigger.addEventListener("click", () => this.togglePopup());
      trigger.addEventListener("keydown", (e) => {
        const event = e as KeyboardEvent;
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          this.togglePopup();
        }
      });
    }
  }

  private togglePopup() {
    this.popupVisible = !this.popupVisible;

    const popup = this.shadow.querySelector(".lt-popup");
    const trigger = this.shadow.querySelector(".lt-trigger");

    if (popup && trigger) {
      popup.classList.toggle("lt-hidden", !this.popupVisible);
      trigger.setAttribute("aria-expanded", String(this.popupVisible));

      if (this.popupVisible) {
        document.addEventListener("click", this.boundHandleOutsideClick);
        document.addEventListener("keydown", this.boundHandleKeydown);
      } else {
        this.removeEventListeners();
      }
    }
  }

  private handleOutsideClick(e: MouseEvent) {
    if (!this.contains(e.target as Node)) {
      this.closePopup();
    }
  }

  private handleKeydown(e: KeyboardEvent) {
    if (e.key === "Escape") {
      this.closePopup();
      // Return focus to trigger
      const trigger = this.shadow.querySelector(".lt-trigger") as HTMLElement;
      trigger?.focus();
    }
  }

  private closePopup() {
    this.popupVisible = false;
    const popup = this.shadow.querySelector(".lt-popup");
    const trigger = this.shadow.querySelector(".lt-trigger");

    if (popup) popup.classList.add("lt-hidden");
    if (trigger) trigger.setAttribute("aria-expanded", "false");

    this.removeEventListeners();
  }

  private removeEventListeners() {
    document.removeEventListener("click", this.boundHandleOutsideClick);
    document.removeEventListener("keydown", this.boundHandleKeydown);
  }
}

/**
 * Register the custom element
 */
export function register(tagName = "localized-time") {
  if (!customElements.get(tagName)) {
    customElements.define(tagName, LocalizedTimeElement);
  }
}
