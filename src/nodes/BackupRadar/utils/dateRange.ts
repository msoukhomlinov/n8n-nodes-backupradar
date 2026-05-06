export const DAY_MS = 24 * 60 * 60 * 1000;

export const PRESET_MAP: Record<string, number> = {
  today: 0,
  'last-1-day': 1,
  'last-2-days': 2,
  'last-3-days': 3,
  'last-4-days': 4,
  'last-5-days': 5,
  'last-6-days': 6,
  'last-7-days': 7,
  'last-8-days': 8,
  'last-9-days': 9,
  'last-10-days': 10,
  'last-11-days': 11,
  'last-12-days': 12,
  'last-13-days': 13,
  'last-14-days': 14,
  'last-15-days': 15,
  'last-16-days': 16,
  'last-17-days': 17,
  'last-18-days': 18,
  'last-19-days': 19,
  'last-20-days': 20,
  'last-21-days': 21,
  'last-22-days': 22,
  'last-23-days': 23,
  'last-24-days': 24,
  'last-25-days': 25,
  'last-26-days': 26,
  'last-27-days': 27,
  'last-28-days': 28,
  'last-29-days': 29,
  'last-30-days': 30,
  'last-31-days': 31,
  'last-45-days': 45,
  'last-60-days': 60,
  'last-90-days': 90,
};

export interface DateRangeParams {
  preset?: string;
  daysBack?: number;
  dateFrom?: string;
  dateTo?: string;
}

export interface DateRangeResult {
  startDate: Date | undefined;
  endDate: Date;
  totalDays: number;
}

export interface DateChunk {
  date: string | undefined;
  historyDays: number;
}

// Format a Date as YYYY-MM-DD using local time components.
function toLocalDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Compute calendar-day difference using UTC projections of local date components.
// Avoids DST skew that occurs when subtracting raw timestamps across a DST boundary.
function localDaysBetween(start: Date, end: Date): number {
  const a = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
  const b = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate());
  return Math.round((b - a) / DAY_MS);
}

// Advance a date by N calendar days without DST skew.
function addLocalDays(date: Date, days: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

// Extract the calendar Y-M-D from an ISO-8601 string before the T, then
// construct a local-midnight Date. Preserves the user's intended calendar
// date regardless of server timezone or any UTC offset in the ISO string.
function parseLocalDate(iso: string): Date {
  const datePart = iso.split('T')[0];
  const [year, month, day] = datePart.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function resolveDateRange(
  mode: string,
  params: DateRangeParams,
  now: Date = new Date(),
): DateRangeResult {
  if (mode === 'preset') {
    const days = PRESET_MAP[params.preset ?? 'today'] ?? 0;
    if (days <= 31) return { startDate: undefined, endDate: now, totalDays: days };
    const startDate = addLocalDays(now, -days);
    return { startDate, endDate: now, totalDays: days };
  }

  if (mode === 'daysBack') {
    const days = params.daysBack ?? 0;
    if (days <= 31) return { startDate: undefined, endDate: now, totalDays: days };
    const startDate = addLocalDays(now, -days);
    return { startDate, endDate: now, totalDays: days };
  }

  // dateRange
  if (!params.dateFrom) {
    throw new Error('dateFrom is required when dateRangeMode is "dateRange"');
  }
  const startDate = parseLocalDate(params.dateFrom);
  if (Number.isNaN(startDate.getTime())) {
    throw new Error(`Invalid dateFrom value: "${params.dateFrom}"`);
  }
  const endDate = params.dateTo ? parseLocalDate(params.dateTo) : now;
  if (localDaysBetween(startDate, endDate) < 0) {
    throw new Error('dateFrom must not be after dateTo');
  }
  const totalDays = localDaysBetween(startDate, endDate);
  return { startDate, endDate, totalDays };
}

// totalDays is authoritative only when startDate is undefined (preset/daysBack ≤ 31 day
// relative modes). When startDate is defined, chunks are computed entirely from
// startDate/endDate; totalDays is ignored beyond the undefined fast-path.
export function chunkDateRange(
  startDate: Date | undefined,
  endDate: Date,
  totalDays: number,
): DateChunk[] {
  if (startDate === undefined) {
    return [{ date: undefined, historyDays: totalDays }];
  }

  const chunks: DateChunk[] = [];
  let current = new Date(startDate);

  while (localDaysBetween(current, endDate) > 0) {
    const remainingDays = localDaysBetween(current, endDate);
    const historyDays = Math.min(remainingDays, 31);
    chunks.push({ date: toLocalDateString(current), historyDays });
    current = addLocalDays(current, historyDays);
  }

  return chunks.length > 0
    ? chunks
    : [{ date: toLocalDateString(startDate), historyDays: 0 }];
}
