const BASE_URL = `${import.meta.env.VITE_API_BASE ?? ''}/data-engine/api/v1`;

function buildHeaders(): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    'X-Request-Id': crypto.randomUUID(),
    'X-Timestamp': new Date().toISOString(),
  };
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const url = `${BASE_URL}${path}`;
  console.log(`[API] ${init.method ?? 'GET'} ${url}`);

  const res = await fetch(url, {
    ...init,
    credentials: 'include',
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
  status: string;
  created_by: string;
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

  async listDataSources(): Promise<ApiDataSource[]> {
    const res = await request<unknown>('/datasources/DPDPA');
    return toArray<ApiDataSource>(res);
  },

  async getDataSource(id: string): Promise<ApiDataSourceDetail> {
    const res = await request<unknown>(`/datasources/${id}`);
    // Unwrap common envelope patterns: { data: {...} }, { datasource: {...} }, { result: {...} }
    if (res && typeof res === 'object' && !('id' in res)) {
      for (const key of ['data', 'datasource', 'result', 'source', 'responseMessage']) {
        const v = (res as Record<string, unknown>)[key];
        if (v && typeof v === 'object' && 'id' in v) {
          console.log(`[API] getDataSource unwrapped from "${key}":`, v);
          return v as ApiDataSourceDetail;
        }
      }
    }
    console.log('[API] getDataSource raw:', res);
    return res as ApiDataSourceDetail;
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

  updateDataSource(id: string, payload: Partial<DiscoverPayload>): Promise<ApiDataSourceDetail> {
    return request<ApiDataSourceDetail>(`/datasources/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },
};
