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
import { executeGetBackups } from './operations/getBackups.js';
import { executeGetInactiveBackups } from './operations/getInactiveBackups.js';
import { executeGetRetiredBackups } from './operations/getRetiredBackups.js';

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
          case 'getBackups':
            response = await executeGetBackups(this, itemIndex);
            break;

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
            response = await requestBackupRadar.call(this, 'GET', `/backups/${backupId}/results`, { qs });
            break;
          }

          case 'getFilters':
            response = await requestBackupRadar.call(this, 'GET', '/backups/filters');
            break;

          case 'getInactiveBackups':
            response = await executeGetInactiveBackups(this, itemIndex);
            break;

          case 'getRetiredBackups':
            response = await executeGetRetiredBackups(this, itemIndex);
            break;

          case 'getOverview':
            response = await requestBackupRadar.call(this, 'GET', '/backups/overview');
            break;

          default:
            throw new NodeApiError(this.getNode(), {
              message: `Unknown operation: ${operation}`,
            });
        }

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
          const returnItem: INodeExecutionData = { json: response };
          if (items[itemIndex].binary) {
            returnItem.binary = items[itemIndex].binary;
          }
          returnData.push(returnItem);
        }
      } catch (error) {
        if (this.continueOnFail()) {
          returnData.push({
            json: { error: error instanceof Error ? error.message : String(error) },
          });
          continue;
        }
        throw error;
      }
    }

    return [returnData];
  }
}
