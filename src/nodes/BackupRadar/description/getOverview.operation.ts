import type { INodeProperties, INodePropertyOptions } from 'n8n-workflow';

export const getOverviewOperationOption: INodePropertyOptions = {
  name: 'Get Overview',
  value: 'getOverview',
  description: 'Get overview counts (policies, backups, servers, workstations)',
  action: 'Get overview',
};

export const getOverviewOperationFields: INodeProperties[] = [];
