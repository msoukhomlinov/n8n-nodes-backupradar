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
2. `chunkDateRange(startDate, endDate)` returns an ordered array of `{ date, historyDays }` pairs — always ≥1 chunk, even for ≤31-day ranges
3. Execute chunks sequentially oldest-first; apply 500ms delay between calls (existing rate limit)
4. Merge all `Results` arrays; deduplicate by backup `Id` — last occurrence wins (later chunk = more recent state)

**Chunk boundaries:** Adjacent chunks share a boundary date — the end date of chunk N equals the start date of chunk N+1. This means a backup on the boundary date may appear in both chunks' raw results. Deduplication (step 4) handles this correctly.

**Example — Last 45 Days (today = 2026-05-06):**
- Chunk 1: `date=2026-03-22`, `HistoryDays=31` → covers 2026-03-22 to 2026-04-22
- Chunk 2: `date=2026-04-22`, `HistoryDays=14` → covers 2026-04-22 to 2026-05-06

**Example — Last 90 Days (today = 2026-05-06):**
- Chunk 1: `date=2026-02-05`, `HistoryDays=31` → covers 2026-02-05 to 2026-03-08
- Chunk 2: `date=2026-03-08`, `HistoryDays=31` → covers 2026-03-08 to 2026-04-08
- Chunk 3: `date=2026-04-08`, `HistoryDays=28` → covers 2026-04-08 to 2026-05-06

**Single-chunk fast path (≤31 days):** `chunkDateRange` still returns one entry; the same loop executes it — no special-case branch needed.
- Preset/Days Back ≤31: `{ date: undefined, historyDays: N }` → no `date` param sent to API
- Date Range ≤31 days: `{ date: dateFrom, historyDays: daysBetween }`

## Code Changes

### New file: `src/nodes/BackupRadar/utils/dateRange.ts`

Pure helper module — no n8n imports, fully unit-testable.

```ts
resolveDateRange(mode, params) → { startDate: Date, endDate: Date, totalDays: number }
chunkDateRange(startDate: Date | undefined, endDate: Date, totalDays: number) → Array<{ date: string | undefined, historyDays: number }>
```

`resolveDateRange` handles:
- Preset → look up days value from preset map, compute startDate = today - N days
- Days Back → startDate = today - daysBack, endDate = today
- Date Range → use dateFrom/dateTo directly; dateTo defaults to now if omitted

`chunkDateRange` always returns ≥1 chunk. For Preset/Days Back modes, `startDate` is `undefined` and chunks with no `date` field omit it from the API call (relative to today). For Date Range mode, `startDate` is always set.

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

**`returnAll=false` + chunked range:** The `limit` applies to the **total merged result**, not per chunk. Chunks execute oldest-first; collection stops as soon as the total accumulated record count reaches `limit`. Partial chunks are discarded once the limit is met. Result: user gets the oldest N records within the selected range.

## Out of Scope

- Applying this pattern to `getBackup` or `getBackupResults` (they have a `date` field with different semantics)
- UI for other operations
- Changelog / docs updates
