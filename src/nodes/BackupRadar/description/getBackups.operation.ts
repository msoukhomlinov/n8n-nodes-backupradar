import type { INodeProperties, INodePropertyOptions } from 'n8n-workflow';

export const getBackupsOperationOption: INodePropertyOptions = {
  name: 'Get Backups',
  value: 'getBackups',
  description: 'Get backups with pagination and filtering',
  action: 'Get backups',
};

export const getBackupsOperationFields: INodeProperties[] = [
  {
    displayName: 'Get All',
    name: 'returnAll',
    type: 'boolean',
    default: false,
    description: 'Whether to return all results or only a specific amount',
    displayOptions: {
      show: {
        operation: ['getBackups'],
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
        operation: ['getBackups'],
        returnAll: [false],
      },
    },
  },
  {
    displayName: 'Search Options',
    name: 'searchOptions',
    type: 'collection',
    placeholder: 'Add Search Field',
    default: {},
    displayOptions: {
      show: {
        operation: ['getBackups'],
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
        displayName: 'Backup Note',
        name: 'SearchByTooltip',
        type: 'string',
        default: '',
      },
      {
        displayName: 'Tag',
        name: 'SearchByTag',
        type: 'string',
        default: '',
      },
      {
        displayName: 'Search String',
        name: 'searchString',
        type: 'string',
        default: '',
      },
    ],
  },
  {
    displayName: 'Filter Options',
    name: 'filterOptions',
    type: 'collection',
    placeholder: 'Add Filter',
    default: {},
    displayOptions: {
      show: {
        operation: ['getBackups'],
      },
    },
    options: [
      {
        displayName: 'Backup Methods',
        name: 'backupMethods',
        type: 'multiOptions',
        typeOptions: {
          loadOptionsMethod: 'getBackupMethods',
        },
        default: [],
        description: 'Filter by backup methods',
      },
      {
        displayName: 'Companies',
        name: 'companies',
        type: 'multiOptions',
        typeOptions: {
          loadOptionsMethod: 'getCompanies',
        },
        default: [],
        description: 'Filter by companies',
      },
      {
        displayName: 'Days Without Success',
        name: 'DaysWithoutSuccess',
        type: 'number',
        typeOptions: {
          minValue: 0,
        },
        default: 0,
        description: 'Filter by days without success',
      },
      {
        displayName: 'Device Types',
        name: 'deviceTypes',
        type: 'multiOptions',
        typeOptions: {
          loadOptionsMethod: 'getDeviceTypes',
        },
        default: [],
        description: 'Filter by device type',
      },
      {
        displayName: 'Exclude Backup Methods',
        name: 'excludeBackupMethods',
        type: 'multiOptions',
        typeOptions: {
          loadOptionsMethod: 'getBackupMethods',
        },
        default: [],
        description: 'Exclude the policies with the specific backup methods',
      },
      {
        displayName: 'Exclude Device Types',
        name: 'excludeDeviceTypes',
        type: 'multiOptions',
        typeOptions: {
          loadOptionsMethod: 'getDeviceTypes',
        },
        default: [],
        description: 'Exclude the policies with the specific device types',
      },
      {
        displayName: 'Exclude Tags',
        name: 'excludeTags',
        type: 'multiOptions',
        typeOptions: {
          loadOptionsMethod: 'getTags',
        },
        default: [],
        description: 'Exclude the policies with the specific tags',
      },
      {
        displayName: 'Filter Scheduled Only',
        name: 'FilterScheduled',
        type: 'boolean',
        default: false,
        description: 'Filter only scheduled backups',
      },
      {
        displayName: 'Policy IDs',
        name: 'policyIds',
        type: 'string',
        default: '',
        description: 'Include only the policies with the listed IDs (comma-separated)',
      },
      {
        displayName: 'Policy Types',
        name: 'policyTypes',
        type: 'multiOptions',
        typeOptions: {
          loadOptionsMethod: 'getPolicyTypes',
        },
        default: [],
        description: 'Filter by policy type',
      },
      {
        displayName: 'Statuses',
        name: 'statuses',
        type: 'multiOptions',
        typeOptions: {
          loadOptionsMethod: 'getStatuses',
        },
        default: [],
        description: 'Filter by statuses',
      },
      {
        displayName: 'Tags',
        name: 'tags',
        type: 'multiOptions',
        typeOptions: {
          loadOptionsMethod: 'getTags',
        },
        default: [],
        description: 'Filter by tags',
      },
    ],
  },
  {
    displayName: 'Date Range Mode',
    name: 'dateRangeMode',
    type: 'options',
    default: 'preset',
    description: 'How to specify the date range for backup history',
    options: [
      { name: 'Preset', value: 'preset' },
      { name: 'Days Back', value: 'daysBack' },
      { name: 'Date Range', value: 'dateRange' },
    ],
    displayOptions: {
      show: { operation: ['getBackups'] },
    },
  },
  {
    displayName: 'Preset Range',
    name: 'presetRange',
    type: 'options',
    default: 'today',
    options: [
      { name: 'Today', value: 'today' },
      { name: 'Last 1 Day', value: 'last-1-day' },
      { name: 'Last 2 Days', value: 'last-2-days' },
      { name: 'Last 3 Days', value: 'last-3-days' },
      { name: 'Last 4 Days', value: 'last-4-days' },
      { name: 'Last 5 Days', value: 'last-5-days' },
      { name: 'Last 6 Days', value: 'last-6-days' },
      { name: 'Last 7 Days', value: 'last-7-days' },
      { name: 'Last 8 Days', value: 'last-8-days' },
      { name: 'Last 9 Days', value: 'last-9-days' },
      { name: 'Last 10 Days', value: 'last-10-days' },
      { name: 'Last 11 Days', value: 'last-11-days' },
      { name: 'Last 12 Days', value: 'last-12-days' },
      { name: 'Last 13 Days', value: 'last-13-days' },
      { name: 'Last 14 Days', value: 'last-14-days' },
      { name: 'Last 15 Days', value: 'last-15-days' },
      { name: 'Last 16 Days', value: 'last-16-days' },
      { name: 'Last 17 Days', value: 'last-17-days' },
      { name: 'Last 18 Days', value: 'last-18-days' },
      { name: 'Last 19 Days', value: 'last-19-days' },
      { name: 'Last 20 Days', value: 'last-20-days' },
      { name: 'Last 21 Days', value: 'last-21-days' },
      { name: 'Last 22 Days', value: 'last-22-days' },
      { name: 'Last 23 Days', value: 'last-23-days' },
      { name: 'Last 24 Days', value: 'last-24-days' },
      { name: 'Last 25 Days', value: 'last-25-days' },
      { name: 'Last 26 Days', value: 'last-26-days' },
      { name: 'Last 27 Days', value: 'last-27-days' },
      { name: 'Last 28 Days', value: 'last-28-days' },
      { name: 'Last 29 Days', value: 'last-29-days' },
      { name: 'Last 30 Days', value: 'last-30-days' },
      { name: 'Last 31 Days', value: 'last-31-days' },
      { name: 'Last 45 Days', value: 'last-45-days' },
      { name: 'Last 60 Days', value: 'last-60-days' },
      { name: 'Last 90 Days', value: 'last-90-days' },
    ],
    displayOptions: {
      show: { operation: ['getBackups'], dateRangeMode: ['preset'] },
    },
  },
  {
    displayName: 'Days Back',
    name: 'daysBack',
    type: 'number',
    default: 7,
    description: 'Number of days back from today to retrieve backup history',
    typeOptions: { minValue: 0 },
    displayOptions: {
      show: { operation: ['getBackups'], dateRangeMode: ['daysBack'] },
    },
  },
  {
    displayName: 'Date From',
    name: 'dateFrom',
    type: 'dateTime',
    default: '',
    required: true,
    description: 'Start date for backup history range',
    displayOptions: {
      show: { operation: ['getBackups'], dateRangeMode: ['dateRange'] },
    },
  },
  {
    displayName: 'Date To',
    name: 'dateTo',
    type: 'dateTime',
    default: '',
    description: 'End date for backup history range. Defaults to today if left empty.',
    displayOptions: {
      show: { operation: ['getBackups'], dateRangeMode: ['dateRange'] },
    },
  },
];
