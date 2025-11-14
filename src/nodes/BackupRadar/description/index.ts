import type { INodeProperties } from 'n8n-workflow';
import { getBackupsOperationOption, getBackupsOperationFields } from './getBackups.operation.js';
import {
  getBackupsBrightGaugeOperationOption,
  getBackupsBrightGaugeOperationFields,
} from './getBackupsBrightGauge.operation.js';
import { getBackupOperationOption, getBackupOperationFields } from './getBackup.operation.js';
import {
  getBackupResultsOperationOption,
  getBackupResultsOperationFields,
} from './getBackupResults.operation.js';
import { getFiltersOperationOption, getFiltersOperationFields } from './getFilters.operation.js';
import {
  getInactiveBackupsOperationOption,
  getInactiveBackupsOperationFields,
} from './getInactiveBackups.operation.js';
import {
  getRetiredBackupsOperationOption,
  getRetiredBackupsOperationFields,
} from './getRetiredBackups.operation.js';
import { getOverviewOperationOption, getOverviewOperationFields } from './getOverview.operation.js';

export const backupRadarNodeProperties: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    options: [
      getBackupsOperationOption,
      getBackupsBrightGaugeOperationOption,
      getBackupOperationOption,
      getBackupResultsOperationOption,
      getFiltersOperationOption,
      getInactiveBackupsOperationOption,
      getRetiredBackupsOperationOption,
      getOverviewOperationOption,
    ],
    default: 'getBackups',
  },
  ...getBackupsOperationFields,
  ...getBackupsBrightGaugeOperationFields,
  ...getBackupOperationFields,
  ...getBackupResultsOperationFields,
  ...getFiltersOperationFields,
  ...getInactiveBackupsOperationFields,
  ...getRetiredBackupsOperationFields,
  ...getOverviewOperationFields,
];
