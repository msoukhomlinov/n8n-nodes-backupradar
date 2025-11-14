import type { INodeProperties, INodePropertyOptions } from 'n8n-workflow';

export const getBackupOperationOption: INodePropertyOptions = {
  name: 'Get Backup',
  value: 'getBackup',
  description: 'Get backup data for a specific backup ID',
  action: 'Get backup',
};

export const getBackupOperationFields: INodeProperties[] = [
  {
    displayName: 'Backup ID',
    name: 'backupId',
    type: 'number',
    required: true,
    default: undefined,
    description: 'Backup ID',
    typeOptions: {
      minValue: 0,
    },
    displayOptions: {
      show: {
        operation: ['getBackup'],
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
        operation: ['getBackup'],
      },
    },
  },
];
