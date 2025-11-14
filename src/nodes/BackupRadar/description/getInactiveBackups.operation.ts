import type { INodeProperties, INodePropertyOptions } from 'n8n-workflow';

export const getInactiveBackupsOperationOption: INodePropertyOptions = {
  name: 'Get Inactive Backups',
  value: 'getInactiveBackups',
  description: 'Get inactive backups ready to activate',
  action: 'Get inactive backups',
};

export const getInactiveBackupsOperationFields: INodeProperties[] = [
  {
    displayName: 'Search Options',
    name: 'searchOptions',
    type: 'collection',
    placeholder: 'Add Search Field',
    default: {},
    displayOptions: {
      show: {
        operation: ['getInactiveBackups'],
      },
    },
    options: [
      {
        displayName: 'Company Name',
        name: 'SearchByCompanyName',
        type: 'string',
        default: '',
      },
      {
        displayName: 'Device Name',
        name: 'SearchByDeviceName',
        type: 'string',
        default: '',
      },
      {
        displayName: 'Job Name',
        name: 'SearchByJobName',
        type: 'string',
        default: '',
      },
      {
        displayName: 'Backup Method',
        name: 'SearchByBackupMethod',
        type: 'string',
        default: '',
      },
      {
        displayName: 'Email From',
        name: 'SearchByEmailFrom',
        type: 'string',
        default: '',
      },
      {
        displayName: 'Backup Type',
        name: 'SearchByBackupType',
        type: 'string',
        default: '',
      },
    ],
  },
  {
    displayName: 'Get All',
    name: 'returnAll',
    type: 'boolean',
    default: false,
    description: 'Whether to return all results or only a specific amount',
    displayOptions: {
      show: {
        operation: ['getInactiveBackups'],
      },
    },
  },
  {
    displayName: 'Records',
    name: 'limit',
    type: 'number',
    default: 50,
    description: 'Number of records to return. Max: 1000.',
    typeOptions: {
      minValue: 1,
      maxValue: 1000,
    },
    displayOptions: {
      show: {
        operation: ['getInactiveBackups'],
        returnAll: [false],
      },
    },
  },
];
