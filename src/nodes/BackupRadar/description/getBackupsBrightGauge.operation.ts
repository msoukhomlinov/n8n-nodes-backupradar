import type { INodeProperties, INodePropertyOptions } from 'n8n-workflow';

export const getBackupsBrightGaugeOperationOption: INodePropertyOptions = {
  name: 'Get Backups (BrightGauge)',
  value: 'getBackupsBrightGauge',
  description: 'Get backups for BrightGauge with pagination',
  action: 'Get backups (BrightGauge format)',
};

export const getBackupsBrightGaugeOperationFields: INodeProperties[] = [
  {
    displayName: 'Date',
    name: 'date',
    type: 'dateTime',
    default: '',
    description: 'Date from (Example: 2018-02-14). Default: Today.',
    displayOptions: {
      show: {
        operation: ['getBackupsBrightGauge'],
      },
    },
  },
  {
    displayName: 'Days',
    name: 'days',
    type: 'number',
    default: 1,
    description: 'Amount of days to fetch. Default: 1. Max Value: 31.',
    typeOptions: {
      minValue: 1,
      maxValue: 31,
    },
    displayOptions: {
      show: {
        operation: ['getBackupsBrightGauge'],
      },
    },
  },
  {
    displayName: 'Include Results',
    name: 'includeResults',
    type: 'boolean',
    default: false,
    description: 'Include raw results. Default: false.',
    displayOptions: {
      show: {
        operation: ['getBackupsBrightGauge'],
      },
    },
  },
  {
    displayName: 'Include History Details',
    name: 'includeHistoryDetails',
    type: 'boolean',
    default: false,
    description: 'Include history details (result counts). Default: false.',
    displayOptions: {
      show: {
        operation: ['getBackupsBrightGauge'],
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
        operation: ['getBackupsBrightGauge'],
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
        operation: ['getBackupsBrightGauge'],
        returnAll: [false],
      },
    },
  },
];
