import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Stepper, Button } from '../../../components/Components';
import { BasicDetails } from './steps/BasicDetails/BasicDetails';
import { ConnectionDetails } from './steps/ConnectionDetails/ConnectionDetails';
import { Preview } from './steps/Preview/Preview';
import { api, parseDiscoverTables, type ApiSchemaTable, type ApiConsent, type ApiLanguage } from '../../../lib/api';
import type { BasicDetailsData, ConnectionData, SelectedTable } from '../../../types/types';
const STEPS = [
  { label: 'Basic Details' },
  { label: 'Connection Details' },
  { label: 'Preview' },
];

const NEXT_LABELS = ['Next', 'Test Connection', 'Save & Connect'];

// Maps the UI type id to the backend dialect string and default port
const DIALECT_MAP: Record<string, { dialect: string; defaultPort: number }> = {
  postgresql: { dialect: 'Postgres',      defaultPort: 5432 },
  mysql:      { dialect: 'Mysql',         defaultPort: 3306 },
  mssql:      { dialect: 'MS_SQL_Server', defaultPort: 1433 },
};

type FieldErrors = Record<string, string>;

function validateBasic(data: BasicDetailsData): FieldErrors {
  const errs: FieldErrors = {};
  if (!data.name.trim())        errs.name        = 'Name is required';
  if (!data.description.trim()) errs.description = 'Description is required';
  return errs;
}

function validateConnection(data: ConnectionData): FieldErrors {
  const errs: FieldErrors = {};
  if (data.mode === 'details') {
    if (!data.host.trim())     errs.host     = 'Host is required';
    if (!data.port.trim())     errs.port     = 'Port is required';
    if (!data.username.trim()) errs.username = 'Username is required';
    if (!data.password.trim()) errs.password = 'Password is required';
    if (!data.dbName.trim())   errs.dbName   = 'Database name is required';
  } else if (!data.uri.trim()) {
    errs.uri = 'Connection URI is required';
  }
  return errs;
}

export const NewDataSource: React.FC = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const dbType    = (location.state as { dbType?: string } | null)?.dbType ?? 'postgresql';
  const { dialect, defaultPort } = DIALECT_MAP[dbType] ?? DIALECT_MAP.postgresql;

  const [step, setStep]               = useState(0);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const [basicData, setBasicData] = useState<BasicDetailsData>({
    appName: 'DPDPA',
    name: '',
    description: '',
    primaryLang: '',
    secondaryLang: '',
    readWrite: true,
    alter: false,
  });

  const [connData, setConnData] = useState<ConnectionData>({
    mode: 'details',
    host: import.meta.env.VITE_DEV_DB_HOST ?? '',
    port: import.meta.env.VITE_DEV_DB_PORT ?? '',
    username: import.meta.env.VITE_DEV_DB_USER ?? '',
    password: import.meta.env.VITE_DEV_DB_PASS ?? '',
    dbName: import.meta.env.VITE_DEV_DB_NAME ?? '',
    uri: '',
    sslEnabled: false,
  });

  const [consents, setConsents]             = useState<ApiConsent[]>([]);
  const [languages, setLanguages]           = useState<ApiLanguage[]>([]);
  const [datasourceId, setDatasourceId]     = useState<string | null>(null);
  const [schema, setSchema]                 = useState<ApiSchemaTable[]>([]);
  const [selectedTables, setSelectedTables] = useState<SelectedTable[]>([]);

  useEffect(() => {
    api.listConsents().then(setConsents).catch(() => {});
    api.listLanguages().then(setLanguages).catch(() => {});
  }, []);

  const clearFieldError = (keys: string[]) =>
    setFieldErrors(prev => {
      const next = { ...prev };
      keys.forEach(k => delete next[k]);
      return next;
    });

  const handleTestConnection = async () => {
    setLoading(true);
    setError(null);
    try {
      const consentType = basicData.alter ? 'Read_Write_Alter Access' : 'Read_Access';
      const norm = (s: string) => s.replace(/_/g, ' ').toLowerCase().trim();
      const matchedConsent = consents.find(c => norm(c.type) === norm(consentType));
      console.log('[consent match]', { consents, consentType, matchedConsent });

      const payload = {
        appName: basicData.appName,
        name: basicData.name,
        description: basicData.description,
        dialect,
        databaseName: connData.mode === 'details' ? connData.dbName : '',
        username: connData.mode === 'details' ? connData.username : '',
        password: connData.mode === 'details' ? connData.password : '',
        hostname: connData.mode === 'details' ? connData.host : '',
        port: Number(connData.port) || defaultPort,
        sslEnabled: connData.sslEnabled,
        consent: {
          ...(matchedConsent?.id ? { id: matchedConsent.id } : {}),
          type: consentType,
          purpose: basicData.alter
            ? 'Allows NYAI to alter the database schema to create the consent tables and store the consent records in both consent and actual tables.'
            : 'Allows NYAI to scan tables and identify PII columns for DPDP compliance.',
          validUpto: '2028-06-12',
          metadata: {
            ipAddress: '0.0.0.0',
            browser: {
              name: navigator.userAgent.includes('Chrome') ? 'Chrome' : 'Browser',
              version: /Chrome\/(\d+)/.exec(navigator.userAgent)?.[1] ?? '',
            },
            device: {
              os: navigator.platform.includes('Win') ? 'Windows' : navigator.platform,
            },
          },
        },
      };

      const result = await api.discoverDatabase(payload);
      const tables = parseDiscoverTables(result);
      const dsId   = result.datasourceId;
      setDatasourceId(dsId);
      setSchema(tables);
      const allSelected = tables.map(t => ({ tableName: t.tableName, columns: t.columns.map(c => c.name) }));
      setSelectedTables(allSelected);
      // Mark as SAMPLE_COLLECTED immediately after successful connection
      await api.processMetadata(dsId, { tables: allSelected, operations: ['PII'] });
      setStep(2);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(`Connection failed: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAndConnect = async () => {
    if (!datasourceId) return;
    setLoading(true);
    setError(null);
    try {
      // PII already called after test connection — just send updated selection and mark complete
      await api.processMetadata(datasourceId, { tables: selectedTables, operations: ['PII'] });
      navigate('/data-sources');
    } catch {
      setError('Failed to save data source. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = async () => {
    if (loading) return;
    setError(null);

    if (step === 0) {
      const errs = validateBasic(basicData);
      if (Object.keys(errs).length > 0) { setFieldErrors(errs); return; }
      setFieldErrors({});
      setStep(1);
      return;
    }

    if (step === 1) {
      const errs = validateConnection(connData);
      if (Object.keys(errs).length > 0) { setFieldErrors(errs); return; }
      setFieldErrors({});
      await handleTestConnection();
      return;
    }

    if (step === 2) { await handleSaveAndConnect(); }
  };

  const handleBack = () => {
    setError(null);
    setFieldErrors({});
    if (step > 0) setStep(s => s - 1);
    else navigate('/data-sources/new/type');
  };

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white flex-1 flex flex-col overflow-hidden">
        <Stepper steps={STEPS} current={step} />

        {error && (
          <div className="mx-0 mb-3 px-4 py-[10px] bg-[#fef2f2] border border-[#fecaca] rounded-[6px] text-[#dc2626] text-[14px]">
            {error}
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {step === 0 && (
            <BasicDetails
              data={basicData}
              errors={fieldErrors}
              languages={languages}
              onChange={patch => {
                setBasicData(prev => ({ ...prev, ...patch }));
                clearFieldError(Object.keys(patch));
              }}
            />
          )}
          {step === 1 && (
            <ConnectionDetails
              data={connData}
              errors={fieldErrors}
              onChange={patch => {
                setConnData(prev => ({ ...prev, ...patch }));
                clearFieldError(Object.keys(patch));
              }}
            />
          )}
          {step === 2 && (
            <Preview
              schema={schema}
              onSelectionChange={setSelectedTables}
            />
          )}
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-[#b8c1d3] flex-shrink-0">
          <button
            className="bg-transparent border-none text-[#1e7070] text-[14px] cursor-pointer p-0 hover:underline disabled:opacity-50"
            onClick={handleBack}
            disabled={loading}
          >
            Back
          </button>
          <div className="flex items-center gap-3">
            <Button variant="secondary" onClick={() => navigate('/data-sources')} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleNext} disabled={loading || (step === 0 && !basicData.readWrite)}>
              {loading ? 'Please wait…' : NEXT_LABELS[step]}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewDataSource;
