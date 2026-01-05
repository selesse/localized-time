import { temporalAdapter } from "./adapters/temporal.js";
import type { ConversionResult, TimeAdapter } from "./adapters/types.js";

/**
 * Configurable engine that can work with different time libraries
 */
export class LocalizedTimeEngine<TDateTime = unknown> {
  constructor(private adapter: TimeAdapter<TDateTime>) {}

  /**
   * Convert a timestamp to the viewer's timezone
   */
  convert(from: string, viewerTz?: string): ConversionResult<TDateTime> {
    const originalTime = this.adapter.parse(from);
    const viewerTimezone = viewerTz || this.adapter.getViewerTimezone();
    const localTime = this.adapter.toZone(originalTime, viewerTimezone);

    const originalOffset = this.adapter.getOffsetHours(originalTime);
    const localOffset = this.adapter.getOffsetHours(localTime);
    const diffHours = localOffset - originalOffset;

    return {
      localTime,
      originalTime,
      diffHours,
      viewerTimezone,
      originalTimezone: this.adapter.getTimezone(originalTime),
    };
  }

  /**
   * Get epoch milliseconds for formatting with Intl.DateTimeFormat
   */
  toEpochMillis(dt: TDateTime): number {
    return this.adapter.toEpochMillis(dt);
  }

  /**
   * Get timezone ID from a datetime
   */
  getTimezone(dt: TDateTime): string {
    return this.adapter.getTimezone(dt);
  }
}

/**
 * Default engine using Temporal API
 */
export const defaultEngine = new LocalizedTimeEngine(temporalAdapter);

/**
 * Create a custom engine with a different time adapter
 */
export function createEngine<T>(adapter: TimeAdapter<T>): LocalizedTimeEngine<T> {
  return new LocalizedTimeEngine(adapter);
}
