# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2026-11-10

### Added

- Relative times (`format="relative"`) keep themselves current while on screen, so pages no longer need their own refresh interval
- `choosePlacement`, `horizontalShift` and `relativeRefreshDelay` in core
- `renderPopup` (React) receives the popup's `placement` and horizontal `shift` as extra arguments

### Changed

- `temporal-polyfill` 1.x, which uses native Temporal where the browser has it. BigInt is now required

### Fixed

- The popup opens below the timestamp when it would run past the top of the viewport
- The popup slides back inside the viewport near its left or right edge
- The web component's popup stays open across attribute changes instead of needing two clicks to reopen
- Clicking inside the React popup no longer closes it
- The web component's error tooltip can no longer inject attributes through an invalid `from` value
- The web component's popup no longer closes on the click that opened it in DOMs that don't retarget shadow events

## [0.1.0] - 2026-01-05

### Added

- Initial release
- Core timezone conversion engine powered by Temporal API
- Web Component (`<localized-time>`) for framework-agnostic usage
- React component (`<LocalizedTime>`) with hooks and render props
- Format presets: `short`, `medium`, `long`, `relative`
- Relative time formatting ("in 5 hours", "3 days ago")
- Click-to-reveal popup showing local time, original time, and difference
- CSS variables for styling customization
- Custom popup renderer support (React)
- Viewer timezone override (`viewer-tz` / `viewerTz`)
- Adapter system for extensibility (Luxon, Day.js, etc.)
- Full accessibility: ARIA attributes, keyboard navigation, focus management
- DST-aware timezone handling via IANA timezone names
- Locale-aware formatting via `Intl.DateTimeFormat` and `Intl.RelativeTimeFormat`
