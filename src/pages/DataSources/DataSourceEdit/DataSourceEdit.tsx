import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { api, type PiiDataObject, type ApiDataSourceDetail } from '../../../lib/api';
import type { DataSource } from '../../../types/types';
import { AlignLeft, CheckCircle, ChevronDown, ChevronRight, Search, Plus, Download, Edit2, MoreVertical, Check, Filter } from 'lucide-react';
import { Button, Input, Textarea, Select, Checkbox, Accordion } from '../../../components/Components';
import { CreateConsentModal, type PurposeEntry } from './CreateConsentModal/CreateConsentModal';
import styles from './DataSourceEdit.module.scss';

// ── Types ──────────────────────────────────────────────────
type Tab = 'basic' | 'connection' | 'database';

// ── Mock data ──────────────────────────────────────────────
const MOCK_SOURCES: Record<string, { name: string; primaryLang: string; secondaryLang: string; description: string }> = {
  default: {
    name: 'Customer Checkout Data',
    primaryLang: 'en',
    secondaryLang: '',
    description: 'Contains personal data collected from Data Principals during the checkout and order placement process on the platform. This includes identifying information such as full name, email address, and phone number, along with billing and shipping addresses, payment method details, and order history. This data was collected for the purpose of processing purchases, fulfilling delivery of goods, and managing payment transactions. Consent was obtained at the point of checkout prior to order confirmation.',
  },
};

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

interface FullNotice {
  id: string;
  name: string;
  table: string;
  createdOn: string;
  status: string;
  columns: string[];
  purposes: PurposeEntry[];
}

const DEFAULT_PURPOSES: PurposeEntry[] = [
  { purpose: 'Order Processing and Fulfillment', retention: '1', unit: 'Year(s)',  categories: ['Full Name', 'Email', 'Phone Number', 'Date of Birth'] },
  { purpose: 'Billing and Payment',              retention: '6', unit: 'Month(s)', categories: ['Billing Address', 'Payment Method'] },
  { purpose: 'Delivery of Goods',                retention: '6', unit: 'Month(s)', categories: ['Shipping Address', 'City', 'Pincode'] },
];

const DEFAULT_COLUMNS = ['Full Name', 'Email', 'Phone Number', 'Date of Birth'];

const fmtRetention = (retention: string, unit: string) => {
  const base = unit.replace('(s)', '');          // "Year(s)" → "Year"
  const n    = Number(retention);
  return `${retention} ${n === 1 ? base : base + 's'}`; // "1 Year" / "6 Months"
};

const CONSENT_NOTICES: FullNotice[] = [
  { id: '1', name: 'Customer Checkout Notice', table: 'Customers', createdOn: '02 Mar 2026, 18:42', status: 'Active',  columns: DEFAULT_COLUMNS, purposes: DEFAULT_PURPOSES },
  { id: '2', name: 'Order History Notice',      table: 'Orders',   createdOn: '02 Mar 2026, 18:42', status: 'Draft',   columns: [], purposes: [] },
  { id: '3', name: 'Address Book Notice',       table: 'Customer', createdOn: '02 Mar 2026, 18:42', status: 'Active',  columns: [], purposes: [] },
  { id: '4', name: 'App Registration Notice',   table: 'Customers',createdOn: '02 Mar 2026, 18:42', status: 'Pending', columns: [], purposes: [] },
  { id: '5', name: 'Loyalty Program Notice',    table: 'Customers',createdOn: '02 Mar 2026, 18:42', status: 'Draft',   columns: [], purposes: [] },
];

const LANGS = [
  { value: 'en', label: 'English' },
  { value: 'hi', label: 'Hindi'   },
  { value: 'mr', label: 'Marathi' },
];

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

// ── Shared ──────────────────────────────────────────────────
const PiiBadge = () => <span className={styles.piiBadge}>PII</span>;

// ── Tab: Basic Details ─────────────────────────────────────
export interface BasicDetailsValues {
  appName: string;
  name: string;
  primaryLang: string;
  secondaryLang: string;
  description: string;
  readWrite: boolean;
  alter: boolean;
}

const BasicDetailsTab = forwardRef<
  { getValues: () => BasicDetailsValues },
  { sourceAppName?: string; sourceName: string; sourceDescription?: string }
>(({ sourceAppName = '', sourceName, sourceDescription = '' }, ref) => {
  const [appName, setAppName]         = useState(sourceAppName);
  const [name, setName]               = useState(sourceName);
  const [primaryLang, setPrimaryLang] = useState('en');
  const [secondaryLang, setSecond]    = useState('');
  const [description, setDesc]        = useState(sourceDescription);
  const [readWrite, setReadWrite] = useState(true);
  const [alter, setAlter]         = useState(false);

  useImperativeHandle(ref, () => ({
    getValues: () => ({ appName, name, primaryLang, secondaryLang, description, readWrite, alter }),
  }));

  return (
    <div className={styles.form}>
      <div className={styles.row}>
        <Input label="App Name" required placeholder="Enter the app name (e.g. MDM)" value={appName} onChange={e => setAppName(e.target.value)} />
        <Input label="Name" required placeholder="Enter a name for your data source" value={name} onChange={e => setName(e.target.value)} />
      </div>
      <div className={styles.row}>
        <Select label="Primary Language" options={LANGS} value={primaryLang} onChange={e => setPrimaryLang(e.target.value)} />
        <Select label="Secondary Language" placeholder="Select the secondary language" options={LANGS} value={secondaryLang} onChange={e => setSecond(e.target.value)} />
      </div>
      <Textarea label="Description" required value={description} onChange={e => setDesc(e.target.value)} rows={6} />
      <div>
        <p className={styles.sectionTitle}>Database Access Permissions <span style={{ color: '#ef4444' }}>*</span></p>
        <p className={styles.sectionDesc}>To analyse your data and power DPDP compliance, NYAI needs certain permissions for this database. These permissions are used only for consent-related operations and nothing else.</p>
        <div className={styles.permGrid}>
          <div className={`${styles.permCard} ${readWrite ? styles.permSelected : ''}`}>
            <Checkbox checked={readWrite} onChange={setReadWrite} label="Read & Write Access" description="Required to scan tables and identify PII columns." />
          </div>
          <div className={`${styles.permCard} ${alter ? styles.permSelected : ''}`}>
            <Checkbox checked={alter} onChange={setAlter} label="Read, Write & Alter Access" description="Allows NYAI to store consent records directly in your database." />
          </div>
        </div>
      </div>
    </div>
  );
});

// ── Tab: Connection Details ────────────────────────────────
type ConnectMode = 'details' | 'uri';

const ConnectionDetailsTab: React.FC<{
  hostname?: string; port?: number; username?: string;
  databaseName?: string; sslEnabled?: boolean;
}> = ({ hostname = '', port: initPort, username: initUser = '', databaseName = '', sslEnabled = false }) => {
  const [mode, setMode]           = useState<ConnectMode>('details');
  const [isJson, setIsJson]       = useState(false);
  const [host, setHost]           = useState(hostname);
  const [port, setPort]           = useState(initPort != null ? String(initPort) : '');
  const [username, setUsername]   = useState(initUser);
  const [password, setPassword]   = useState('');
  const [dbName, setDbName]       = useState(databaseName);
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
    const [ssl, setSsl] = useState(true);
    const [mode, setMode] = useState('verify-full');
    return (
      <div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16 }}>
          <Checkbox checked={ssl} onChange={setSsl} label="SSL" />
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
            <Input label="Password" required type="password" placeholder="Enter the password" value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          <Input label="Database Name" required placeholder="Enter a database name" value={dbName} onChange={e => setDbName(e.target.value)} />
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
};

// ── Tab: Database ──────────────────────────────────────────
interface ColData { id: string; name: string; description: string; }
interface TableData { id: string; name: string; columns: ColData[]; }

const DatabaseTab: React.FC<{ sourceName: string; sourceId: string }> = ({ sourceName, sourceId }) => {
  const [dbName, setDbName]     = useState('');
  const [tables, setTables]     = useState<TableData[]>([]);
  const [activeId, setActiveId] = useState('');
  const [loading, setLoading]   = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [verifyMsg, setVerifyMsg] = useState<{ ok: boolean; text: string } | null>(null);
  // piiMap: `${tableId}__${colId}` → isPii
  const [piiMap, setPiiMap]     = useState<Record<string, boolean>>({});

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
      setVerifyMsg({ ok: true, text: 'PII scan queued' });
    } catch (err) {
      setVerifyMsg({ ok: false, text: err instanceof Error ? err.message : 'Scan failed' });
    } finally {
      setVerifying(false);
    }
  };

  const activeTable   = tables.find(t => t.id === activeId);
  const activeCols    = activeTable?.columns ?? [];
  const displayName   = dbName || sourceName;

  return (
    <div>
      <div className={styles.dbTopBar}>
        <span className={styles.dbTitle}>Database: <strong>{displayName}</strong></span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {verifyMsg && (
            <span style={{ fontSize: 13, color: verifyMsg.ok ? '#16a34a' : '#dc2626' }}>
              {verifyMsg.text}
            </span>
          )}
          <Button variant="secondary" size="sm" onClick={handleVerify} disabled={verifying || loading}>
            <Check size={14} /> {verifying ? 'Scanning…' : 'Verify'}
          </Button>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280', fontSize: 14 }}>Loading schema…</div>
      ) : (
        <div className={styles.dbLayout}>
          {/* Left: table list */}
          <div className={styles.tablePanel}>
            <div className={styles.tablePanelHead}>Tables</div>
            {tables.map(t => {
              const piiCount = t.columns.filter(c => piiMap[`${t.id}__${c.id}`]).length;
              return (
                <button
                  key={t.id}
                  type="button"
                  className={`${styles.tableItem} ${t.id === activeId ? styles.tableItemActive : ''}`}
                  onClick={() => setActiveId(t.id)}
                >
                  {piiCount > 0 && <span className={styles.piiBadge}>PII</span>}
                  <span className={styles.tableName}>{t.name}</span>
                  {t.id === activeId && <ChevronRight size={16} className={styles.tableChevron} />}
                </button>
              );
            })}
          </div>

          {/* Right: columns + description + clickable PII badge */}
          <div className={styles.colPanel}>
            <div className={styles.colHead}>
              <span>Columns</span>
              <span>Description</span>
            </div>
            {activeCols.length === 0 ? (
              <div style={{ padding: '32px 16px', textAlign: 'center', color: '#6b7280', fontSize: 13 }}>
                No columns found. Click Verify to scan for PII.
              </div>
            ) : activeCols.map(col => {
              const key   = `${activeId}__${col.id}`;
              const isPii = piiMap[key] ?? false;
              return (
                <div key={col.id} className={styles.colRow}>
                  <div className={styles.colName}>
                    <button
                      type="button"
                      title={isPii ? 'Click to remove PII tag' : 'Click to mark as PII'}
                      onClick={() => togglePii(activeId, col.id)}
                      style={{
                        display: 'inline-flex', alignItems: 'center',
                        padding: '1px 8px', borderRadius: 20,
                        border: isPii ? 'none' : '1px dashed #d1d5db',
                        background: isPii ? undefined : 'transparent',
                        cursor: 'pointer', flexShrink: 0,
                        fontFamily: 'inherit',
                      }}
                      className={isPii ? styles.piiBadge : styles.piiBadgeOff}
                    >
                      PII
                    </button>
                    <span>{col.name}</span>
                  </div>
                  <span className={styles.colDesc}>{col.description}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// ── Tab: Consent Notice ────────────────────────────────────
const ConsentNoticeTab: React.FC = () => {
  const [view, setView]               = useState<'list' | 'preview'>('list');
  const [search, setSearch]           = useState('');
  const [checkedRows, setCheckedRows] = useState<Set<number>>(new Set());
  const [showModal, setShowModal]     = useState(false);
  const [approveStatus, setApproveStatus] = useState<'idle' | 'approved' | 'approved-email'>('idle');
  const [notices, setNotices]         = useState<FullNotice[]>(CONSENT_NOTICES);
  const [previewNotice, setPreviewNotice] = useState<FullNotice | null>(null);

  const toggleRow = (i: number) =>
    setCheckedRows(prev => { const n = new Set(prev); n.has(i) ? n.delete(i) : n.add(i); return n; });

  const filtered = notices.filter(n => n.name.toLowerCase().includes(search.toLowerCase()));

  const handleGenerate = (name: string, table: string, columns: string[], purposes: PurposeEntry[]) => {
    const now = new Date();
    const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const createdOn = `${String(now.getDate()).padStart(2,'0')} ${MONTHS[now.getMonth()]} ${now.getFullYear()}, ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
    const newNotice: FullNotice = {
      id: String(notices.length + 1),
      name,
      table: DB_TABLES.find(t => t.id === table)?.name ?? table,
      createdOn,
      status: 'Draft',
      columns,
      purposes,
    };
    setNotices(prev => [...prev, newNotice]);
    setPreviewNotice(newNotice);
    setApproveStatus('idle');
    setCheckedRows(new Set());
    setView('preview');
  };

  const openPreview = (notice: FullNotice) => {
    setPreviewNotice(notice);
    setApproveStatus('idle');
    setCheckedRows(new Set());
    setView('preview');
  };

  /* ── Preview ── */
  if (view === 'preview' && previewNotice) {
    const purposes = previewNotice.purposes.length > 0 ? previewNotice.purposes : DEFAULT_PURPOSES;
    const cols     = previewNotice.columns.length > 0  ? previewNotice.columns  : DEFAULT_COLUMNS;

    return (
      <div className={styles.previewWrap}>
        <div className={styles.previewTopBar}>
          <span className={styles.previewHeading}>Consent Notice Preview</span>
          <div className={styles.previewBtns}>
            <button className={styles.previewBtn} type="button"><Edit2 size={14} /> Edit</button>
            <button className={styles.previewBtn} type="button"><Download size={14} /> Download</button>
          </div>
        </div>

        <div className={styles.noticeCard}>
          <h2 className={styles.noticeTitle}>Customer Privacy Notice</h2>
          <p className={styles.noticeIntro}>
            We process your personal data only when it is necessary to provide our services to you. By selecting "Accept All" or "Accept Selected", you consent to the processing of your personal data for the purposes listed below.
          </p>

          <table className={styles.purposeTable}>
            <thead>
              <tr>
                <th className={styles.purposeTh} style={{ width: 40 }}></th>
                <th className={styles.purposeTh}>Purpose</th>
                <th className={styles.purposeTh}>Data Categories</th>
                <th className={styles.purposeTh}>Retention Period</th>
              </tr>
            </thead>
            <tbody>
              {purposes.map((p, i) => {
                const cats = p.categories && p.categories.length > 0 ? p.categories : cols;
                return (
                  <tr key={i} className={styles.purposeTr}>
                    <td className={styles.purposeTd}>
                      <Checkbox checked={checkedRows.has(i)} onChange={() => toggleRow(i)} />
                    </td>
                    <td className={styles.purposeTd}><strong>{p.purpose}</strong></td>
                    <td className={styles.purposeTd}>
                      <div className={styles.categoryList}>
                        {cats.map(c => <span key={c} className={styles.categoryTag}>• {c}</span>)}
                      </div>
                    </td>
                    <td className={styles.purposeTd}>{fmtRetention(p.retention, p.unit)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <p className={styles.noticeFooter}>
            To manage your consent or to submit a grievance on how we process your data, contact us at <a href="mailto:privacy@kothrudstore.com">privacy@kothrudstore.com</a>.
          </p>
          <p className={styles.noticeFooter}>
            You can also submit your complaints to the Data Protection Board of India by e-mailing <a href="mailto:dpb@gov.in">dpb@gov.in</a>.
          </p>

          <div className={styles.noticeCardActions}>
            <button className={styles.cancelTxt} type="button">Decline</button>
            <Button variant="secondary" size="sm">Accept Selected</Button>
            <Button size="sm">Accept All</Button>
          </div>
        </div>

        <div className={styles.previewBottom}>
          <button className={styles.backTxt} type="button" onClick={() => setView('list')}>Back</button>
          <div className={styles.previewBottomRight}>
            {approveStatus !== 'idle' && (
              <span className={styles.approveSuccess}>
                <CheckCircle size={16} />
                {approveStatus === 'approved-email' ? 'Approved & email sent' : 'Consent notice approved'}
              </span>
            )}
            <Button
              variant="secondary"
              disabled={approveStatus !== 'idle'}
              onClick={() => setApproveStatus('approved')}
            >
              {approveStatus !== 'idle' ? 'Approved' : 'Approve'}
            </Button>
            <Button
              disabled={approveStatus !== 'idle'}
              onClick={() => setApproveStatus('approved-email')}
            >
              {approveStatus === 'approved-email' ? 'Email Sent' : 'Approve & Send Email'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  /* ── List ── */
  return (
    <div>
      {showModal && (
        <CreateConsentModal
          onClose={() => setShowModal(false)}
          onGenerate={handleGenerate}
          tables={DB_TABLES}
          columns={DB_COLUMNS}
        />
      )}
      <div className={styles.consentBar}>
        <div className={styles.consentSearch}>
          <Search size={15} className={styles.searchIcon} />
          <input
            className={styles.searchInput}
            placeholder="Search"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button
            type="button"
            style={{ display: 'flex', alignItems: 'center', gap: 6, height: 32, padding: '0 12px', border: '1px solid #e5e7eb', borderRadius: 6, background: '#fff', fontSize: 13, color: '#6b7280', cursor: 'pointer' }}
          >
            <Filter size={14} /> Filter
          </button>
          <Button size="sm" onClick={() => setShowModal(true)}>
            <Plus size={14} /> New Consent Notice
          </Button>
        </div>
      </div>

      <table className={styles.consentTable}>
        <thead>
          <tr>
            <th className={styles.consentTh}>Name <span className={styles.sortArrow}>⇅</span></th>
            <th className={styles.consentTh}>Table <span className={styles.sortArrow}>⇅</span></th>
            <th className={styles.consentTh}>Status <span className={styles.sortArrow}>⇅</span></th>
            <th className={styles.consentTh}>Created On <span className={styles.sortArrow}>⇅</span></th>
            <th className={styles.consentTh} style={{ width: 48 }}></th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(n => (
            <tr key={n.id} className={styles.consentTr} onClick={() => openPreview(n)}>
              <td className={styles.consentTd}>{n.name}</td>
              <td className={styles.consentTd}>{n.table}</td>
              <td className={styles.consentTd}>
                <span className={`${styles.statusBadge} ${styles[`status${n.status}`]}`}>{n.status}</span>
              </td>
              <td className={styles.consentTd}>{n.createdOn}</td>
              <td className={styles.consentTd}>
                <button className={styles.menuBtn} type="button" onClick={e => e.stopPropagation()}>
                  <MoreVertical size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// ── Main Edit Page ─────────────────────────────────────────
const TABS = [
  { id: 'basic',      label: 'Basic Details'      },
  { id: 'connection', label: 'Connection Details'  },
  { id: 'database',   label: 'Database'            },
];

export const DataSourceEdit: React.FC = () => {
  const navigate    = useNavigate();
  const { id }      = useParams<{ id: string }>();
  const location    = useLocation();
  const listRow     = (location.state as { listRow?: DataSource } | null)?.listRow;
  const [activeTab, setActiveTab] = useState<Tab>('basic');
  const [ds, setDs]               = useState<ApiDataSourceDetail | null>(null);
  const [loadingDs, setLoadingDs] = useState(true);
  const [loadErr, setLoadErr]     = useState<string | null>(null);
  const [saving, setSaving]       = useState(false);
  const [saveMsg, setSaveMsg]     = useState<{ ok: boolean; text: string } | null>(null);
  const basicRef = useRef<{ getValues: () => BasicDetailsValues }>(null);

  const fetchDs = () => {
    if (!id) { setLoadingDs(false); return; }
    setLoadingDs(true);
    setLoadErr(null);
    api.getDataSource(id)
      .then(res => { console.log('[DataSourceEdit] API response:', res); setDs(res); })
      .catch(err => {
        const msg = err instanceof Error ? err.message : 'Failed to load data source';
        console.error('[DataSourceEdit] getDataSource failed:', err);
        setLoadErr(msg);
      })
      .finally(() => setLoadingDs(false));
  };

  useEffect(() => { fetchDs(); }, [id]);

  const handleSave = async () => {
    if (!id) return;
    setSaving(true);
    setSaveMsg(null);
    try {
      const basic = basicRef.current?.getValues();
      await api.updateDataSource(id, {
        appName:     basic?.appName,
        name:        basic?.name,
        description: basic?.description,
      });
      setSaveMsg({ ok: true, text: 'Changes saved' });
    } catch (err) {
      setSaveMsg({ ok: false, text: err instanceof Error ? err.message : 'Save failed' });
    } finally {
      setSaving(false);
    }
  };

  // Merge: prefer detail API response, fall back to list row data we already have
  const sourceAppName  = ds?.app_name    ?? ds?.appName  ?? listRow?.appName ?? '';
  const sourceName     = ds?.name        ??                 listRow?.name    ?? '';
  const sourceDesc     = ds?.description ?? '';
  const connHostname   = ds?.hostname    ?? ds?.host         ?? '';
  const connPort       = ds?.port;
  const connUsername   = ds?.username    ?? ds?.user         ?? '';
  const connDatabase   = ds?.databaseName ?? ds?.database_name ?? ds?.database   ?? '';
  const connSsl        = ds?.sslEnabled  ?? ds?.ssl_enabled  ?? ds?.ssl           ?? false;

  if (loadingDs) {
    return <div style={{ padding: 40, textAlign: 'center', color: '#6b7280', fontSize: 14 }}>Loading…</div>;
  }

  const loadErrBanner = loadErr ? (
    <div style={{ margin: '0 24px 16px', padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, fontSize: 13 }}>
      <span style={{ color: '#dc2626' }}>Could not load data — {loadErr}. You can still edit and save below.</span>
      <button onClick={fetchDs} style={{ flexShrink: 0, padding: '4px 10px', border: '1px solid #dc2626', borderRadius: 4, background: 'white', color: '#dc2626', fontSize: 12, cursor: 'pointer' }}>Retry</button>
    </div>
  ) : null;

  return (
    <div className={styles.page}>
      {/* Tab bar */}
      <div className={styles.tabBar}>
        {TABS.map(t => (
          <button
            key={t.id}
            type="button"
            className={`${styles.tab} ${activeTab === t.id ? styles.tabActive : ''}`}
            onClick={() => setActiveTab(t.id as Tab)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loadErrBanner}

      {/* key remounts tabs with correct initial values when API data arrives */}
      <div className={styles.content} key={ds?.id ?? listRow?.id ?? 'empty'}>
        <div style={{ display: activeTab === 'basic'      ? undefined : 'none' }}><BasicDetailsTab ref={basicRef} sourceAppName={sourceAppName} sourceName={sourceName} sourceDescription={sourceDesc} /></div>
        <div style={{ display: activeTab === 'connection' ? undefined : 'none' }}>
          <ConnectionDetailsTab
            hostname={connHostname}
            port={connPort}
            username={connUsername}
            databaseName={connDatabase}
            sslEnabled={connSsl}
          />
        </div>
        <div style={{ display: activeTab === 'database' ? undefined : 'none' }}><DatabaseTab sourceName={sourceName} sourceId={id ?? ''} /></div>
      </div>

      <div className={styles.footer}>
        {saveMsg && (
          <span style={{ fontSize: 13, color: saveMsg.ok ? '#16a34a' : '#dc2626', marginRight: 'auto' }}>
            {saveMsg.text}
          </span>
        )}
        <Button variant="secondary" onClick={() => navigate('/data-sources')}>Cancel</Button>
        <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Save Changes'}</Button>
      </div>
    </div>
  );
};
