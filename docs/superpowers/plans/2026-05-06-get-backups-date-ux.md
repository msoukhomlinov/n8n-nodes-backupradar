# Get Backups Date Range UX Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the raw `HistoryDays` + `date` fields on the `getBackups` operation with a user-friendly date range selector that supports presets, days-back input, and explicit date ranges — transparently chunking API calls to exceed the API's 31-day ceiling.

**Architecture:** A pure `dateRange.ts` helper resolves any date range mode into chunks of `{ date, historyDays }` pairs (≤31 days each). The node's `getBackups` execution loop iterates those chunks sequentially, merges results, deduplicates by `Id`, and enforces pagination limits on the total merged set.

**Tech Stack:** TypeScript 5.x, n8n-workflow INodeProperties, Vitest (new, for unit tests on pure helpers)

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Create | `src/nodes/BackupRadar/utils/dateRange.ts` | PRESET_MAP, types, `resolveDateRange`, `chunkDateRange` |
| Create | `src/nodes/BackupRadar/utils/dateRange.test.ts` | Unit tests for dateRange helpers |
| Modify | `src/nodes/BackupRadar/description/getBackups.operation.ts` | Replace `HistoryDays`+`date` fields with 5 new fields |
| Modify | `src/nodes/BackupRadar/BackupRadar.node.ts` | Replace date param reads with chunk-loop execution |
| Modify | `package.json` | Add Vitest devDep + test scripts; bump to 3.0.0 |
| Create | `vitest.config.ts` | Vitest config |

---

## Task 1: Install Vitest and configure test runner

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`

- [ ] **Step 1: Install Vitest**

```bash
npm install --save-dev vitest
```

Expected: `vitest` appears in `devDependencies` in `package.json`.

- [ ] **Step 2: Create vitest config**

Create `vitest.config.ts` at project root:

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
```

- [ ] **Step 3: Add test scripts to package.json**

In `package.json`, add to `"scripts"`:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 4: Verify Vitest runs (no tests yet)**

```bash
npm test
```

Expected output: `No test files found` or `0 tests passed` — no error exit code from missing files.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json vitest.config.ts
git commit -m "chore: add vitest test runner"
```

---

## Task 2: TDD — PRESET_MAP and types

**Files:**
- Create: `src/nodes/BackupRadar/utils/dateRange.ts`
- Create: `src/nodes/BackupRadar/utils/dateRange.test.ts`

- [ ] **Step 1: Write failing tests for PRESET_MAP**

Create `src/nodes/BackupRadar/utils/dateRange.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { PRESET_MAP } from './dateRange.js';

describe('PRESET_MAP', () => {
  it('contains 35 entries', () => {
    expect(Object.keys(PRESET_MAP).length).toBe(35);
  });
  it('today = 0', () => expect(PRESET_MAP['today']).toBe(0));
  it('last-1-day = 1', () => expect(PRESET_MAP['last-1-day']).toBe(1));
  it('last-31-days = 31', () => expect(PRESET_MAP['last-31-days']).toBe(31));
  it('last-45-days = 45', () => expect(PRESET_MAP['last-45-days']).toBe(45));
  it('last-60-days = 60', () => expect(PRESET_MAP['last-60-days']).toBe(60));
  it('last-90-days = 90', () => expect(PRESET_MAP['last-90-days']).toBe(90));
});
```

- [ ] **Step 2: Run tests — verify they fail**

```bash
npm test
```

Expected: `FAIL` — `Cannot find module './dateRange.js'`

- [ ] **Step 3: Create dateRange.ts with PRESET_MAP and types**

Create `src/nodes/BackupRadar/utils/dateRange.ts`:

```ts
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
```

- [ ] **Step 4: Run tests — verify PRESET_MAP tests pass**

```bash
npm test
```

Expected: 7 tests pass, 0 fail.

- [ ] **Step 5: Commit**

```bash
git add src/nodes/BackupRadar/utils/dateRange.ts src/nodes/BackupRadar/utils/dateRange.test.ts
git commit -m "feat: add dateRange types and PRESET_MAP (TDD)"
```

---

## Task 3: TDD — resolveDateRange

**Files:**
- Modify: `src/nodes/BackupRadar/utils/dateRange.test.ts` (add tests)
- Modify: `src/nodes/BackupRadar/utils/dateRange.ts` (add implementation)

- [ ] **Step 1: Add failing tests for resolveDateRange**

Append to `src/nodes/BackupRadar/utils/dateRange.test.ts`:

```ts
import { resolveDateRange } from './dateRange.js';

const NOW = new Date('2026-05-06T00:00:00.000Z');

describe('resolveDateRange — preset', () => {
  it('today → undefined startDate, totalDays 0', () => {
    const r = resolveDateRange('preset', { preset: 'today' }, NOW);
    expect(r.startDate).toBeUndefined();
    expect(r.totalDays).toBe(0);
    expect(r.endDate).toBe(NOW);
  });

  it('last-7-days → undefined startDate, totalDays 7', () => {
    const r = resolveDateRange('preset', { preset: 'last-7-days' }, NOW);
    expect(r.startDate).toBeUndefined();
    expect(r.totalDays).toBe(7);
  });

  it('last-31-days → undefined startDate, totalDays 31', () => {
    const r = resolveDateRange('preset', { preset: 'last-31-days' }, NOW);
    expect(r.startDate).toBeUndefined();
    expect(r.totalDays).toBe(31);
  });

  it('last-45-days → startDate 2026-03-22, totalDays 45', () => {
    const r = resolveDateRange('preset', { preset: 'last-45-days' }, NOW);
    expect(r.startDate).toBeDefined();
    expect(r.totalDays).toBe(45);
    expect(r.startDate!.toISOString().split('T')[0]).toBe('2026-03-22');
  });

  it('last-90-days → startDate 2026-02-05, totalDays 90', () => {
    const r = resolveDateRange('preset', { preset: 'last-90-days' }, NOW);
    expect(r.startDate).toBeDefined();
    expect(r.totalDays).toBe(90);
    expect(r.startDate!.toISOString().split('T')[0]).toBe('2026-02-05');
  });
});

describe('resolveDateRange — daysBack', () => {
  it('0 → undefined startDate, totalDays 0', () => {
    const r = resolveDateRange('daysBack', { daysBack: 0 }, NOW);
    expect(r.startDate).toBeUndefined();
    expect(r.totalDays).toBe(0);
  });

  it('14 → undefined startDate, totalDays 14', () => {
    const r = resolveDateRange('daysBack', { daysBack: 14 }, NOW);
    expect(r.startDate).toBeUndefined();
    expect(r.totalDays).toBe(14);
  });

  it('60 → startDate 2026-03-07, totalDays 60', () => {
    const r = resolveDateRange('daysBack', { daysBack: 60 }, NOW);
    expect(r.startDate).toBeDefined();
    expect(r.totalDays).toBe(60);
    expect(r.startDate!.toISOString().split('T')[0]).toBe('2026-03-07');
  });
});

describe('resolveDateRange — dateRange', () => {
  it('explicit from/to → correct totalDays', () => {
    const r = resolveDateRange('dateRange', { dateFrom: '2026-04-01', dateTo: '2026-05-01' }, NOW);
    expect(r.startDate!.toISOString().split('T')[0]).toBe('2026-04-01');
    expect(r.totalDays).toBe(30);
  });

  it('omitted dateTo defaults to now', () => {
    const r = resolveDateRange('dateRange', { dateFrom: '2026-04-06' }, NOW);
    expect(r.endDate).toBe(NOW);
    expect(r.totalDays).toBe(30);
  });

  it('same from/to → totalDays 0', () => {
    const r = resolveDateRange('dateRange', { dateFrom: '2026-05-06', dateTo: '2026-05-06' }, NOW);
    expect(r.totalDays).toBe(0);
  });
});
```

- [ ] **Step 2: Run tests — verify new tests fail**

```bash
npm test
```

Expected: new `resolveDateRange` tests fail — `resolveDateRange is not a function`.

- [ ] **Step 3: Implement resolveDateRange**

Add to `src/nodes/BackupRadar/utils/dateRange.ts`:

```ts
export function resolveDateRange(
  mode: string,
  params: DateRangeParams,
  now: Date = new Date(),
): DateRangeResult {
  if (mode === 'preset') {
    const days = PRESET_MAP[params.preset ?? 'today'] ?? 0;
    if (days <= 31) return { startDate: undefined, endDate: now, totalDays: days };
    return { startDate: new Date(now.getTime() - days * DAY_MS), endDate: now, totalDays: days };
  }

  if (mode === 'daysBack') {
    const days = params.daysBack ?? 0;
    if (days <= 31) return { startDate: undefined, endDate: now, totalDays: days };
    return { startDate: new Date(now.getTime() - days * DAY_MS), endDate: now, totalDays: days };
  }

  // dateRange
  const startDate = new Date(params.dateFrom!);
  const endDate = params.dateTo ? new Date(params.dateTo) : now;
  const totalDays = Math.max(0, Math.ceil((endDate.getTime() - startDate.getTime()) / DAY_MS));
  return { startDate, endDate, totalDays };
}
```

- [ ] **Step 4: Run tests — verify all pass**

```bash
npm test
```

Expected: all tests pass (PRESET_MAP tests + all resolveDateRange tests).

- [ ] **Step 5: Commit**

```bash
git add src/nodes/BackupRadar/utils/dateRange.ts src/nodes/BackupRadar/utils/dateRange.test.ts
git commit -m "feat: implement resolveDateRange (TDD)"
```

---

## Task 4: TDD — chunkDateRange

**Files:**
- Modify: `src/nodes/BackupRadar/utils/dateRange.test.ts` (add tests)
- Modify: `src/nodes/BackupRadar/utils/dateRange.ts` (add implementation)

- [ ] **Step 1: Add failing tests for chunkDateRange**

Append to `src/nodes/BackupRadar/utils/dateRange.test.ts`:

```ts
import { chunkDateRange } from './dateRange.js';

describe('chunkDateRange', () => {
  it('undefined startDate → single chunk, no date param', () => {
    const chunks = chunkDateRange(undefined, NOW, 7);
    expect(chunks).toHaveLength(1);
    expect(chunks[0]).toEqual({ date: undefined, historyDays: 7 });
  });

  it('undefined startDate, totalDays 0 → single chunk historyDays 0', () => {
    const chunks = chunkDateRange(undefined, NOW, 0);
    expect(chunks).toEqual([{ date: undefined, historyDays: 0 }]);
  });

  it('31-day date range → 1 chunk', () => {
    const start = new Date('2026-04-05T00:00:00.000Z');
    const end = new Date('2026-05-06T00:00:00.000Z');
    const chunks = chunkDateRange(start, end, 31);
    expect(chunks).toHaveLength(1);
    expect(chunks[0]).toEqual({ date: '2026-04-05', historyDays: 31 });
  });

  it('45-day range → 2 chunks', () => {
    const start = new Date('2026-03-22T00:00:00.000Z');
    const end = new Date('2026-05-06T00:00:00.000Z');
    const chunks = chunkDateRange(start, end, 45);
    expect(chunks).toHaveLength(2);
    expect(chunks[0]).toEqual({ date: '2026-03-22', historyDays: 31 });
    expect(chunks[1]).toEqual({ date: '2026-04-22', historyDays: 14 });
  });

  it('90-day range → 3 chunks', () => {
    const start = new Date('2026-02-05T00:00:00.000Z');
    const end = new Date('2026-05-06T00:00:00.000Z');
    const chunks = chunkDateRange(start, end, 90);
    expect(chunks).toHaveLength(3);
    expect(chunks[0]).toEqual({ date: '2026-02-05', historyDays: 31 });
    expect(chunks[1]).toEqual({ date: '2026-03-08', historyDays: 31 });
    expect(chunks[2]).toEqual({ date: '2026-04-08', historyDays: 28 });
  });

  it('same start/end → single chunk historyDays 0', () => {
    const d = new Date('2026-05-06T00:00:00.000Z');
    const chunks = chunkDateRange(d, d, 0);
    expect(chunks).toEqual([{ date: '2026-05-06', historyDays: 0 }]);
  });
});
```

- [ ] **Step 2: Run tests — verify new tests fail**

```bash
npm test
```

Expected: `chunkDateRange` tests fail — `chunkDateRange is not a function`.

- [ ] **Step 3: Implement chunkDateRange**

Add to `src/nodes/BackupRadar/utils/dateRange.ts`:

```ts
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

  while (current < endDate) {
    const remainingDays = Math.ceil((endDate.getTime() - current.getTime()) / DAY_MS);
    const historyDays = Math.min(remainingDays, 31);
    chunks.push({ date: current.toISOString().split('T')[0], historyDays });
    current = new Date(current.getTime() + historyDays * DAY_MS);
  }

  return chunks.length > 0
    ? chunks
    : [{ date: startDate.toISOString().split('T')[0], historyDays: 0 }];
}
```

- [ ] **Step 4: Run tests — verify all pass**

```bash
npm test
```

Expected: all tests pass (PRESET_MAP + resolveDateRange + chunkDateRange).

- [ ] **Step 5: Commit**

```bash
git add src/nodes/BackupRadar/utils/dateRange.ts src/nodes/BackupRadar/utils/dateRange.test.ts
git commit -m "feat: implement chunkDateRange (TDD)"
```

---

## Task 5: Update getBackups.operation.ts — new date range fields

**Files:**
- Modify: `src/nodes/BackupRadar/description/getBackups.operation.ts`

- [ ] **Step 1: Replace HistoryDays and date fields with date range fields**

In `src/nodes/BackupRadar/description/getBackups.operation.ts`, delete the two existing field definitions (lines 224–252 — the `HistoryDays` and `date` objects) and replace with:

```ts
  {
    displayName: 'Date Range Mode',
    name: 'dateRangeMode',
    type: 'options',
    default: 'preset',
    description: 'How to specify the date range for backup history',
    options: [
      { name: 'Preset', value: 'preset' },
      { name: 'Days Back', value: 'daysBack' },
      { name: 'Date Range', value: 'dateRange' },
    ],
    displayOptions: {
      show: { operation: ['getBackups'] },
    },
  },
  {
    displayName: 'Preset Range',
    name: 'presetRange',
    type: 'options',
    default: 'today',
    options: [
      { name: 'Today', value: 'today' },
      { name: 'Last 1 Day', value: 'last-1-day' },
      { name: 'Last 2 Days', value: 'last-2-days' },
      { name: 'Last 3 Days', value: 'last-3-days' },
      { name: 'Last 4 Days', value: 'last-4-days' },
      { name: 'Last 5 Days', value: 'last-5-days' },
      { name: 'Last 6 Days', value: 'last-6-days' },
      { name: 'Last 7 Days', value: 'last-7-days' },
      { name: 'Last 8 Days', value: 'last-8-days' },
      { name: 'Last 9 Days', value: 'last-9-days' },
      { name: 'Last 10 Days', value: 'last-10-days' },
      { name: 'Last 11 Days', value: 'last-11-days' },
      { name: 'Last 12 Days', value: 'last-12-days' },
      { name: 'Last 13 Days', value: 'last-13-days' },
      { name: 'Last 14 Days', value: 'last-14-days' },
      { name: 'Last 15 Days', value: 'last-15-days' },
      { name: 'Last 16 Days', value: 'last-16-days' },
      { name: 'Last 17 Days', value: 'last-17-days' },
      { name: 'Last 18 Days', value: 'last-18-days' },
      { name: 'Last 19 Days', value: 'last-19-days' },
      { name: 'Last 20 Days', value: 'last-20-days' },
      { name: 'Last 21 Days', value: 'last-21-days' },
      { name: 'Last 22 Days', value: 'last-22-days' },
      { name: 'Last 23 Days', value: 'last-23-days' },
      { name: 'Last 24 Days', value: 'last-24-days' },
      { name: 'Last 25 Days', value: 'last-25-days' },
      { name: 'Last 26 Days', value: 'last-26-days' },
      { name: 'Last 27 Days', value: 'last-27-days' },
      { name: 'Last 28 Days', value: 'last-28-days' },
      { name: 'Last 29 Days', value: 'last-29-days' },
      { name: 'Last 30 Days', value: 'last-30-days' },
      { name: 'Last 31 Days', value: 'last-31-days' },
      { name: 'Last 45 Days', value: 'last-45-days' },
      { name: 'Last 60 Days', value: 'last-60-days' },
      { name: 'Last 90 Days', value: 'last-90-days' },
    ],
    displayOptions: {
      show: { operation: ['getBackups'], dateRangeMode: ['preset'] },
    },
  },
  {
    displayName: 'Days Back',
    name: 'daysBack',
    type: 'number',
    default: 7,
    description: 'Number of days back from today to retrieve backup history',
    typeOptions: { minValue: 0 },
    displayOptions: {
      show: { operation: ['getBackups'], dateRangeMode: ['daysBack'] },
    },
  },
  {
    displayName: 'Date From',
    name: 'dateFrom',
    type: 'dateTime',
    default: '',
    description: 'Start date for backup history range',
    displayOptions: {
      show: { operation: ['getBackups'], dateRangeMode: ['dateRange'] },
    },
  },
  {
    displayName: 'Date To',
    name: 'dateTo',
    type: 'dateTime',
    default: '',
    description: 'End date for backup history range. Defaults to today if left empty.',
    displayOptions: {
      show: { operation: ['getBackups'], dateRangeMode: ['dateRange'] },
    },
  },
```

- [ ] **Step 2: Typecheck**

```bash
npm run typecheck
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/nodes/BackupRadar/description/getBackups.operation.ts
git commit -m "feat: replace HistoryDays/date fields with date range UX fields"
```

---

## Task 6: Update BackupRadar.node.ts — chunk-loop execution

**Files:**
- Modify: `src/nodes/BackupRadar/BackupRadar.node.ts`

- [ ] **Step 1: Add import for dateRange helpers**

At the top of `src/nodes/BackupRadar/BackupRadar.node.ts`, add after the existing imports:

```ts
import {
  type DateRangeParams,
  resolveDateRange,
  chunkDateRange,
} from './utils/dateRange.js';
```

- [ ] **Step 2: Replace the getBackups date/history block with chunk-loop logic**

Inside the `case 'getBackups':` block, find and remove these lines (currently after the filter options block, before the pagination block):

```ts
// History and date
const historyDays = this.getNodeParameter('HistoryDays', itemIndex) as number;
if (historyDays !== undefined && historyDays !== null) baseQs.HistoryDays = historyDays;

const date = this.getNodeParameter('date', itemIndex, '') as string;
if (date && date.trim()) baseQs.date = date;
```

Replace with this date range resolution block:

```ts
// Date range
const dateRangeMode = this.getNodeParameter('dateRangeMode', itemIndex, 'preset') as string;
const dateRangeParams: DateRangeParams = {};
if (dateRangeMode === 'preset') {
  dateRangeParams.preset = this.getNodeParameter('presetRange', itemIndex, 'today') as string;
} else if (dateRangeMode === 'daysBack') {
  dateRangeParams.daysBack = this.getNodeParameter('daysBack', itemIndex, 0) as number;
} else {
  dateRangeParams.dateFrom = this.getNodeParameter('dateFrom', itemIndex, '') as string;
  const dateTo = this.getNodeParameter('dateTo', itemIndex, '') as string;
  if (dateTo) dateRangeParams.dateTo = dateTo;
}
const { startDate, endDate, totalDays } = resolveDateRange(dateRangeMode, dateRangeParams);
const chunks = chunkDateRange(startDate, endDate, totalDays);
```

- [ ] **Step 3: Replace the pagination block with the chunk-loop**

Find and replace the entire `// Pagination` section (from `const returnAll = ...` to the end of the `getBackups` case's `break`) with:

```ts
// Pagination with chunk iteration
const returnAll = this.getNodeParameter('returnAll', itemIndex, true);

if (returnAll) {
  const allResults: IDataObject[] = [];

  for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex++) {
    const chunk = chunks[chunkIndex];
    const chunkQs = { ...baseQs };
    if (chunk.date !== undefined) chunkQs.date = chunk.date;
    chunkQs.HistoryDays = chunk.historyDays;

    let currentPage = 1;
    let totalPages = 1;

    do {
      const qs = { ...chunkQs, Page: currentPage, Size: 1000 };
      const pageResponse = (await requestBackupRadar.call(this, 'GET', '/backups', {
        qs,
      })) as IDataObject;

      if (pageResponse && 'Results' in pageResponse && Array.isArray(pageResponse.Results)) {
        allResults.push(...(pageResponse.Results as IDataObject[]));
        totalPages = (pageResponse.TotalPages as number) || 1;
        currentPage++;
        if (currentPage <= totalPages) {
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      } else {
        break;
      }
    } while (currentPage <= totalPages);

    if (chunkIndex < chunks.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  const deduped = new Map<unknown, IDataObject>();
  for (const item of allResults) {
    deduped.set(item.Id, item);
  }
  const results = Array.from(deduped.values());

  response = {
    Total: results.length,
    Page: 1,
    PageSize: results.length,
    TotalPages: 1,
    Results: results,
  };
} else {
  const limit = this.getNodeParameter('limit', itemIndex, 50) as number;
  const allResults: IDataObject[] = [];

  for (let chunkIndex = 0; chunkIndex < chunks.length && allResults.length < limit; chunkIndex++) {
    const chunk = chunks[chunkIndex];
    const chunkQs = { ...baseQs };
    if (chunk.date !== undefined) chunkQs.date = chunk.date;
    chunkQs.HistoryDays = chunk.historyDays;

    let currentPage = 1;
    let totalPages = 1;

    do {
      const remaining = limit - allResults.length;
      const qs = { ...chunkQs, Page: currentPage, Size: Math.min(remaining, 1000) };
      const pageResponse = (await requestBackupRadar.call(this, 'GET', '/backups', {
        qs,
      })) as IDataObject;

      if (pageResponse && 'Results' in pageResponse && Array.isArray(pageResponse.Results)) {
        allResults.push(...(pageResponse.Results as IDataObject[]));
        totalPages = (pageResponse.TotalPages as number) || 1;
        currentPage++;
        if (allResults.length >= limit) break;
        if (currentPage <= totalPages) {
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      } else {
        break;
      }
    } while (currentPage <= totalPages);

    if (chunkIndex < chunks.length - 1 && allResults.length < limit) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  const deduped = new Map<unknown, IDataObject>();
  for (const item of allResults) {
    deduped.set(item.Id, item);
  }
  const results = Array.from(deduped.values()).slice(0, limit);

  response = {
    Total: results.length,
    Page: 1,
    PageSize: results.length,
    TotalPages: 1,
    Results: results,
  };
}
```

- [ ] **Step 4: Typecheck**

```bash
npm run typecheck
```

Expected: no errors.

- [ ] **Step 5: Run tests**

```bash
npm test
```

Expected: all unit tests still pass.

- [ ] **Step 6: Commit**

```bash
git add src/nodes/BackupRadar/BackupRadar.node.ts
git commit -m "feat: replace HistoryDays/date execution logic with date range chunk-loop"
```

---

## Task 7: Build verification and version bump

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Full build**

```bash
npm run build
```

Expected: `dist/` populated, no TypeScript errors, no missing icons.

- [ ] **Step 2: Bump version to 3.0.0**

In `package.json`, change `"version": "2.0.0"` to `"version": "3.0.0"`.

This is a breaking change: existing workflows using the `HistoryDays` or `date` node parameters will need to be updated.

- [ ] **Step 3: Rebuild after version bump**

```bash
npm run build
```

Expected: clean build.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: bump version to 3.0.0 (breaking: replace HistoryDays/date with date range UX)"
```

---

## Self-Review

**Spec coverage check:**

| Spec requirement | Task |
|---|---|
| Remove `HistoryDays` + `date` fields | Task 5 |
| `dateRangeMode` dropdown (Preset/Days Back/Date Range) | Task 5 |
| 35 preset options with correct labels/values | Task 5 |
| `presetRange` shows when mode=preset | Task 5 |
| `daysBack` shows when mode=daysBack | Task 5 |
| `dateFrom` + `dateTo` show when mode=dateRange | Task 5 |
| `dateTo` defaults to today | Task 6 (resolveDateRange) |
| `chunkDateRange` always returns ≥1 chunk | Task 4 |
| ≤31 days → no `date` param (undefined) | Tasks 3, 4 |
| >31 days → absolute dates, chunked calls | Tasks 3, 4, 6 |
| 500ms delay between chunks | Task 6 |
| Dedup by `Id`, last wins | Task 6 |
| `returnAll=false` → total limit, oldest-first | Task 6 |
| Version bump (breaking) | Task 7 |

**Placeholder scan:** None found. All code blocks are complete.

**Type consistency:** `DateRangeParams`, `DateRangeResult`, `DateChunk` defined in Task 2; used consistently in Tasks 3, 4, 6. `resolveDateRange` and `chunkDateRange` signatures match across tasks.
