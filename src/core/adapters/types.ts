/**
 * Adapter interface for time libraries
 * Implement this to support different time libraries (Temporal, Luxon, Day.js, etc.)
 */
export interface TimeAdapter<TDateTime = unknown> {
  /**
   * Parse an ISO timestamp string with timezone into the library's datetime type
   */
  parse(isoString: string): TDateTime;

  /**
   * Convert a datetime to a different timezone
   */
  toZone(dt: TDateTime, timezone: string): TDateTime;

  /**
   * Get the current viewer's timezone ID (e.g., "America/New_York")
   */
  getViewerTimezone(): string;

  /**
   * Get the timezone ID from a datetime
   */
  getTimezone(dt: TDateTime): string;

  /**
   * Get the UTC offset in hours for a datetime
   */
  getOffsetHours(dt: TDateTime): number;

  /**
   * Convert to epoch milliseconds (for Intl.DateTimeFormat compatibility)
   */
  toEpochMillis(dt: TDateTime): number;
}

/**
 * Result of a timezone conversion (library-agnostic)
 */
export interface ConversionResult<TDateTime = unknown> {
  localTime: TDateTime;
  originalTime: TDateTime;
  diffHours: number;
  viewerTimezone: string;
  originalTimezone: string;
}
