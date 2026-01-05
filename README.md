# localized-time

A timezone-aware formatting and display library that makes it effortless to show timestamps in the user's local timezone.

**[Live Demo](https://selesse.github.io/localized-time/)** | **[GitHub](https://github.com/selesse/localized-time)**

## The Problem

> "Tickets go on sale at **11 PM PST**."
> "Cool... what time is that *for me*?"

Users shouldn't have to do timezone math. `localized-time` automatically converts timestamps to the viewer's local timezone and shows the original for reference.

## Features

- **Automatic timezone conversion** - Powered by the Temporal API
- **Relative time** - Display "in 5 hours" or "3 days ago"
- **Web Component** - Works with any framework or vanilla JS
- **React Component** - First-class React support
- **Accessible** - ARIA attributes, keyboard navigation
- **Customizable** - CSS variables, format presets, render props
- **Lightweight** - ~30KB gzipped per entry point (includes Temporal polyfill)

## Installation

```bash
npm install localized-time
# or
bun add localized-time
# or
yarn add localized-time
```

## Quick Start

### Web Component

```html
<script type="module">
  import "localized-time/web";
</script>

<p>
  Tickets go on sale at
  <localized-time from="2025-05-18T23:00:00-08:00"></localized-time>
</p>
```

### React

```tsx
import { LocalizedTime } from "localized-time/react";

function TicketSale() {
  return (
    <p>
      Tickets go on sale at{" "}
      <LocalizedTime from="2025-05-18T23:00:00-08:00" />
    </p>
  );
}
```

## Usage

Click any timestamp to see a popup with:
- **Your local time** (converted)
- **Original time** (source timezone)
- **Time difference** (+3h, -9h, etc.)

### Timestamp Format

The `from` attribute/prop accepts ISO 8601 strings with timezone:

```
2025-05-18T23:00:00-08:00      (offset)
2025-05-18T23:00:00Z           (UTC)
2025-05-18T23:00:00+09:00      (positive offset)
```

### Format Options

| Format | Example Output |
|--------|----------------|
| `short` | 11:00 PM |
| `medium` (default) | May 18, 11:00 PM |
| `long` | Sun, May 18, 2025, 11:00 PM |
| `relative` | in 5 hours |

```html
<localized-time from="..." format="short"></localized-time>
<localized-time from="..." format="long"></localized-time>
<localized-time from="..." format="relative"></localized-time>
```

### Relative Time

The `relative` format displays human-friendly relative times like "in 5 hours", "3 days ago", or "tomorrow". It automatically chooses the most appropriate unit (seconds, minutes, hours, days, months, or years).

```html
<!-- Shows "in 5 hours" if the event is 5 hours away -->
<p>Event starts <localized-time from="2025-05-18T23:00:00Z" format="relative"></localized-time></p>
```

```tsx
// React
<p>Event starts <LocalizedTime from="2025-05-18T23:00:00Z" format="relative" /></p>
```

Clicking a relative time still shows the popup with exact times and timezone details.

### Override Viewer Timezone

Force display in a specific timezone:

```html
<localized-time from="..." viewer-tz="Europe/London"></localized-time>
```

```tsx
<LocalizedTime from="..." viewerTz="Europe/London" />
```

## API Reference

### Web Component Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| `from` | string | **Required.** ISO 8601 timestamp with timezone |
| `viewer-tz` | string | Override viewer's timezone (IANA or offset) |
| `format` | string | `"short"`, `"medium"`, `"long"`, or `"relative"` |

### React Props

| Prop | Type | Description |
|------|------|-------------|
| `from` | string | **Required.** ISO 8601 timestamp with timezone |
| `viewerTz` | string | Override viewer's timezone |
| `format` | FormatOption | `"short"`, `"medium"`, `"long"`, `"relative"`, or custom Intl options |
| `className` | string | CSS class for the trigger element |
| `style` | CSSProperties | Inline styles |
| `renderPopup` | function | Custom popup renderer `(data: PopupData) => ReactNode` |
| `popupClassName` | string | CSS class for the popup |

### Core Functions

For advanced usage, import from `localized-time/core`:

```ts
import {
  convertTimestamp,
  formatTime,
  formatRelativeTime,
  createPopupData,
  // Adapter system
  createEngine,
  temporalAdapter,
  type TimeAdapter,
} from "localized-time/core";

// Convert a timestamp
const result = convertTimestamp("2025-05-18T23:00:00-08:00", "America/New_York");
console.log(result.localTime);      // ZonedDateTime
console.log(result.diffHours);      // 3

// Format for display
const formatted = formatTime(result.localTime, "medium");  // "May 19, 2:00 AM"
const relative = formatRelativeTime(result.localTime);     // "in 5 hours"
```

## Customization

### CSS Variables

```css
localized-time {
  --lt-underline-color: #6366f1;
  --lt-focus-color: #6366f1;
  --lt-popup-bg: #ffffff;
  --lt-popup-color: #1a1a1a;
  --lt-popup-border-color: #e0e0e0;
  --lt-popup-radius: 8px;
  --lt-popup-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  --lt-popup-font: system-ui, sans-serif;
  --lt-popup-font-size: 14px;
  --lt-popup-label-color: #666666;
  --lt-popup-divider-color: #e0e0e0;
}
```

### Custom Popup (React)

```tsx
<LocalizedTime
  from="2025-05-18T23:00:00-08:00"
  renderPopup={(data) => (
    <div className="my-popup">
      <strong>{data.localTimeFormatted}</strong>
      <span>Originally: {data.originalTimeFormatted}</span>
    </div>
  )}
/>
```

## Extensibility

Support for other time libraries (Luxon, Day.js) via adapters:

```ts
import { createEngine, type TimeAdapter } from "localized-time/core";
import { DateTime } from "luxon";

const luxonAdapter: TimeAdapter<DateTime> = {
  parse: (iso) => DateTime.fromISO(iso, { setZone: true }),
  toZone: (dt, tz) => dt.setZone(tz),
  getViewerTimezone: () => DateTime.local().zoneName ?? "UTC",
  getTimezone: (dt) => dt.zoneName ?? "UTC",
  getOffsetHours: (dt) => dt.offset / 60,
  toEpochMillis: (dt) => dt.toMillis(),
};

const engine = createEngine(luxonAdapter);
```

## Browser Support

Modern browsers with ES2022 support. The Temporal API is polyfilled automatically.

## Development

```bash
# Install dependencies
bun install

# Run tests
bun test

# Build library
bun run build

# Build demo
bun run build:demo

# Start dev server
bun run dev
```

## License

Apache 2.0
