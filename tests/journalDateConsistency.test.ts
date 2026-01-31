import { describe, it, expect, afterAll } from 'vitest';
import { parseLocalDate, toLocalDateString } from '../constants';

/**
 * Regression test for the journal date mismatch bug.
 *
 * A note with content starting "Photos from Day 1 of the trail." was submitted
 * on Inca Trail Day 1 and stored with date "2026-01-26". On devices in timezones
 * west of UTC (e.g. Lima, UTC-5) the old code used `new Date("2026-01-26")`
 * which creates UTC midnight — displayed locally as January 25, shifting the
 * entry to the wrong day. The fix uses parseLocalDate() which always creates
 * local midnight.
 */

const TRAIL_DAY_1_DATE = '2026-01-26';
const originalTZ = process.env.TZ;

afterAll(() => {
  // Restore the original timezone so other tests are unaffected
  if (originalTZ === undefined) {
    delete process.env.TZ;
  } else {
    process.env.TZ = originalTZ;
  }
});

/**
 * Helper: replicates the formatDateHeader logic from JournalView.tsx
 * (which is not exported) so we can verify end-to-end display output.
 */
const formatDateHeader = (dateStr: string): string => {
  const date = parseLocalDate(dateStr);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
};

describe('Journal date consistency — "Photos from Day 1 of the trail" (2026-01-26)', () => {
  describe('in America/Lima timezone (UTC-5)', () => {
    it('parseLocalDate produces January 26 local date', () => {
      process.env.TZ = 'America/Lima';
      const date = parseLocalDate(TRAIL_DAY_1_DATE);

      expect(date.getFullYear()).toBe(2026);
      expect(date.getMonth()).toBe(0); // January
      expect(date.getDate()).toBe(26);
    });

    it('formatDateHeader displays January 26, 2026', () => {
      process.env.TZ = 'America/Lima';
      const header = formatDateHeader(TRAIL_DAY_1_DATE);

      expect(header).toContain('January');
      expect(header).toContain('26');
      expect(header).toContain('2026');
    });

    it('round-trips through toLocalDateString', () => {
      process.env.TZ = 'America/Lima';
      expect(toLocalDateString(parseLocalDate(TRAIL_DAY_1_DATE))).toBe(TRAIL_DAY_1_DATE);
    });

    it('demonstrates the old bug: new Date(ISO string) shifts to Jan 25 in Lima', () => {
      process.env.TZ = 'America/Lima';
      // This is the OLD buggy code path: new Date("2026-01-26") = UTC midnight
      const buggyDate = new Date(TRAIL_DAY_1_DATE);

      // UTC components are correct
      expect(buggyDate.getUTCDate()).toBe(26);
      // But local date in Lima (UTC-5) shifts backward to Jan 25 at 19:00
      expect(buggyDate.getDate()).toBe(25); // THE BUG
      expect(buggyDate.getHours()).toBe(19);
    });
  });

  describe('in Australia/Brisbane timezone (UTC+10)', () => {
    it('parseLocalDate produces January 26 local date', () => {
      process.env.TZ = 'Australia/Brisbane';
      const date = parseLocalDate(TRAIL_DAY_1_DATE);

      expect(date.getFullYear()).toBe(2026);
      expect(date.getMonth()).toBe(0);
      expect(date.getDate()).toBe(26);
    });

    it('formatDateHeader displays January 26, 2026', () => {
      process.env.TZ = 'Australia/Brisbane';
      const header = formatDateHeader(TRAIL_DAY_1_DATE);

      expect(header).toContain('January');
      expect(header).toContain('26');
      expect(header).toContain('2026');
    });

    it('round-trips through toLocalDateString', () => {
      process.env.TZ = 'Australia/Brisbane';
      expect(toLocalDateString(parseLocalDate(TRAIL_DAY_1_DATE))).toBe(TRAIL_DAY_1_DATE);
    });
  });

  describe('in UTC timezone', () => {
    it('parseLocalDate produces January 26 local date', () => {
      process.env.TZ = 'UTC';
      const date = parseLocalDate(TRAIL_DAY_1_DATE);

      expect(date.getFullYear()).toBe(2026);
      expect(date.getMonth()).toBe(0);
      expect(date.getDate()).toBe(26);
    });

    it('round-trips through toLocalDateString', () => {
      process.env.TZ = 'UTC';
      expect(toLocalDateString(parseLocalDate(TRAIL_DAY_1_DATE))).toBe(TRAIL_DAY_1_DATE);
    });
  });

  describe('in America/Argentina/Buenos_Aires timezone (UTC-3)', () => {
    it('parseLocalDate produces January 26 local date', () => {
      process.env.TZ = 'America/Argentina/Buenos_Aires';
      const date = parseLocalDate(TRAIL_DAY_1_DATE);

      expect(date.getFullYear()).toBe(2026);
      expect(date.getMonth()).toBe(0);
      expect(date.getDate()).toBe(26);
    });

    it('round-trips through toLocalDateString', () => {
      process.env.TZ = 'America/Argentina/Buenos_Aires';
      expect(toLocalDateString(parseLocalDate(TRAIL_DAY_1_DATE))).toBe(TRAIL_DAY_1_DATE);
    });
  });
});
