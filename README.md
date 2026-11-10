# localized-time

Show timestamps in the reader's own timezone.

[![npm version](https://img.shields.io/npm/v/localized-time.svg)](https://www.npmjs.com/package/localized-time)
[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE)
[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen.svg)](https://selesse.com/localized-time)

> Tickets go on sale at **11 PM PT**.

Readers in New York, London, and Tokyo each have to work out what that means for them. With `localized-time`, each reader sees the time in their own timezone. Clicking it shows the original time and the difference:

```html
Tickets go on sale at <localized-time from="2025-05-18T23:00:00-07:00"></localized-time>
```

A reader in New York sees **May 19, 2:00 AM**. The popup shows the original time, May 18, 11:00 PM (GMT-7), and the difference, +3h.

It ships as a web component that works anywhere and as a React component. [Try the demo.](https://selesse.com/localized-time)

## Install

```bash
npm install localized-time
```

## Usage

### Web component

```html
<script type="module">
  import "localized-time/web";
</script>

<localized-time from="2025-05-18T23:00:00-07:00"></localized-time>
```

### React

```tsx
import { LocalizedTime } from "localized-time/react";

<LocalizedTime from="2025-05-18T23:00:00-07:00" />
```

`from` must be an ISO 8601 timestamp with an offset or `Z`, such as `2025-05-18T23:00:00-07:00` or `2025-05-19T06:00:00Z`. Without one, there's no way to know which timezone the time was written in.

### Formats

| `format` | Output |
|----------|--------|
| `short` | 11:00 PM |
| `medium` (default) | May 18, 11:00 PM |
| `long` | Sun, May 18, 2025 at 11:00 PM |
| `relative` | in 5 hours |

In React, `format` also accepts any `Intl.DateTimeFormatOptions` object.

Relative times update themselves while they're on the page. They refresh every second while showing seconds, every 10 seconds for minutes, every minute for hours, and hourly beyond that.

### Pinning the timezone

By default, times are shown in the browser's timezone. To show a specific timezone instead:

```html
<localized-time from="..." viewer-tz="Europe/London"></localized-time>
```

```tsx
<LocalizedTime from="..." viewerTz="Europe/London" />
```

## API

### Web component attributes

| Attribute | Description |
|-----------|-------------|
| `from` | **Required.** ISO 8601 timestamp with offset |
| `format` | `short`, `medium`, `long` or `relative` |
| `viewer-tz` | IANA timezone to show the time in, instead of the browser's |

### React props

| Prop | Type | Description |
|------|------|-------------|
| `from` | `string` | **Required.** ISO 8601 timestamp with offset |
| `format` | `FormatOption` | A preset name, or `Intl.DateTimeFormatOptions` |
| `viewerTz` | `string` | IANA timezone to show the time in, instead of the browser's |
| `className`, `style` | | Applied to the timestamp |
| `popupClassName` | `string` | Applied to the popup |
| `renderPopup` | `(data, placement, shift) => ReactNode` | Replaces the popup. See [Custom popup](#custom-popup-react) |

### Core

`localized-time/core` contains the conversion and formatting functions the components use, for building your own UI:

```ts
import { convertTimestamp, formatTime, formatRelativeTime } from "localized-time/core";

const result = convertTimestamp("2025-05-18T23:00:00-07:00", "America/New_York");
result.diffHours;                      // 3
formatTime(result.localTime, "medium"); // "May 19, 2:00 AM"
formatRelativeTime(result.localTime);   // e.g. "in 5 hours"
```

The core functions run on Temporal. To use a different date library such as Luxon or Day.js, implement `TimeAdapter` and pass it to `createEngine`:

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

## Styling

### CSS variables

```css
localized-time {
  --lt-underline-color: #6366f1;
  --lt-focus-color: #6366f1;
  --lt-popup-bg: #ffffff;
  --lt-popup-color: #1a1a1a;
  --lt-popup-local-color: #1a1a1a;
  --lt-popup-label-color: #666666;
  --lt-popup-border-color: #e0e0e0;
  --lt-popup-divider-color: #e0e0e0;
  --lt-popup-radius: 8px;
  --lt-popup-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  --lt-popup-font: system-ui, sans-serif;
  --lt-popup-font-size: 14px;
  --lt-popup-z-index: 1000;
}
```

### Custom popup (React)

`renderPopup` receives three things:

- the popup data: `localTimeFormatted`, `originalTimeFormatted`, `localTimezone`, `originalTimezone`, `diffFormatted` and `diffHours`
- whether the popup is `"above"` or `"below"` the timestamp
- `shift`, how many pixels to move the popup sideways to keep it inside the viewport

```tsx
<LocalizedTime
  from="2025-05-18T23:00:00-07:00"
  renderPopup={(data, placement, shift) => (
    <div className={`my-popup my-popup-${placement}`} style={{ translate: `${shift}px` }}>
      <strong>{data.localTimeFormatted}</strong>
      <span>Originally {data.originalTimeFormatted}</span>
    </div>
  )}
/>
```

## Browser support

Any modern browser with ES2022 and BigInt support. The browser's own Temporal API is used when it has one. Otherwise, a bundled polyfill is used.

## Development

```bash
bun install
bun test
bun run build        # library → dist/
bun run dev          # demo dev server
```

## License

[Apache 2.0](LICENSE)
