import type { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { requestBackupRadar } from '../lib/transport.js';

export async function executeGetRetiredBackups(
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

  const retiredDateStart = ctx.getNodeParameter('SearchByRetiredDateStart', itemIndex, '') as string;
  const retiredDateEnd = ctx.getNodeParameter('SearchByRetiredDateEnd', itemIndex, '') as string;
  if (retiredDateStart && retiredDateStart.trim()) baseQs.SearchByRetiredDateStart = retiredDateStart;
  if (retiredDateEnd && retiredDateEnd.trim()) baseQs.SearchByRetiredDateEnd = retiredDateEnd;

  const returnAll = ctx.getNodeParameter('returnAll', itemIndex, true);
  if (returnAll) {
    const allResults: IDataObject[] = [];
    let currentPage = 1;
    let totalPages = 1;
    let totalCount = 0;

    do {
      const qs = { ...baseQs, Page: currentPage, Size: 1000 };
      const pageResponse = (await requestBackupRadar.call(ctx, 'GET', '/backups/retired', { qs })) as IDataObject;

      if (pageResponse && 'Results' in pageResponse && Array.isArray(pageResponse.Results)) {
        allResults.push(...(pageResponse.Results as IDataObject[]));
        totalPages = (pageResponse.TotalPages as number) || 1;
        if (currentPage === 1) {
          totalCount = (pageResponse.Total as number) || allResults.length;
        }
        currentPage++;
        if (currentPage <= totalPages) {
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      } else {
        break;
      }
    } while (currentPage <= totalPages);

    return { Total: totalCount, Page: 1, PageSize: allResults.length, TotalPages: 1, Results: allResults };
  }

  const limit = ctx.getNodeParameter('limit', itemIndex, 50);
  const qs = { ...baseQs, Page: 1, Size: limit };
  return requestBackupRadar.call(ctx, 'GET', '/backups/retired', { qs });
}
