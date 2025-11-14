import type { INodePropertyOptions } from 'n8n-workflow';
import type { ILoadOptionsFunctions } from 'n8n-workflow';
import { requestBackupRadar } from '../../lib/transport.js';

async function getFilters(this: ILoadOptionsFunctions): Promise<Record<string, string[]>> {
  const response = await requestBackupRadar.call(this, 'GET', '/backups/filters');
  return response as Record<string, string[]>;
}

export async function getCompanies(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
  const filters = await getFilters.call(this);
  const companies = filters.companies || [];
  return companies
    .map((company) => ({ name: company, value: company }))
    .sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: 'base', numeric: true }),
    );
}

export async function getTags(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
  const filters = await getFilters.call(this);
  const tags = filters.tags || [];
  return tags
    .map((tag) => ({ name: tag, value: tag }))
    .sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: 'base', numeric: true }),
    );
}

export async function getStatuses(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
  const filters = await getFilters.call(this);
  const statuses = filters.statuses || [];
  return statuses
    .map((status) => ({ name: status, value: status }))
    .sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: 'base', numeric: true }),
    );
}

export async function getBackupMethods(
  this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
  const filters = await getFilters.call(this);
  const methods = filters.backupMethods || [];
  return methods
    .map((method) => ({ name: method, value: method }))
    .sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: 'base', numeric: true }),
    );
}

export async function getDeviceTypes(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
  const filters = await getFilters.call(this);
  const deviceTypes = filters.deviceTypes || [];
  return deviceTypes
    .map((deviceType) => ({ name: deviceType, value: deviceType }))
    .sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: 'base', numeric: true }),
    );
}

export async function getPolicyTypes(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
  const filters = await getFilters.call(this);
  const policyTypes = filters.policyTypes || [];
  return policyTypes
    .map((policyType) => ({ name: policyType, value: policyType }))
    .sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: 'base', numeric: true }),
    );
}
