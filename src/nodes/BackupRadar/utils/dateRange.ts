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
