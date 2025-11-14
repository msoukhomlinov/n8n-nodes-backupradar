import type { INodeProperties, INodePropertyOptions } from 'n8n-workflow';

export const getRetiredBackupsOperationOption: INodePropertyOptions = {
  name: 'Get Retired Backups',
  value: 'getRetiredBackups',
  description: 'Get retired backups',
  action: 'Get retired backups',
};

export const getRetiredBackupsOperationFields: INodeProperties[] = [
  {
    displayName: 'Search Options',
    name: 'searchOptions',
    type: 'collection',
    placeholder: 'Add Search Field',
    default: {},
    displayOptions: {
      show: {
        operation: ['getRetiredBackups'],
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
        displayName: 'Retire Message',
        name: 'SearchByRetireMessage',
        type: 'string',
        default: '',
      },
      {
        displayName: 'Retired By',
        name: 'SearchByRetiredBy',
        type: 'string',
        default: '',
      },
    ],
  },
  {
    displayName: 'Retired Date Start',
    name: 'SearchByRetiredDateStart',
    type: 'dateTime',
    default: '',
    description: 'Search by retired backup date start',
    displayOptions: {
      show: {
        operation: ['getRetiredBackups'],
      },
    },
  },
  {
    displayName: 'Retired Date End',
    name: 'SearchByRetiredDateEnd',
    type: 'dateTime',
    default: '',
    description: 'Search by retired backup date end',
    displayOptions: {
      show: {
        operation: ['getRetiredBackups'],
      },
    },
  },
  {
    displayName: 'Get All',
    name: 'returnAll',
    type: 'boolean',
    default: false,
    description: 'Whether to return all results or only a specific amount',
    displayOptions: {
      show: {
        operation: ['getRetiredBackups'],
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
        operation: ['getRetiredBackups'],
        returnAll: [false],
      },
    },
  },
];
