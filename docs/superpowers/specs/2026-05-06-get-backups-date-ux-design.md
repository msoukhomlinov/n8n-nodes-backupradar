# Get Backups — Date Range UX Design

**Date:** 2026-05-06

## Context

The `getBackups` operation exposes two raw API parameters — `HistoryDays` (int, 0–31) and `date` (datetime "from") — directly in the n8n UI. These overlap in purpose, have no labels that convey intent, and are capped at 31 days with no way to go further. This design replaces them with a user-friendly date range selector that also transparently stitches multiple API calls to support ranges beyond the API's 31-day ceiling.

## Scope

Affects `getBackups` operation only. No changes to other operations, credentials, transport, or auth.

## UX: Field Structure

Remove `HistoryDays` and `date` entirely. Replace with:

```
dateRangeMode  [options dropdown]
  "Preset"      (default)
  "Days Back"
  "Date Range"
```

**When mode = Preset:**
```
presetRange  [options dropdown]  default: "Today"
```

**When mode = Days Back:**
```
daysBack  [number]  min=0, no upper limit enforced by node
```

**When mode = Date Range:**
```
dateFrom  [dateTime]  required
dateTo    [dateTime]  default = workflow execution timestamp (today)
```

## Preset Values

35 total entries:

| Label | HistoryDays sent to API |
|-------|------------------------|
| Today | 0 |
| Last 1 Day | 1 |
| Last 2 Days | 2 |
| … (1-day steps) | … |
| Last 31 Days | 31 |
| Last 45 Days | chunked (see below) |
| Last 60 Days | chunked |
| Last 90 Days | chunked |

## Chunking Logic

Any range >31 days triggers multiple sequential API calls. Each chunk uses `date` (start of window, ISO date string) + `HistoryDays` (window size, max 31).

**Algorithm:**
1. Resolve `startDate` and `endDate` from the chosen mode/inputs
2. Walk forward from `startDate` in 31-day windows until `endDate`
3. Final window uses remaining days (may be <31)
4. Apply 500ms delay between chunk calls (existing rate limit)
5. Merge all `Results` arrays; deduplicate by backup `Id` — last occurrence wins (later chunk = more recent state)

**Example — Last 45 Days (today = 2026-05-06):**
- Chunk 1: `date=2026-03-22`, `HistoryDays=31`
- Chunk 2: `date=2026-04-22`, `HistoryDays=14`

**Example — Last 90 Days (today = 2026-05-06):**
- Chunk 1: `date=2026-02-05`, `HistoryDays=31`
- Chunk 2: `date=2026-03-08`, `HistoryDays=31`
- Chunk 3: `date=2026-04-08`, `HistoryDays=28`

**Single-call fast path:** ranges ≤31 days skip chunking entirely.
- Preset/Days Back ≤31: send `HistoryDays=N`, no `date` param
- Date Range ≤31 days: send `date=dateFrom`, `HistoryDays=daysBetween`

## Code Changes

### New file: `src/nodes/BackupRadar/utils/dateRange.ts`

Pure helper module — no n8n imports, fully unit-testable.

```ts
resolveDateRange(mode, params) → { startDate: Date, endDate: Date, totalDays: number }
chunkDateRange(startDate, endDate) → Array<{ date: string, historyDays: number }>
```

`resolveDateRange` handles:
- Preset → look up days value from preset map, compute startDate = today - N days
- Days Back → startDate = today - daysBack, endDate = today
- Date Range → use dateFrom/dateTo directly; dateTo defaults to now if omitted

`chunkDateRange` returns an ordered array of `{ date, historyDays }` pairs. Empty array when totalDays ≤ 31 (caller uses fast path instead).

### Modified: `src/nodes/BackupRadar/description/getBackups.operation.ts`

- Remove `HistoryDays` field definition
- Remove `date` field definition
- Add `dateRangeMode`, `presetRange`, `daysBack`, `dateFrom`, `dateTo` field definitions with correct `displayOptions.show` conditionals

### Modified: `src/nodes/BackupRadar/BackupRadar.node.ts` — `getBackups` case

Replace:
```ts
const historyDays = this.getNodeParameter('HistoryDays', itemIndex) as number;
const date = this.getNodeParameter('date', itemIndex, '') as string;
```

With:
```ts
const dateRangeMode = this.getNodeParameter('dateRangeMode', itemIndex) as string;
// ... read mode-specific params ...
const { startDate, endDate, totalDays } = resolveDateRange(dateRangeMode, modeParams);
const chunks = chunkDateRange(startDate, endDate);
```

Then either execute single call (totalDays ≤ 31) or loop over chunks, collecting and deduplicating results before handing off to existing pagination logic.

## Pagination Interaction

Chunking is a layer above pagination. Each chunk may itself be paginated (when `returnAll=true`). The existing page loop runs per chunk. Results from all pages of all chunks are merged before deduplication.

## Out of Scope

- Applying this pattern to `getBackup` or `getBackupResults` (they have a `date` field with different semantics)
- UI for other operations
- Changelog / docs updates
