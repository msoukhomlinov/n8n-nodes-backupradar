import type {
  IDataObject,
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
} from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';
import { backupRadarNodeProperties } from './index.js';
import * as loadOptions from './utils/loadOptions/index.js';
import { requestBackupRadar } from './lib/transport.js';

export class BackupRadar implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Backup Radar',
    name: 'backupradar',
    group: ['transform'],
    version: 1,
    description: 'BackupRadar v2 API integration for n8n',
    defaults: {
      name: 'Backup Radar',
    },
    inputs: ['main'],
    outputs: ['main'],
    icon: 'file:./backupradar.svg',
    usableAsTool: true,
    credentials: [
      {
        name: 'backupRadarApi',
        required: true,
      },
    ],
    properties: backupRadarNodeProperties,
  };

  methods = {
    loadOptions: {
      getCompanies: loadOptions.getCompanies,
      getTags: loadOptions.getTags,
      getStatuses: loadOptions.getStatuses,
      getBackupMethods: loadOptions.getBackupMethods,
      getDeviceTypes: loadOptions.getDeviceTypes,
      getPolicyTypes: loadOptions.getPolicyTypes,
    },
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];

    for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
      try {
        const operation = this.getNodeParameter('operation', itemIndex);
        let response: IDataObject;

        switch (operation) {
          case 'getBackups': {
            const baseQs: IDataObject = {};

            // Search options - only include non-empty strings
            const searchOptions = this.getNodeParameter(
              'searchOptions',
              itemIndex,
              {},
            ) as IDataObject;
            for (const [key, value] of Object.entries(searchOptions)) {
              if (value !== undefined && value !== null && value !== '') {
                baseQs[key] = value;
              }
            }

            // Filter options
            const filterOptions = this.getNodeParameter(
              'filterOptions',
              itemIndex,
              {},
            ) as IDataObject;
            if (
              filterOptions.backupMethods &&
              Array.isArray(filterOptions.backupMethods) &&
              filterOptions.backupMethods.length > 0
            ) {
              baseQs.backupMethods = filterOptions.backupMethods;
            }
            if (
              filterOptions.companies &&
              Array.isArray(filterOptions.companies) &&
              filterOptions.companies.length > 0
            ) {
              baseQs.companies = filterOptions.companies;
            }
            if (
              filterOptions.DaysWithoutSuccess !== undefined &&
              filterOptions.DaysWithoutSuccess !== null
            ) {
              baseQs.DaysWithoutSuccess = filterOptions.DaysWithoutSuccess;
            }
            if (
              filterOptions.deviceTypes &&
              Array.isArray(filterOptions.deviceTypes) &&
              filterOptions.deviceTypes.length > 0
            ) {
              baseQs.deviceTypes = filterOptions.deviceTypes;
            }
            if (
              filterOptions.excludeBackupMethods &&
              Array.isArray(filterOptions.excludeBackupMethods) &&
              filterOptions.excludeBackupMethods.length > 0
            ) {
              baseQs.excludeBackupMethods = filterOptions.excludeBackupMethods;
            }
            if (
              filterOptions.excludeDeviceTypes &&
              Array.isArray(filterOptions.excludeDeviceTypes) &&
              filterOptions.excludeDeviceTypes.length > 0
            ) {
              baseQs.excludeDeviceTypes = filterOptions.excludeDeviceTypes;
            }
            if (
              filterOptions.excludeTags &&
              Array.isArray(filterOptions.excludeTags) &&
              filterOptions.excludeTags.length > 0
            ) {
              baseQs.excludeTags = filterOptions.excludeTags;
            }
            if (filterOptions.FilterScheduled !== undefined) {
              baseQs.FilterScheduled = filterOptions.FilterScheduled;
            }
            if (
              filterOptions.policyIds &&
              typeof filterOptions.policyIds === 'string' &&
              filterOptions.policyIds.trim()
            ) {
              baseQs.policyIds = filterOptions.policyIds
                .split(',')
                .map((id: string) => id.trim())
                .filter((id: string) => id);
            }
            if (
              filterOptions.policyTypes &&
              Array.isArray(filterOptions.policyTypes) &&
              filterOptions.policyTypes.length > 0
            ) {
              baseQs.policyTypes = filterOptions.policyTypes;
            }
            if (
              filterOptions.statuses &&
              Array.isArray(filterOptions.statuses) &&
              filterOptions.statuses.length > 0
            ) {
              baseQs.statuses = filterOptions.statuses;
            }
            if (
              filterOptions.tags &&
              Array.isArray(filterOptions.tags) &&
              filterOptions.tags.length > 0
            ) {
              baseQs.tags = filterOptions.tags;
            }

            // History and date
            const historyDays = this.getNodeParameter('HistoryDays', itemIndex) as number;
            if (historyDays !== undefined && historyDays !== null) baseQs.HistoryDays = historyDays;

            const date = this.getNodeParameter('date', itemIndex, '') as string;
            if (date && date.trim()) baseQs.date = date;

            // Pagination
            const returnAll = this.getNodeParameter('returnAll', itemIndex, true);
            if (returnAll) {
              // Fetch all pages
              const allResults: IDataObject[] = [];
              let currentPage = 1;
              const pageSize = 1000; // Max page size for efficiency
              let totalPages = 1;
              let totalCount = 0;

              do {
                const qs = { ...baseQs, Page: currentPage, Size: pageSize };
                const pageResponse = (await requestBackupRadar.call(this, 'GET', '/backups', {
                  qs,
                })) as IDataObject;

                if (
                  pageResponse &&
                  'Results' in pageResponse &&
                  Array.isArray(pageResponse.Results)
                ) {
                  allResults.push(...(pageResponse.Results as IDataObject[]));
                  totalPages = (pageResponse.TotalPages as number) || 1;
                  if (currentPage === 1) {
                    totalCount = (pageResponse.Total as number) || allResults.length;
                  }
                  currentPage++;

                  // Respect API rate limiting: 1 request per 0.5 seconds
                  if (currentPage <= totalPages) {
                    await new Promise((resolve) => setTimeout(resolve, 500));
                  }
                } else {
                  break;
                }
              } while (currentPage <= totalPages);

              // Create a response object with all results
              response = {
                Total: totalCount,
                Page: 1,
                PageSize: allResults.length,
                TotalPages: 1,
                Results: allResults,
              };
            } else {
              // Fetch single page
              const limit = this.getNodeParameter('limit', itemIndex, 50);
              const qs = { ...baseQs, Page: 1, Size: limit };
              response = await requestBackupRadar.call(this, 'GET', '/backups', { qs });
            }
            break;
          }

          case 'getBackupsBrightGauge': {
            const baseQs: IDataObject = {};
            const date = this.getNodeParameter('date', itemIndex, '') as string;
            const days = this.getNodeParameter('days', itemIndex) as number;
            const includeResults = this.getNodeParameter('includeResults', itemIndex) as boolean;
            const includeHistoryDetails = this.getNodeParameter(
              'includeHistoryDetails',
              itemIndex,
            ) as boolean;

            if (date && date.trim()) baseQs.date = date;
            if (days !== undefined && days > 0) baseQs.days = days;
            if (includeResults !== undefined) baseQs.includeResults = includeResults;
            if (includeHistoryDetails !== undefined)
              baseQs.includeHistoryDetails = includeHistoryDetails;

            // Pagination
            const returnAll = this.getNodeParameter('returnAll', itemIndex, true);
            if (returnAll) {
              // Fetch all pages
              const allResults: IDataObject[] = [];
              let currentPage = 1;
              const pageSize = 1000; // Max page size for efficiency
              let totalPages = 1;
              let totalCount = 0;

              do {
                const qs = { ...baseQs, Page: currentPage, Size: pageSize };
                const pageResponse = (await requestBackupRadar.call(this, 'GET', '/backups/bg', {
                  qs,
                })) as IDataObject;

                if (
                  pageResponse &&
                  'Results' in pageResponse &&
                  Array.isArray(pageResponse.Results)
                ) {
                  allResults.push(...(pageResponse.Results as IDataObject[]));
                  totalPages = (pageResponse.TotalPages as number) || 1;
                  if (currentPage === 1) {
                    totalCount = (pageResponse.Total as number) || allResults.length;
                  }
                  currentPage++;

                  // Respect API rate limiting: 1 request per 0.5 seconds
                  if (currentPage <= totalPages) {
                    await new Promise((resolve) => setTimeout(resolve, 500));
                  }
                } else {
                  break;
                }
              } while (currentPage <= totalPages);

              // Create a response object with all results
              response = {
                Total: totalCount,
                Page: 1,
                PageSize: allResults.length,
                TotalPages: 1,
                Results: allResults,
              };
            } else {
              // Fetch single page
              const limit = this.getNodeParameter('limit', itemIndex, 50);
              const qs = { ...baseQs, Page: 1, Size: limit };
              response = await requestBackupRadar.call(this, 'GET', '/backups/bg', { qs });
            }
            break;
          }

          case 'getBackup': {
            const backupId = this.getNodeParameter('backupId', itemIndex) as number;
            const qs: IDataObject = {};
            const date = this.getNodeParameter('date', itemIndex, '') as string;
            if (date && date.trim()) qs.date = date;

            response = await requestBackupRadar.call(this, 'GET', `/backups/${backupId}`, { qs });
            break;
          }

          case 'getBackupResults': {
            const backupId = this.getNodeParameter('backupId', itemIndex) as number;
            const qs: IDataObject = {};
            const date = this.getNodeParameter('date', itemIndex, '') as string;
            if (date && date.trim()) qs.date = date;

            response = await requestBackupRadar.call(this, 'GET', `/backups/${backupId}/results`, {
              qs,
            });
            break;
          }

          case 'getFilters': {
            response = await requestBackupRadar.call(this, 'GET', '/backups/filters');
            break;
          }

          case 'getInactiveBackups': {
            const baseQs: IDataObject = {};
            const searchOptions = this.getNodeParameter(
              'searchOptions',
              itemIndex,
              {},
            ) as IDataObject;
            // Only include non-empty string values
            for (const [key, value] of Object.entries(searchOptions)) {
              if (value !== undefined && value !== null && value !== '') {
                baseQs[key] = value;
              }
            }

            // Pagination
            const returnAll = this.getNodeParameter('returnAll', itemIndex, true);
            if (returnAll) {
              // Fetch all pages
              const allResults: IDataObject[] = [];
              let currentPage = 1;
              const pageSize = 1000; // Max page size for efficiency
              let totalPages = 1;
              let totalCount = 0;

              do {
                const qs = { ...baseQs, Page: currentPage, Size: pageSize };
                const pageResponse = (await requestBackupRadar.call(
                  this,
                  'GET',
                  '/backups/inactive',
                  { qs },
                )) as IDataObject;

                if (
                  pageResponse &&
                  'Results' in pageResponse &&
                  Array.isArray(pageResponse.Results)
                ) {
                  allResults.push(...(pageResponse.Results as IDataObject[]));
                  totalPages = (pageResponse.TotalPages as number) || 1;
                  if (currentPage === 1) {
                    totalCount = (pageResponse.Total as number) || allResults.length;
                  }
                  currentPage++;

                  // Respect API rate limiting: 1 request per 0.5 seconds
                  if (currentPage <= totalPages) {
                    await new Promise((resolve) => setTimeout(resolve, 500));
                  }
                } else {
                  break;
                }
              } while (currentPage <= totalPages);

              // Create a response object with all results
              response = {
                Total: totalCount,
                Page: 1,
                PageSize: allResults.length,
                TotalPages: 1,
                Results: allResults,
              };
            } else {
              // Fetch single page
              const limit = this.getNodeParameter('limit', itemIndex, 50);
              const qs = { ...baseQs, Page: 1, Size: limit };
              response = await requestBackupRadar.call(this, 'GET', '/backups/inactive', { qs });
            }
            break;
          }

          case 'getRetiredBackups': {
            const baseQs: IDataObject = {};
            const searchOptions = this.getNodeParameter(
              'searchOptions',
              itemIndex,
              {},
            ) as IDataObject;
            // Only include non-empty string values
            for (const [key, value] of Object.entries(searchOptions)) {
              if (value !== undefined && value !== null && value !== '') {
                baseQs[key] = value;
              }
            }

            const retiredDateStart = this.getNodeParameter(
              'SearchByRetiredDateStart',
              itemIndex,
              '',
            ) as string;
            const retiredDateEnd = this.getNodeParameter(
              'SearchByRetiredDateEnd',
              itemIndex,
              '',
            ) as string;
            if (retiredDateStart && retiredDateStart.trim())
              baseQs.SearchByRetiredDateStart = retiredDateStart;
            if (retiredDateEnd && retiredDateEnd.trim())
              baseQs.SearchByRetiredDateEnd = retiredDateEnd;

            // Pagination
            const returnAll = this.getNodeParameter('returnAll', itemIndex, true);
            if (returnAll) {
              // Fetch all pages
              const allResults: IDataObject[] = [];
              let currentPage = 1;
              const pageSize = 1000; // Max page size for efficiency
              let totalPages = 1;
              let totalCount = 0;

              do {
                const qs = { ...baseQs, Page: currentPage, Size: pageSize };
                const pageResponse = (await requestBackupRadar.call(
                  this,
                  'GET',
                  '/backups/retired',
                  { qs },
                )) as IDataObject;

                if (
                  pageResponse &&
                  'Results' in pageResponse &&
                  Array.isArray(pageResponse.Results)
                ) {
                  allResults.push(...(pageResponse.Results as IDataObject[]));
                  totalPages = (pageResponse.TotalPages as number) || 1;
                  if (currentPage === 1) {
                    totalCount = (pageResponse.Total as number) || allResults.length;
                  }
                  currentPage++;

                  // Respect API rate limiting: 1 request per 0.5 seconds
                  if (currentPage <= totalPages) {
                    await new Promise((resolve) => setTimeout(resolve, 500));
                  }
                } else {
                  break;
                }
              } while (currentPage <= totalPages);

              // Create a response object with all results
              response = {
                Total: totalCount,
                Page: 1,
                PageSize: allResults.length,
                TotalPages: 1,
                Results: allResults,
              };
            } else {
              // Fetch single page
              const limit = this.getNodeParameter('limit', itemIndex, 50);
              const qs = { ...baseQs, Page: 1, Size: limit };
              response = await requestBackupRadar.call(this, 'GET', '/backups/retired', { qs });
            }
            break;
          }

          case 'getOverview': {
            response = await requestBackupRadar.call(this, 'GET', '/backups/overview');
            break;
          }

          default:
            throw new NodeApiError(this.getNode(), {
              message: `Unknown operation: ${operation}`,
            });
        }

        // Handle paginated responses - return Results array if present, otherwise return full response
        if (response && 'Results' in response && Array.isArray(response.Results)) {
          const results = response.Results as IDataObject[];
          for (const result of results) {
            const returnItem: INodeExecutionData = {
              json: {
                ...result,
                _pagination: {
                  Total: response.Total,
                  Page: response.Page,
                  PageSize: response.PageSize,
                  TotalPages: response.TotalPages,
                },
              },
            };
            if (items[itemIndex].binary) {
              returnItem.binary = items[itemIndex].binary;
            }
            returnData.push(returnItem);
          }
        } else {
          // Single object response
          const returnItem: INodeExecutionData = {
            json: response,
          };
          if (items[itemIndex].binary) {
            returnItem.binary = items[itemIndex].binary;
          }
          returnData.push(returnItem);
        }
      } catch (error) {
        if (this.continueOnFail()) {
          returnData.push({
            json: {
              error: error instanceof Error ? error.message : String(error),
            },
          });
          continue;
        }
        throw error;
      }
    }

    return [returnData];
  }
}
