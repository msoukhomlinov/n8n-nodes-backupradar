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
    displayName: 'History Days',
    name: 'HistoryDays',
    type: 'number',
    default: 0,
    description:
      'Count of days to get backup history. Default: 0 days (without history). Maximum: 31 days.',
    typeOptions: {
      minValue: 0,
      maxValue: 31,
    },
    displayOptions: {
      show: {
        operation: ['getBackups'],
      },
    },
  },
  {
    displayName: 'Date',
    name: 'date',
    type: 'dateTime',
    default: '',
    description: 'Date from (Example: 2018-02-14)',
    displayOptions: {
      show: {
        operation: ['getBackups'],
      },
    },
  },
];
