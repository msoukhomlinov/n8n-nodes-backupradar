import type { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { requestBackupRadar } from '../lib/transport.js';
import {
  type DateRangeParams,
  resolveDateRange,
  chunkDateRange,
} from '../utils/dateRange.js';

function mergeBackupHistory(existing: IDataObject, incoming: IDataObject): IDataObject {
  const existingHistory = Array.isArray(existing.history) ? (existing.history as IDataObject[]) : [];
  const incomingHistory = Array.isArray(incoming.history) ? (incoming.history as IDataObject[]) : [];
  const historyByDate = new Map<unknown, IDataObject>();
  for (const entry of [...existingHistory, ...incomingHistory]) {
    historyByDate.set(entry.date, entry);
  }
  return { ...incoming, history: Array.from(historyByDate.values()) };
}

export async function executeGetBackups(
  ctx: IExecuteFunctions,
  itemIndex: number,
): Promise<IDataObject> {
  const baseQs: IDataObject = {};

  const searchOptions = ctx.getNodeParameter('searchOptions', itemIndex, {}) as IDataObject;
  for (const [key, value] of Object.entries(searchOptions)) {
    if (value !== undefined && value !== null && value !== '') {
      baseQs[key] = value;
    }
  }

  const filterOptions = ctx.getNodeParameter('filterOptions', itemIndex, {}) as IDataObject;
  const arrayFilters = [
    'backupMethods', 'companies', 'deviceTypes', 'excludeBackupMethods',
    'excludeDeviceTypes', 'excludeTags', 'policyTypes', 'statuses', 'tags',
  ];
  for (const key of arrayFilters) {
    if (Array.isArray(filterOptions[key]) && (filterOptions[key] as unknown[]).length > 0) {
      baseQs[key] = filterOptions[key];
    }
  }
  if (filterOptions.DaysWithoutSuccess !== undefined && filterOptions.DaysWithoutSuccess !== null) {
    baseQs.DaysWithoutSuccess = filterOptions.DaysWithoutSuccess;
  }
  if (filterOptions.FilterScheduled !== undefined) {
    baseQs.FilterScheduled = filterOptions.FilterScheduled;
  }
  if (
    typeof filterOptions.policyIds === 'string' &&
    filterOptions.policyIds.trim()
  ) {
    baseQs.policyIds = filterOptions.policyIds
      .split(',')
      .map((id: string) => id.trim())
      .filter((id: string) => id);
  }

  const dateRangeMode = ctx.getNodeParameter('dateRangeMode', itemIndex, 'preset') as string;
  const dateRangeParams: DateRangeParams = {};
  if (dateRangeMode === 'preset') {
    dateRangeParams.preset = ctx.getNodeParameter('presetRange', itemIndex, 'today') as string;
  } else if (dateRangeMode === 'daysBack') {
    dateRangeParams.daysBack = ctx.getNodeParameter('daysBack', itemIndex, 0) as number;
  } else {
    dateRangeParams.dateFrom = ctx.getNodeParameter('dateFrom', itemIndex, '') as string;
    const dateTo = ctx.getNodeParameter('dateTo', itemIndex, '') as string;
    if (dateTo) dateRangeParams.dateTo = dateTo;
  }
  const { startDate, endDate, totalDays } = resolveDateRange(dateRangeMode, dateRangeParams);
  const chunks = chunkDateRange(startDate, endDate, totalDays);

  const returnAll = ctx.getNodeParameter('returnAll', itemIndex, true);
  const limit: number | null = returnAll ? null : ctx.getNodeParameter('limit', itemIndex, 50);
  const pageSize = limit !== null ? Math.max(1, Math.min(limit, 1000)) : 1000;

  const deduped = new Map<unknown, IDataObject>();

  for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex++) {
    const chunk = chunks[chunkIndex];
    const chunkQs = { ...baseQs };
    if (chunk.date !== undefined) chunkQs.date = chunk.date;
    chunkQs.HistoryDays = chunk.historyDays;

    let currentPage = 1;
    let totalPages = 1;

    do {
      const qs = { ...chunkQs, Page: currentPage, Size: pageSize };
      const pageResponse = (await requestBackupRadar.call(ctx, 'GET', '/backups', { qs })) as IDataObject;

      if (pageResponse && 'Results' in pageResponse && Array.isArray(pageResponse.Results)) {
        for (const item of pageResponse.Results as IDataObject[]) {
          const id = item.backupId;
          if (id === undefined || id === null) continue;
          if (deduped.has(id)) {
            deduped.set(id, mergeBackupHistory(deduped.get(id)!, item));
          } else if (limit === null || deduped.size < limit) {
            deduped.set(id, item);
          }
        }
        totalPages = (pageResponse.TotalPages as number) || 1;
        currentPage++;
        // returnAll=false: stop paging once the limit is satisfied. History
        // from later pages of this chunk may be incomplete for IDs that happen
        // to fall on those pages, but the outer chunk loop still continues so
        // later chunks can merge history for IDs found on earlier pages.
        // Use returnAll=true for fully-merged history across all pages.
        if (limit !== null && deduped.size >= limit) break;
        if (currentPage <= totalPages) {
          await new Promise((resolve) => setTimeout(resolve, 150));
        }
      } else {
        break;
      }
    } while (currentPage <= totalPages);
  }

  const results = limit !== null
    ? Array.from(deduped.values()).slice(0, limit)
    : Array.from(deduped.values());

  return {
    Total: results.length,
    Page: 1,
    PageSize: results.length,
    TotalPages: 1,
    Results: results,
  };
}
