import type {
  IExecuteFunctions,
  ILoadOptionsFunctions,
  IHttpRequestOptions,
  IDataObject,
  JsonObject,
} from 'n8n-workflow';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/**
 * Generic HTTP request helper for the BackupRadar node.
 * Uses n8n's authenticated HTTP helper with ApiKey header authentication.
 */
export async function requestBackupRadar(
  this: IExecuteFunctions | ILoadOptionsFunctions,
  method: HttpMethod,
  endpoint: string,
  {
    body,
    qs,
    headers,
  }: {
    body?: IDataObject;
    qs?: IDataObject;
    headers?: IDataObject;
  } = {},
): Promise<JsonObject> {
  // Get base URL from credentials
  const credentials = await this.getCredentials('backupRadarApi');
  const baseUrl = (credentials?.baseUrl as string) || 'https://api.backupradar.com';

  // Construct full URL
  const url = endpoint.startsWith('http')
    ? endpoint
    : `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const options: IHttpRequestOptions = {
    method,
    url,
    headers: headers || {},
    qs,
    body,
    returnFullResponse: false,
    json: true,
  };

  // Use authenticated helper which will add ApiKey header via credentials
  // n8n's requestWithAuthentication will handle errors appropriately
  return (await this.helpers.requestWithAuthentication.call(
    this,
    'backupRadarApi',
    options,
  )) as JsonObject;
}
