import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { api, type ApiDataSourceDetail, type ApiLanguage } from '../../../lib/api';
import type { DataSource } from '../../../types/types';
import { AlignLeft, CheckCircle, ChevronDown, ChevronRight, Check } from 'lucide-react';
import { Button, Input, Textarea, Select, Checkbox, Accordion } from '../../../components/Components';
// ── Types ──────────────────────────────────────────────────
type Tab = 'basic' | 'connection' | 'database';


const DB_TABLES = [
  { id: 'consents',  name: 'consents',  pii: false },
  { id: 'customers', name: 'customers', pii: true  },
  { id: 'addresses', name: 'addresses', pii: true  },
];

const DB_COLUMNS: Record<string, { name: string; pii: boolean; description: string }[]> = {
  consents: [
    { name: 'consent_id',    pii: false, description: 'Unique identifier for the consent record' },
    { name: 'customer_id',   pii: true,  description: 'Reference to the customer who gave consent' },
    { name: 'purpose',       pii: false, description: 'The purpose for which consent was obtained' },
    { name: 'consent_given', pii: false, description: 'Boolean indicating if consent was given' },
    { name: 'consent_date',  pii: false, description: 'Timestamp when consent was provided' },
  ],
  customers: [
    { name: 'customer_id',  pii: true, description: 'Unique identifier assigned to each customer in the system' },
    { name: 'first_name',   pii: true, description: "The customer's first name as provided during registration" },
    { name: 'last_name',    pii: true, description: "The customer's last name as provided during registration" },
    { name: 'email',        pii: true, description: 'Primary email address used for account login and order communication' },
    { name: 'phone_number', pii: true, description: "Customer's contact number used for delivery updates and support" },
    { name: 'date_of_birth',pii: true, description: "Customer's date of birth collected for age verification and personalisation" },
    { name: 'gender',       pii: true, description: "Customer's self-identified gender" },
  ],
  addresses: [
    { name: 'address_id', pii: false, description: 'Unique identifier for the address record' },
    { name: 'customer_id',pii: true,  description: 'Reference to the customer this address belongs to' },
    { name: 'street',     pii: true,  description: "Customer's street address" },
    { name: 'city',       pii: true,  description: 'City of residence' },
    { name: 'pincode',    pii: true,  description: 'Postal code for the address' },
  ],
};



const JSON_TEMPLATE = `{
  "type": "postgresql",
  "connection": {
    "host": "",
    "port": 5432,
    "database": "",
    "credentials": {
      "username": "",
      "password": ""
    }
  }
}`;

const piiBadgeCls    = 'inline-flex items-center px-[7px] py-[1px] bg-[rgba(30,112,112,0.12)] text-[#1e7070] text-[10px] font-bold rounded-full tracking-[0.4px] cursor-pointer flex-shrink-0';
const piiBadgeOffCls = 'inline-flex items-center px-[7px] py-[1px] bg-transparent text-[#9ca3af] text-[10px] font-bold rounded-full tracking-[0.4px] border border-dashed border-[#d1d5db] cursor-pointer flex-shrink-0';

// ── Tab: Basic Details ─────────────────────────────────────
export interface BasicDetailsValues {
  appName: string;
  name: string;
  primaryLang: string;
  secondaryLang: string;
  description: string;
  readWrite: boolean;
}

const BasicDetailsTab = forwardRef<
  { getValues: () => BasicDetailsValues },
  { sourceAppName?: string; sourceName: string; sourceDescription?: string; languages?: ApiLanguage[] }
>(({ sourceAppName = '', sourceName, sourceDescription = '', languages = [] }, ref) => {
  const [name, setName]               = useState(sourceName);
  const [primaryLang, setPrimaryLang] = useState('');
  const [secondaryLang, setSecond]    = useState('');
  const [description, setDesc]        = useState(sourceDescription);
  const [readWrite]                   = useState(true);

  useEffect(() => { if (sourceName)       setName(sourceName); },          [sourceName]);
  useEffect(() => { if (sourceDescription) setDesc(sourceDescription); },  [sourceDescription]);
  const langs = languages.length > 0
    ? languages.map(l => ({ value: l.id, label: l.name }))
    : [{ value: 'en', label: 'English' }, { value: 'hi', label: 'Hindi' }, { value: 'mr', label: 'Marathi' }];

  useImperativeHandle(ref, () => ({
    getValues: () => ({ appName: sourceAppName, name, primaryLang, secondaryLang, description, readWrite }),
  }));

  return (
    <div className="flex flex-col gap-4">
      <Input label="Name" required placeholder="Enter a name for your data source" value={name} onChange={e => setName(e.target.value)} />
      <div className="grid grid-cols-2 gap-4 max-[700px]:grid-cols-1">
        <Select label="Primary Language" options={langs} value={primaryLang} onChange={e => setPrimaryLang(e.target.value)} />
        <Select label="Secondary Language" placeholder="Select the secondary language" options={langs} value={secondaryLang} onChange={e => setSecond(e.target.value)} />
      </div>
      <Textarea label="Description" required value={description} onChange={e => setDesc(e.target.value)} rows={6} />
      <div>
        <p className="text-[14px] font-semibold text-[#374151] mb-1">Database Access Permissions <span className="text-[#ef4444]">*</span></p>
        <p className="text-[13px] text-[#9ca3af] mb-4 leading-[1.5]">To analyse your data and power DPDP compliance, NYAI needs certain permissions for this database. These permissions are used only for consent-related operations and nothing else.</p>
        <div className="w-1/2 pr-2">
          <div className="border-[1.5px] rounded-[8px] p-4 border-[#1e7070] bg-[rgba(30,112,112,0.04)] opacity-70 cursor-not-allowed">
            <Checkbox checked={true} onChange={() => {}} disabled label="Read Access" description="Required to scan tables and perform reconciliation." />
          </div>
        </div>
      </div>
    </div>
  );
});

// ── Tab: Connection Details ────────────────────────────────
type ConnectMode = 'details' | 'uri';

export interface ConnectionDetailsValues {
  host: string; port: string; username: string; password: string;
  dbName: string; sslEnabled: boolean; dialect: string;
}

const ConnectionDetailsTab = forwardRef<
  { getValues: () => ConnectionDetailsValues },
  { hostname?: string; port?: number; username?: string; databaseName?: string; sslEnabled?: boolean; dialect?: string; isEdit?: boolean; onSslChange?: (v: boolean) => void }
>(({ hostname = '', port: initPort, username: initUser = '', databaseName = '', sslEnabled: initSsl = false, dialect: initDialect = 'Postgres', isEdit = false, onSslChange }, ref) => {
  const [mode, setMode]           = useState<ConnectMode>('details');
  const [isJson, setIsJson]       = useState(false);
  const [host, setHost]           = useState(hostname);
  const [port, setPort]           = useState(initPort != null ? String(initPort) : '');
  const [username, setUsername]   = useState(initUser);
  // Password is never returned by the API — show a placeholder to indicate it is saved
  const [password, setPassword]   = useState('••••••••');
  const [dbName, setDbName]       = useState(databaseName);
  const [sslEnabled, setSslEnabled] = useState(initSsl);

  useEffect(() => { if (hostname)          setHost(hostname); },           [hostname]);
  useEffect(() => { if (initPort != null)  setPort(String(initPort)); },   [initPort]);
  useEffect(() => { if (initUser)          setUsername(initUser); },        [initUser]);
  useEffect(() => { if (databaseName)      setDbName(databaseName); },     [databaseName]);
  useEffect(() => { setSslEnabled(initSsl); onSslChange?.(initSsl); },     [initSsl]);

  useImperativeHandle(ref, () => ({
    getValues: () => ({ host, port, username, password, dbName, sslEnabled, dialect: initDialect }),
  }));
  const [uri, setUri]             = useState('');
  const [jsonValue, setJsonValue] = useState(JSON_TEMPLATE);
  const lineNumRef                = useRef<HTMLDivElement>(null);
  const textareaRef               = useRef<HTMLTextAreaElement>(null);
  const lineCount                 = jsonValue.split('\n').length;

  const handleScroll = () => {
    if (lineNumRef.current && textareaRef.current)
      lineNumRef.current.scrollTop = textareaRef.current.scrollTop;
  };

  const handleFormat = () => {
    try {
      setJsonValue(JSON.stringify(JSON.parse(jsonValue), null, 2));
    } catch { /* keep as-is */ }
  };

  const FileField: React.FC<{ label: string }> = ({ label }) => (
    <div style={{ marginBottom: 16 }}>
      <span style={{ fontSize: 14, color: '#374151', display: 'block', marginBottom: 6 }}>{label}</span>
      <div style={{ display: 'flex', border: '1px solid #e5e7eb', borderRadius: 6, overflow: 'hidden' }}>
        <textarea style={{ flex: 1, minHeight: 72, border: 'none', outline: 'none', padding: '8px 12px', fontFamily: 'inherit', fontSize: 14, resize: 'none' }} />
        <div style={{ width: 160, flexShrink: 0, borderLeft: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, padding: 12, cursor: 'pointer' }}>
          <span style={{ fontSize: 14, fontWeight: 600 }}>Upload File</span>
          <span style={{ fontSize: 12, color: '#9ca3af', textAlign: 'center' }}>Supported file types - .pem</span>
        </div>
      </div>
    </div>
  );

  const CertContent = () => {
    const [mode, setMode] = useState('verify-full');
    return (
      <div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16 }}>
          <Checkbox checked={sslEnabled} onChange={v => { setSslEnabled(v); onSslChange?.(v); }} label="SSL" />
          <div style={{ position: 'relative', display: 'flex' }}>
            <select style={{ height: 34, padding: '0 28px 0 12px', border: '1px solid #e5e7eb', borderRadius: 6, fontSize: 14, appearance: 'none', outline: 'none', cursor: 'pointer' }} value={mode} onChange={e => setMode(e.target.value)}>
              <option value="verify-full">Verify Full</option>
              <option value="verify-ca">Verify CA</option>
              <option value="require">Require</option>
              <option value="prefer">Prefer</option>
            </select>
            <ChevronDown size={14} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#9ca3af' }} />
          </div>
        </div>
        <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 12 }}>Client</p>
        <FileField label="Certificate" />
        <FileField label="Private Key" />
        <div style={{ marginBottom: 16 }}>
          <span style={{ fontSize: 14, display: 'block', marginBottom: 6 }}>Passphrase</span>
          <textarea style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: 6, padding: '8px 12px', resize: 'none', fontFamily: 'inherit', outline: 'none', minHeight: 72 }} />
        </div>
        <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 12 }}>Server</p>
        <FileField label="CA Certificate" />
      </div>
    );
  };

  const ProxyContent = () => {
    const [h, setH] = useState(''); const [p, setP] = useState('');
    const [u, setU] = useState(''); const [pw, setPw] = useState('');
    const [t, setT] = useState('');
    return (
      <div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <Input label="Host" placeholder="Enter the host" value={h} onChange={e => setH(e.target.value)} />
          <Input label="Port" placeholder="Enter the port" value={p} onChange={e => setP(e.target.value)} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <Input label="Username" placeholder="Enter the username" value={u} onChange={e => setU(e.target.value)} />
          <Input label="Password" type="password" placeholder="Enter the password" value={pw} onChange={e => setPw(e.target.value)} />
        </div>
        <div style={{ maxWidth: '50%' }}>
          <Input label="Type" placeholder="Enter the type" value={t} onChange={e => setT(e.target.value)} />
        </div>
      </div>
    );
  };

  const renderBody = () => {
    if (isJson) {
      return (
        <div style={{ display: 'flex', border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden', height: 360 }}>
          <div style={{ width: 240, flexShrink: 0, borderRight: '1px solid #e5e7eb', padding: 16, overflowY: 'auto' }}>
            <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 12 }}>Optional Details</p>
            {[{ label: 'Certificates', children: ['Client', 'Server'] }, { label: 'Database', children: [] }, { label: 'Proxy', children: [] }].map(g => (
              <div key={g.label} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 600, color: '#6b7280', borderBottom: '1px solid #e5e7eb', paddingBottom: 4, marginBottom: 4 }}>
                  <span>{g.label}</span>
                  {g.children.length === 0 && <button style={{ background: 'none', border: '1px solid #d1d5db', borderRadius: 4, width: 20, height: 20, cursor: 'pointer', fontSize: 15 }}>+</button>}
                </div>
                {g.children.map(c => (
                  <div key={c} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0 4px 16px', fontSize: 13 }}>
                    <span>{c}</span>
                    <button style={{ background: 'none', border: '1px solid #d1d5db', borderRadius: 4, width: 20, height: 20, cursor: 'pointer', fontSize: 15 }}>+</button>
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#1a1e2a', overflow: 'hidden' }}>
            <div style={{ flex: 1, display: 'flex', overflow: 'auto' }}>
              <div ref={lineNumRef} style={{ padding: '12px 8px 12px 12px', color: 'rgba(255,255,255,0.25)', font: '12px/1.65 Consolas,Monaco,monospace', textAlign: 'right', flexShrink: 0, borderRight: '1px solid rgba(255,255,255,0.08)', minWidth: 42, overflowY: 'hidden' }}>
                {Array.from({ length: lineCount }, (_, i) => <div key={i} style={{ height: '19.8px' }}>{String(i + 1).padStart(2, '0')}</div>)}
              </div>
              <textarea ref={textareaRef} value={jsonValue} onChange={e => setJsonValue(e.target.value)} onScroll={handleScroll} spellCheck={false} style={{ flex: 1, background: 'transparent', color: '#e2e8f0', border: 'none', outline: 'none', resize: 'none', font: '12px/1.65 Consolas,Monaco,monospace', padding: 12, caretColor: '#fff', whiteSpace: 'pre', overflow: 'auto' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, padding: '8px 12px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <button onClick={handleFormat} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 4, background: 'transparent', color: 'rgba(255,255,255,0.65)', fontSize: 12, cursor: 'pointer' }}><AlignLeft size={12} /> Format</button>
              <button style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 4, background: 'transparent', color: 'rgba(255,255,255,0.65)', fontSize: 12, cursor: 'pointer' }}><CheckCircle size={12} /> Validate</button>
            </div>
          </div>
        </div>
      );
    }

    if (mode === 'details') {
      return (
        <div>
          <p style={{ fontWeight: 600, fontSize: 14, color: '#374151', marginBottom: 16 }}>Required Details</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <Input label="Host" required placeholder="Enter the host" value={host} onChange={e => setHost(e.target.value)} />
            <Input label="Port" required placeholder="Enter the port" value={port} onChange={e => setPort(e.target.value)} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <Input label="Username" required placeholder="Enter the username" value={username} onChange={e => setUsername(e.target.value)} />
            <Input label="Password" required type="password" placeholder="Leave blank to keep saved password" value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          <Input label="Database Name" required placeholder="Enter a database name" value={dbName} onChange={e => setDbName(e.target.value)} disabled={isEdit} />
          <div style={{ marginTop: 8 }}>
            <p style={{ fontWeight: 600, fontSize: 14, color: '#374151', marginBottom: 8 }}>Optional Details</p>
            <Accordion title="Certificates"><CertContent /></Accordion>
            <Accordion title="Proxy"><ProxyContent /></Accordion>
          </div>
        </div>
      );
    }

    return (
      <div>
        <p style={{ fontWeight: 600, fontSize: 14, color: '#374151', marginBottom: 16 }}>Required Details</p>
        <Input label="Connection URI" required placeholder="Enter connection URI" value={uri} onChange={e => setUri(e.target.value)} />
        <div style={{ marginTop: 8 }}>
          <p style={{ fontWeight: 600, fontSize: 14, color: '#374151', marginBottom: 8 }}>Optional Details</p>
          <Accordion title="Certificates"><CertContent /></Accordion>
          <Accordion title="Proxy"><ProxyContent /></Accordion>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 20 }}>
          {(['details', 'uri'] as ConnectMode[]).map(m => (
            <label key={m} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14, fontWeight: mode === m ? 600 : 400 }}>
              <input type="radio" checked={mode === m} onChange={() => setMode(m)} style={{ accentColor: '#1e7070' }} />
              {m === 'details' ? 'Connect with details' : 'Connect with URI'}
            </label>
          ))}
        </div>
        <button onClick={() => setIsJson(v => !v)} style={{ background: 'none', border: 'none', color: '#1e7070', fontSize: 14, cursor: 'pointer', textDecoration: 'underline' }}>
          {isJson ? 'Switch to Form' : 'Switch to JSON'}
        </button>
      </div>
      {renderBody()}
    </div>
  );
});

// ── Tab: Database ──────────────────────────────────────────
interface ColData { id: string; name: string; description: string; dataCategories?: string[] | null; }
interface TableData { id: string; name: string; columns: ColData[]; }

export interface DatabaseTabHandle {
  getPiiPayload: () => { tableName: string; columns: string[] }[];
}

const DatabaseTab = forwardRef<DatabaseTabHandle, { sourceName: string; sourceId: string }>(({ sourceName, sourceId }, ref) => {
  const [dbName, setDbName]     = useState('');
  const [tables, setTables]     = useState<TableData[]>([]);
  const [activeId, setActiveId] = useState('');
  const [loading, setLoading]   = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [verifyMsg, setVerifyMsg] = useState<{ ok: boolean; text: string } | null>(null);
  // piiMap: `${tableId}__${colId}` → isPii
  const [piiMap, setPiiMap]     = useState<Record<string, boolean>>({});

  useImperativeHandle(ref, () => ({
    getPiiPayload: () => tables.map(t => ({
      tableName: t.name,
      columns: t.columns.filter(c => piiMap[`${t.id}__${c.id}`]).map(c => c.name),
    })),
  }));

  const buildFallback = () => {
    const ts: TableData[] = DB_TABLES.map(t => ({
      id: t.id,
      name: t.name,
      columns: (DB_COLUMNS[t.id] ?? []).map((c, i) => ({
        id: `${t.id}_${i}`,
        name: c.name,
        description: c.description,
      })),
    }));
    const init: Record<string, boolean> = {};
    for (const t of ts) {
      for (const c of t.columns) {
        const raw = (DB_COLUMNS[t.id] ?? []).find(r => r.name === c.name);
        init[`${t.id}__${c.id}`] = raw?.pii ?? false;
      }
    }
    return { ts, init };
  };

  useEffect(() => {
    if (!sourceId) {
      const { ts, init } = buildFallback();
      setTables(ts);
      setPiiMap(init);
      if (ts.length) setActiveId(ts[0].id);
      setLoading(false);
      return;
    }
    setLoading(true);
    api.getPiiColumns(sourceId)
      .then(res => {
        const objects = res.dataObjects ?? [];
        setDbName(res.databaseName ?? '');
        if (objects.length) {
          const ts: TableData[] = objects.map(o => ({
            id: o.id,
            name: o.name,
            columns: o.attributes.map(a => ({
              id: a.id,
              name: a.name,
              description: DB_COLUMNS[o.name]?.find(c => c.name === a.name)?.description ?? '',
              dataCategories: a.dataCategories ?? null,
            })),
          }));
          setTables(ts);
          const init: Record<string, boolean> = {};
          for (const t of ts) {
            for (const c of t.columns) {
              const attr = objects.find(o => o.id === t.id)?.attributes.find(a => a.id === c.id);
              init[`${t.id}__${c.id}`] = attr?.isPii ?? attr?.pii ?? attr?.is_pii ?? true;
            }
          }
          setPiiMap(init);
          setActiveId(ts[0].id);
        } else {
          const { ts, init } = buildFallback();
          setTables(ts);
          setPiiMap(init);
          if (ts.length) setActiveId(ts[0].id);
        }
      })
      .catch(() => {
        const { ts, init } = buildFallback();
        setTables(ts);
        setPiiMap(init);
        if (ts.length) setActiveId(ts[0].id);
      })
      .finally(() => setLoading(false));
  }, [sourceId]);

  const togglePii = (tableId: string, colId: string) => {
    const key = `${tableId}__${colId}`;
    setPiiMap(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleVerify = async () => {
    if (!sourceId) return;
    setVerifying(true);
    setVerifyMsg(null);
    try {
      await api.processMetadata(sourceId, {
        tables: tables.map(t => ({
          tableName: t.name,
          columns: t.columns.filter(c => piiMap[`${t.id}__${c.id}`]).map(c => c.name),
        })),
        operations: ['PII'],
      });
      setVerifyMsg({ ok: true, text: 'Scan queued successfully' });
    } catch {
      setVerifyMsg({ ok: false, text: 'PII scan failed. Please try again.' });
    } finally {
      setVerifying(false);
    }
  };

  const activeTable  = tables.find(t => t.id === activeId);
  const activeCols   = activeTable?.columns ?? [];
  const displayName  = dbName || sourceName;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <span className="text-[14px] text-[#374151]">Database: <strong>{displayName}</strong></span>
        <div className="flex items-center gap-[10px]">
          {verifyMsg && (
            <span className={`text-[13px] ${verifyMsg.ok ? 'text-[#16a34a]' : 'text-[#dc2626]'}`}>
              {verifyMsg.text}
            </span>
          )}
          <Button variant="secondary" size="sm" onClick={handleVerify} disabled={verifying || loading}>
            <Check size={14} /> {verifying ? 'Scanning…' : 'Scan'}
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="p-10 text-center text-[#6b7280] text-[14px]">Loading schema…</div>
      ) : (
        <div className="flex border border-[#b8c1d3] rounded-[8px] overflow-hidden min-h-[340px]">
          {/* Left: table list */}
          <div className="w-[260px] flex-shrink-0 border-r border-[#b8c1d3] overflow-y-auto">
            <div className="text-[13px] font-semibold text-[#374151] px-4 py-3 bg-[#f1f5f9] border-b border-[#b8c1d3] sticky top-0">Tables</div>
            {tables.map(t => {
              const piiCount = t.columns.filter(c => piiMap[`${t.id}__${c.id}`]).length;
              return (
                <button
                  key={t.id}
                  type="button"
                  className={`flex items-center gap-2 w-full px-4 py-3 border-none border-b border-[#b8c1d3] bg-white text-[14px] text-[#374151] cursor-pointer text-left transition-all last:border-b-0 hover:bg-[#f1f5f9] ${t.id === activeId ? 'bg-[rgba(30,112,112,0.06)]' : ''}`}
                  onClick={() => setActiveId(t.id)}
                >
                  {piiCount > 0 && <span className={piiBadgeCls}>PII</span>}
                  <span className="flex-1 font-medium">{t.name}</span>
                  {t.id === activeId && <ChevronRight size={16} className="text-[#1e7070] flex-shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Right: columns + description + clickable PII badge */}
          <div className="flex-1 overflow-y-auto">
            <div className="grid [grid-template-columns:1fr_1.5fr] px-5 py-3 bg-[#f1f5f9] border-b border-[#b8c1d3] text-[13px] font-semibold text-[#374151] sticky top-0">
              <span>Columns</span>
              <span>Data Categories</span>
            </div>
            {activeCols.length === 0 ? (
              <div className="px-4 py-8 text-center text-[#6b7280] text-[13px]">
                No columns found. Click Scan to scan for PII.
              </div>
            ) : activeCols.map(col => {
              const key   = `${activeId}__${col.id}`;
              const isPii = piiMap[key] ?? false;
              return (
                <div key={col.id} className="grid [grid-template-columns:1fr_1.5fr] items-center min-h-[52px] px-5 py-3 border-b border-[#b8c1d3] text-[14px] text-[#374151] last:border-b-0 hover:bg-[#f1f5f9]">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      title={isPii ? 'Click to remove PII tag' : 'Click to mark as PII'}
                      onClick={() => togglePii(activeId, col.id)}
                      className={isPii ? piiBadgeCls : piiBadgeOffCls}
                    >
                      PII
                    </button>
                    <span>{col.name}</span>
                  </div>
                  <span className="text-[#9ca3af] text-[13px]">
                    {col.dataCategories && col.dataCategories.length > 0
                      ? col.dataCategories.map(cat => (
                          <span key={cat} className="inline-block mr-1 mb-1 px-[7px] py-[1px] bg-[#f1f5f9] text-[#374151] text-[11px] rounded-full border border-[#e5e7eb]">{cat}</span>
                        ))
                      : '—'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
});

// ── Main Edit Page ─────────────────────────────────────────
const TABS = [
  { id: 'basic',      label: 'Basic Details'      },
  { id: 'connection', label: 'Connection Details'  },
  { id: 'database',   label: 'Database'            },
];

export const DataSourceEdit: React.FC = () => {
  const navigate = useNavigate();
  const { id }   = useParams<{ id: string }>();
  const location = useLocation();
  const listRow  = (location.state as { listRow?: DataSource } | null)?.listRow;

  const [activeTab, setActiveTab]       = useState<Tab>('basic');
  const [ds, setDs]                     = useState<ApiDataSourceDetail | null>(null);
  const [loadingDs, setLoadingDs]       = useState(true);
  const [loadErr, setLoadErr]           = useState<string | null>(null);
  const [saving, setSaving]             = useState(false);
  const [saveMsg, setSaveMsg]           = useState<{ ok: boolean; text: string } | null>(null);
  const [languages, setLanguages]       = useState<ApiLanguage[]>([]);
  const [connSslChecked, setConnSslChecked] = useState(false);

  const basicRef = useRef<{ getValues: () => BasicDetailsValues }>(null);
  const connRef  = useRef<{ getValues: () => ConnectionDetailsValues }>(null);
  const dbRef    = useRef<DatabaseTabHandle>(null);

  const fetchDs = () => {
    if (!id) { setLoadingDs(false); return; }
    setLoadingDs(true);
    setLoadErr(null);
    api.getDataSource(id)
      .then(res => { setDs(res); })
      .catch(() => setLoadErr('Failed to load data source. Please retry.'))
      .finally(() => setLoadingDs(false));
  };

  useEffect(() => {
    fetchDs();
    api.listLanguages().then(setLanguages).catch(() => {});
  }, [id]);

  useEffect(() => {
    if (!ds) return;
    const ssl = (ds as unknown as Record<string,unknown>);
    setConnSslChecked(
      (ds.sslEnabled ?? (ssl['ssl_enabled'] as boolean) ?? (ssl['ssl'] as boolean)) === true
    );
  }, [ds]);

  // Save Basic Details then advance to Connection tab
  const handleSaveBasic = async () => {
    if (!id) return;
    setSaving(true);
    setSaveMsg(null);
    try {
      const basic = basicRef.current?.getValues();
      await api.updateDataSource(id, {
        operation: 'BasicDetails',
        name: basic?.name ?? '',
        description: basic?.description,
      });
      setActiveTab('connection');
    } catch {
      setSaveMsg({ ok: false, text: 'Failed to save. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  // Save Connection Details then advance to Database tab
  const handleSaveConnection = async () => {
    if (!id) return;
    setSaving(true);
    setSaveMsg(null);
    try {
      const conn = connRef.current?.getValues();
      if (!conn) throw new Error('no conn ref');
      await api.updateDataSource(id, {
        operation: 'ConnectionDetails',
        connectionDetails: {
          dialect:           conn.dialect,
          databaseName:      conn.dbName,
          username:          conn.username,
          password:          conn.password,
          passwordEncrypted: false,
          hostname:          conn.host,
          port:              Number(conn.port) || 5432,
          sslEnabled:        conn.sslEnabled,
        },
      });
      setActiveTab('database');
    } catch {
      setSaveMsg({ ok: false, text: 'Failed to save connection. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  // Database tab: just navigate back — Scan button already handled PII
  const handleSaveDatabase = () => {
    navigate('/data-sources');
  };

  const handleSave = () => {
    if (activeTab === 'basic')      return handleSaveBasic();
    if (activeTab === 'connection') return handleSaveConnection();
    return handleSaveDatabase();
  };

  const SAVE_LABELS: Record<Tab, string> = {
    basic:      'Save & Next',
    connection: 'Save & Next',
    database:   'Save & Connect',
  };

  // Merge: prefer detail API response, fall back to list row data we already have
  const sourceAppName = ds?.app_name ?? ds?.appName ?? listRow?.appName ?? '';
  const sourceName    = ds?.name     ?? listRow?.name ?? '';
  const sourceDesc    = ds?.description ?? '';
  const dsRaw = ds as unknown as Record<string,unknown>;
  const connHostname  = ds?.hostname ?? ds?.host ?? dsRaw?.['host_name'] as string ?? '';
  const connPort      = ds?.port     ?? dsRaw?.['db_port'] as number;
  const connUsername  = ds?.username ?? ds?.user ?? dsRaw?.['user_name'] as string ?? '';
  const connDatabase  = ds?.databaseName ?? ds?.database_name ?? ds?.database ?? dsRaw?.['db_name'] as string ?? '';
  const connSsl       = ds?.sslEnabled ?? ds?.ssl_enabled ?? ds?.ssl ?? false;
  const connDialect   = ds?.dialect ?? dsRaw?.['dialect'] as string ?? 'Postgres';

  if (loadingDs) {
    return <div className="p-10 text-center text-[#6b7280] text-[14px]">Loading…</div>;
  }

  const loadErrBanner = loadErr ? (
    <div className="mx-6 mb-4 px-[14px] py-[10px] bg-[#fef2f2] border border-[#fecaca] rounded-[6px] flex items-center justify-between gap-3 text-[13px]">
      <span className="text-[#dc2626]">{loadErr} You can still edit and save below.</span>
      <button onClick={fetchDs} className="flex-shrink-0 px-[10px] py-1 border border-[#dc2626] rounded-[4px] bg-white text-[#dc2626] text-[12px] cursor-pointer">Retry</button>
    </div>
  ) : null;

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Tab bar */}
      <div className="flex px-6 border-b border-[#b8c1d3] flex-shrink-0">
        {TABS.map(t => (
          <button
            key={t.id}
            type="button"
            className={`px-4 py-3 border-none border-b-2 -mb-px bg-transparent text-[14px] cursor-pointer transition-all ${
              activeTab === t.id
                ? 'text-[#374151] font-semibold'
                : 'text-[#9ca3af] border-b-transparent hover:text-[#374151]'
            }`}
            style={{ borderBottomColor: activeTab === t.id ? '#1e7070' : 'transparent' }}
            onClick={() => { setSaveMsg(null); setActiveTab(t.id as Tab); }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loadErrBanner}

      {/* key remounts tabs with correct initial values when API data arrives */}
      <div className="flex-1 overflow-y-auto p-6" key={ds?.id ?? listRow?.id ?? 'empty'}>
        <div style={{ display: activeTab === 'basic'      ? undefined : 'none' }}>
          <BasicDetailsTab ref={basicRef} sourceAppName={sourceAppName} sourceName={sourceName} sourceDescription={sourceDesc} languages={languages} />
        </div>
        <div style={{ display: activeTab === 'connection' ? undefined : 'none' }}>
          <ConnectionDetailsTab ref={connRef} hostname={connHostname} port={connPort} username={connUsername} databaseName={connDatabase} sslEnabled={connSsl} dialect={connDialect} isEdit={true} onSslChange={setConnSslChecked} />
        </div>
        <div style={{ display: activeTab === 'database'   ? undefined : 'none' }}>
          <DatabaseTab ref={dbRef} sourceName={sourceName} sourceId={id ?? ''} />
        </div>
      </div>

      <div className="flex justify-end items-center gap-3 px-6 py-4 flex-shrink-0">
        {saveMsg && (
          <span className={`text-[13px] mr-auto ${saveMsg.ok ? 'text-[#16a34a]' : 'text-[#dc2626]'}`}>
            {saveMsg.text}
          </span>
        )}
        <Button variant="secondary" onClick={() => navigate('/data-sources')} disabled={saving}>Cancel</Button>
        <Button onClick={handleSave} disabled={saving || (activeTab === 'connection' && !connSslChecked)}>
          {saving ? 'Saving…' : SAVE_LABELS[activeTab]}
        </Button>
      </div>
    </div>
  );
};
