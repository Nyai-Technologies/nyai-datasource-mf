const AUTH_BASE = `${import.meta.env.VITE_AUTH_BASE || 'https://compliance.dev.nyai.ai'}/api/v1`;
const BASE_URL  = `${import.meta.env.VITE_API_BASE || 'https://dev.nyai.ai'}/data-engine/api/v1`;


function getToken(): string {
  // Read access_token from sessionStorage, cookie, or localStorage (in priority order)
  const ss = sessionStorage.getItem('nyai_access_token') ?? '';
  if (ss) return ss;
  const ck = /(?:^|;\s*)access_token=([^;]*)/.exec(document.cookie);
  if (ck) return decodeURIComponent(ck[1]);
  return localStorage.getItem('access_token') ?? '';
}

export function writeAccessTokenCookie(token: string): void {
  if (!token) return;
  const host    = globalThis.location?.hostname ?? '';
  const isLocal = host === 'localhost' || host === '127.0.0.1';
  const domain  = isLocal ? '' : '; domain=.nyai.ai';
  const secure  = isLocal ? '' : '; Secure';
  document.cookie = `access_token=${encodeURIComponent(token)}; path=/${domain}; SameSite=None${secure}`;
}

function buildHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Request-Id': crypto.randomUUID(),
    'X-Timestamp': new Date().toISOString(),
  };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const url = `${BASE_URL}${path}`;
  console.log(`[API] ${init.method ?? 'GET'} ${url}`);

  const res = await fetch(url, {
    ...init,
    credentials: 'include',
    cache: 'no-store',
    headers: buildHeaders(),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    const message = `API ${res.status}: ${text}`;
    console.error(`[API] Error:`, message);
    throw new Error(message);
  }

  const ct = res.headers.get('content-type') ?? '';
  if (ct.includes('application/json')) {
    return res.json() as Promise<T>;
  }
  return res.text() as unknown as Promise<T>;
}

// ── API payload / response types ─────────────────────────────

export interface ApiDataSource {
  id: string;
  name: string;
  type: string;
  app_name: string;
  status: 'COMPLETED' | 'SAMPLE_COLLECTED' | 'CREATED';
  created_by: string;
  updated_at?: string;
}

export interface ApiDataSourceDetail {
  id: string;
  name: string;
  app_name?: string;
  appName?: string;
  description?: string;
  dialect?: string;
  // hostname — API may use any of these keys
  hostname?: string;
  host?: string;
  // port
  port?: number;
  // database name
  databaseName?: string;
  database_name?: string;
  database?: string;
  // username
  username?: string;
  user?: string;
  // ssl
  sslEnabled?: boolean;
  ssl_enabled?: boolean;
  ssl?: boolean;
}

export interface ApiSchemaColumn {
  name: string;
}

export interface ApiSchemaTable {
  tableName: string;
  columns: ApiSchemaColumn[];
}

export interface ConsentPayload {
  id?: string;
  type: string;
  purpose: string;
  validUpto: string;
  metadata: {
    ipAddress: string;
    browser: { name: string; version: string };
    device: { os: string };
  };
}

export interface DiscoverPayload {
  appName: string;
  name: string;
  description: string;
  dialect: string;
  databaseName: string;
  username: string;
  password: string;
  hostname: string;
  port: number;
  sslEnabled: boolean;
  consent?: ConsentPayload;
}

export interface DiscoverColumn {
  columnName: string;
  columnType: string;
  columnDefault: string | null;
  isNullable: string;
  referencedSchema: string | null;
  referencedTable: string | null;
  referencedColumn: string | null;
}

// Each entry has a fixed `schema` key plus one dynamic key = the table name
export interface DiscoverTableEntry {
  schema: string;
  [tableName: string]: string | DiscoverColumn[];
}

export interface DiscoverMetadata {
  databaseName: string;
  tables: DiscoverTableEntry[];
}

export interface DiscoverResponse {
  requestId: string;
  timestamp: string;
  datasourceId: string;
  responseMessage: {
    metadata: DiscoverMetadata[];
  };
}

/** Flatten the nested discovery response into a simple table→columns list. */
export function parseDiscoverTables(res: DiscoverResponse): ApiSchemaTable[] {
  const tables: ApiSchemaTable[] = [];
  for (const meta of res.responseMessage?.metadata ?? []) {
    for (const entry of meta.tables ?? []) {
      for (const key of Object.keys(entry)) {
        if (key === 'schema') continue;
        const cols = entry[key];
        if (!Array.isArray(cols)) continue;
        tables.push({
          tableName: key,
          columns: cols.map(c => ({ name: c.columnName })),
        });
      }
    }
  }
  return tables;
}

export interface PiiAttribute {
  id: string;
  name: string;
  isPii?: boolean;
  pii?: boolean;
  is_pii?: boolean;
  dataCategories?: string[] | null;
}

export interface PiiDataObject {
  id: string;
  name: string;
  attributes: PiiAttribute[];
}

export interface PiiColumnsResponse {
  databaseName: string;
  dataObjects: PiiDataObject[];
}

export interface ProcessPayload {
  tables: { tableName: string; columns: string[] }[];
  operations: string[];
}

export type UpdateDataSourceOperation = 'BasicDetails' | 'ConnectionDetails';

export interface UpdateBasicDetailsPayload {
  operation: 'BasicDetails';
  name: string;
  description?: string;
  primaryLanguageId?: string | null;
  secondaryLanguageId?: string | null;
}

export interface UpdateConnectionDetailsPayload {
  operation: 'ConnectionDetails';
  connectionDetails: {
    dialect: string;
    databaseName: string;
    username: string;
    password: string;
    passwordEncrypted?: boolean;
    hostname: string;
    port: number;
    sslEnabled: boolean;
  };
}

export type UpdateDataSourcePayload = UpdateBasicDetailsPayload | UpdateConnectionDetailsPayload;

export interface ApiLanguage {
  id: string;
  name: string;
  code?: string;
}

export type ApiDataCategory = string;


export interface ApiConsent {
  id: string;
  name?: string;
  type: string;
  purpose: string;
  status?: string;
  purposes?: number;
  purposeCount?: number;
  createdBy?: string;
  created_by?: string;
  createdOn?: string;
  created_on?: string;
  createdAt?: string;
}

/** Extract an array from either a direct array or a wrapped `{ data: [...] }` response. */
function toArray<T>(val: unknown): T[] {
  if (Array.isArray(val)) return val as T[];
  if (val && typeof val === 'object') {
    for (const key of ['data', 'items', 'results', 'records']) {
      const v = (val as Record<string, unknown>)[key];
      if (Array.isArray(v)) return v as T[];
    }
  }
  return [];
}

// ── API methods ───────────────────────────────────────────────

export const api = {

  async listDataSources(appName = 'DPDPA'): Promise<ApiDataSource[]> {
    const res = await request<unknown>(`/datasources/${encodeURIComponent(appName)}`);
    return toArray<ApiDataSource>(res);
  },

  async getDataSource(id: string): Promise<ApiDataSourceDetail> {
    const res = await request<unknown>(`/datasource/${id}`);
    console.log('[API] getDataSource raw:', JSON.stringify(res));

    let obj = res as Record<string, unknown>;

    // Unwrap common envelope patterns
    if (obj && typeof obj === 'object' && !('id' in obj)) {
      for (const key of ['data', 'datasource', 'result', 'source', 'responseMessage']) {
        const v = obj[key];
        if (v && typeof v === 'object' && 'id' in (v as object)) {
          obj = v as Record<string, unknown>;
          break;
        }
      }
    }

    // Flatten nested connectionDetails / connection block into top level
    for (const key of ['connectionDetails', 'connection', 'connectionInfo', 'dbConnection']) {
      const nested = obj[key];
      if (nested && typeof nested === 'object') {
        obj = { ...obj, ...(nested as Record<string, unknown>) };
        break;
      }
    }

    console.log('[API] getDataSource resolved:', JSON.stringify(obj));
    return obj as unknown as ApiDataSourceDetail;
  },

  discoverDatabase(payload: DiscoverPayload): Promise<DiscoverResponse> {
    return request<DiscoverResponse>('/discovery-database', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  getPiiColumns(id: string): Promise<PiiColumnsResponse> {
    return request<PiiColumnsResponse>(`/pii-columns/${id}`);
  },

  processMetadata(id: string, payload: ProcessPayload): Promise<string> {
    return request<string>(`/process/${id}`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async listConsents(): Promise<ApiConsent[]> {
    const res = await request<unknown>('/consents');
    return toArray<ApiConsent>(res);
  },

  updateDataSource(id: string, payload: UpdateDataSourcePayload): Promise<ApiDataSourceDetail> {
    return request<ApiDataSourceDetail>(`/datasource/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  deleteDataSource(id: string): Promise<void> {
    return request<void>(`/datasource/${id}`, { method: 'DELETE' });
  },

  async listLanguages(): Promise<ApiLanguage[]> {
    const res = await request<unknown>('/languages');
    return toArray<ApiLanguage>(res);
  },

  async listDataCategories(): Promise<ApiDataCategory[]> {
    const res = await request<unknown>('/attributes/data-category');
    if (Array.isArray(res)) return res as string[];
    return toArray<ApiDataCategory>(res);
  },
};

// ── Auth types ────────────────────────────────────────────────

export interface AuthUser {
  id?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  entityName?: string;
  name?: string;
}

async function authRequest<T>(path: string, body?: unknown): Promise<T> {
  const hasBody = body !== undefined;
  const res = await fetch(`${AUTH_BASE}${path}`, {
    method: hasBody ? 'POST' : 'GET',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    ...(hasBody ? { body: JSON.stringify(body) } : {}),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = (json as Record<string, string>).message
      ?? (json as Record<string, string>).error
      ?? `Request failed (${res.status})`;
    throw new Error(msg);
  }
  // Store token from response body so subsequent API calls can send it
  const token = (json as Record<string, string>).access_token
    ?? (json as Record<string, string>).accessToken
    ?? (json as Record<string, string>).token
    ?? '';
  if (token) {
    sessionStorage.setItem('nyai_access_token', token);
    localStorage.setItem('access_token', token);
    writeAccessTokenCookie(token);
  }
  return json as T;
}

export const auth = {
  async login(email: string, password: string): Promise<AuthUser> {
    const json = await authRequest<Record<string, unknown>>('/auth/login', { email, password });
    // Extract user fields from the login response directly
    return {
      id:         String(json.sub ?? json.id ?? json.userId ?? ''),
      email:      String(json.email ?? email),
      firstName:  String(json.firstName ?? json.first_name ?? json.given_name ?? ''),
      lastName:   String(json.lastName  ?? json.last_name  ?? json.family_name ?? ''),
      entityName: String(json.entityName ?? json.entity_name ?? ''),
    };
  },

  register: (email: string, password: string, firstName: string, lastName: string, entityName: string) =>
    authRequest<AuthUser>('/auth/register', { email, password, firstName, lastName, entityName }),

  async logout(): Promise<void> {
    await fetch(`${AUTH_BASE}/auth/logout`, { method: 'POST', credentials: 'include' });
    sessionStorage.removeItem('nyai_access_token');
    localStorage.removeItem('access_token');
  },

  async me(): Promise<AuthUser> {
    // Use stored token to verify session is still valid
    const token = sessionStorage.getItem('nyai_access_token') ?? localStorage.getItem('access_token') ?? '';
    if (!token) throw new Error('Unauthenticated');
    const res = await fetch(`${AUTH_BASE}/auth/me`, {
      credentials: 'include',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) throw new Error('Unauthenticated');
    return res.json() as Promise<AuthUser>;
  },
};
