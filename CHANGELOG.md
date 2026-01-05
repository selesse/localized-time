# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
