import type {
  IExecuteFunctions,
  ILoadOptionsFunctions,
  IHttpRequestOptions,
  IDataObject,
  JsonObject,
} from 'n8n-workflow';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

const MAX_RETRIES = 3;
const RATE_LIMIT_BACKOFF_MS = 5000;

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
  const credentials = await this.getCredentials('backupRadarApi');
  const baseUrl = (credentials?.baseUrl as string) || 'https://api.backupradar.com';

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

  let lastError: unknown;
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      return (await this.helpers.requestWithAuthentication.call(
        this,
        'backupRadarApi',
        options,
      )) as JsonObject;
    } catch (err) {
      const status = (err as { statusCode?: number; response?: { statusCode?: number } })
        ?.statusCode ?? (err as { response?: { statusCode?: number } })?.response?.statusCode;
      if (status === 429 && attempt < MAX_RETRIES - 1) {
        await new Promise((resolve) => setTimeout(resolve, RATE_LIMIT_BACKOFF_MS * (attempt + 1)));
        lastError = err;
        continue;
      }
      throw err;
    }
  }
  throw lastError;
}
