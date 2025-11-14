import type { INodeProperties, INodePropertyOptions } from 'n8n-workflow';

export const getFiltersOperationOption: INodePropertyOptions = {
  name: 'Get Filters',
  value: 'getFilters',
  description: 'Get the available filters (companies, tags, statuses, etc.)',
  action: 'Get filters',
};

export const getFiltersOperationFields: INodeProperties[] = [];
