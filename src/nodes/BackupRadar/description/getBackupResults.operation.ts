import type { INodeProperties, INodePropertyOptions } from 'n8n-workflow';

export const getBackupResultsOperationOption: INodePropertyOptions = {
  name: 'Get Backup Results',
  value: 'getBackupResults',
  description: 'Get results for backups for a specific date',
  action: 'Get backup results',
};

export const getBackupResultsOperationFields: INodeProperties[] = [
  {
    displayName: 'Backup ID',
    name: 'backupId',
    type: 'number',
    required: true,
    default: 0,
    description: 'Backup ID',
    typeOptions: {
      minValue: 0,
    },
    displayOptions: {
      show: {
        operation: ['getBackupResults'],
      },
    },
  },
  {
    displayName: 'Date',
    name: 'date',
    type: 'dateTime',
    default: '',
    description: 'Date (Example: 2018-02-14)',
    displayOptions: {
      show: {
        operation: ['getBackupResults'],
      },
    },
  },
];
