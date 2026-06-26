import React, { useRef, useState } from 'react';
import { AlignLeft, CheckCircle, ChevronDown } from 'lucide-react';
import { Input, Checkbox, Accordion } from '../../../../../components/Components';
import type { ConnectionData } from '../../../../../types/types';

const JSON_TEMPLATE = `// -------------- REQUIRED SECTION ---------------
{
  "type": "postgresql", // Don't change this value for PostgreSQL connections

  "connection": {
    // Required: Basic Connection Settings
    "host": "", // Required: e.g., "db.example.com" or "192.168.1.2"
    "port": 5432, // Required: Default PostgreSQL port is 5432
    "database": "", // Required: e.g., "mydatabase"

    // Required: Authentication Settings
    "credentials": {
      "username": "",
      "password": "",
      "passwordEncrypted": false // Required: Set true if password is encrypted
    }
  }
}`;

const OPT_TREE = [
  { label: 'Certificates', children: ['Client', 'Server'] },
  { label: 'Database', children: [] },
  { label: 'Proxy', children: [] },
];

const FileField: React.FC<{ label: string }> = ({ label }) => (
  <div className="mb-4">
    <span className="text-[14px] text-[#374151] mb-[6px] block">{label}</span>
    <div className="flex border border-[#b8c1d3] rounded-[6px] overflow-hidden">
      <textarea className="flex-1 min-h-[72px] border-none outline-none px-3 py-2 text-[14px] resize-none bg-white" />
      <div className="w-[160px] flex-shrink-0 border-l border-[#b8c1d3] flex flex-col items-center justify-center gap-1 p-3 cursor-pointer bg-white hover:bg-[#f1f5f9] transition-colors">
        <span className="text-[14px] font-semibold text-[#374151]">Upload File</span>
        <span className="text-[12px] text-[#9ca3af] text-center">Supported file types - .pem</span>
      </div>
    </div>
  </div>
);

const CertificatesContent: React.FC<{ sslEnabled: boolean; onSslChange: (v: boolean) => void }> = ({ sslEnabled, onSslChange }) => {
  const [sslMode, setSslMode] = useState('verify-full');
  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <Checkbox checked={sslEnabled} onChange={onSslChange} label="SSL" />
        <div className="relative flex items-center">
          <select
            className="h-[34px] pl-3 pr-7 border border-[#b8c1d3] rounded-[6px] text-[14px] text-[#374151] bg-white cursor-pointer outline-none appearance-none focus:border-[#1e7070]"
            value={sslMode}
            onChange={e => setSslMode(e.target.value)}
          >
            <option value="verify-full">Verify Full</option>
            <option value="verify-ca">Verify CA</option>
            <option value="require">Require</option>
            <option value="prefer">Prefer</option>
            <option value="allow">Allow</option>
            <option value="disable">Disable</option>
          </select>
          <ChevronDown className="absolute right-2 w-[14px] h-[14px] text-[#9ca3af] pointer-events-none" />
        </div>
      </div>
      <p className="text-[14px] font-bold text-[#374151] my-3">Client</p>
      <FileField label="Certificate" />
      <FileField label="Private Key" />
      <div className="mb-4">
        <span className="text-[14px] text-[#374151] mb-[6px] block">Passphrase</span>
        <textarea className="w-full border border-[#b8c1d3] rounded-[6px] px-3 py-2 text-[14px] resize-none outline-none min-h-[72px] bg-white" />
      </div>
      <p className="text-[14px] font-bold text-[#374151] my-3">Server</p>
      <FileField label="CA Certificate" />
    </div>
  );
};

const ProxyContent: React.FC = () => {
  const [host, setHost]         = useState('');
  const [port, setPort]         = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [type, setType]         = useState('');
  return (
    <div>
      <div className="grid grid-cols-2 gap-4 mb-4 max-[600px]:grid-cols-1">
        <Input placeholder="Enter the host"     label="Host"     value={host}     onChange={e => setHost(e.target.value)} />
        <Input placeholder="Enter the port"     label="Port"     value={port}     onChange={e => setPort(e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-4 mb-4 max-[600px]:grid-cols-1">
        <Input placeholder="Enter the username" label="Username" value={username} onChange={e => setUsername(e.target.value)} />
        <Input placeholder="Enter the password" label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
      </div>
      <div className="max-w-[50%] max-[600px]:max-w-full">
        <Input placeholder="Enter the type" label="Type" value={type} onChange={e => setType(e.target.value)} />
      </div>
    </div>
  );
};

const OptionalDetails: React.FC<{ sslEnabled: boolean; onSslChange: (v: boolean) => void }> = ({ sslEnabled, onSslChange }) => (
  <div className="mt-1">
    <p className="text-[14px] font-semibold text-[#374151] mb-3">Optional Details</p>
    <Accordion title="Certificates"><CertificatesContent sslEnabled={sslEnabled} onSslChange={onSslChange} /></Accordion>
    <Accordion title="Proxy"><ProxyContent /></Accordion>
  </div>
);

interface ConnectionDetailsProps {
  data: ConnectionData;
  onChange: (patch: Partial<ConnectionData>) => void;
  errors?: Record<string, string>;
}

export const ConnectionDetails: React.FC<ConnectionDetailsProps> = ({ data, onChange, errors = {} }) => {
  const [isJson, setIsJson]       = useState(false);
  const [jsonValue, setJsonValue] = useState(JSON_TEMPLATE);
  const lineNumRef                = useRef<HTMLDivElement>(null);
  const textareaRef               = useRef<HTMLTextAreaElement>(null);
  const lineCount                 = jsonValue.split('\n').length;

  const handleScroll = () => {
    if (lineNumRef.current && textareaRef.current) {
      lineNumRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  const handleFormat = () => {
    try {
      const stripped = jsonValue.replace(/\/\/[^\n]*/g, '').replace(/,(\s*[}\]])/g, '$1');
      setJsonValue(JSON.stringify(JSON.parse(stripped), null, 2));
    } catch { /* keep as-is */ }
  };

  const renderBody = () => {
    if (isJson) {
      return (
        <div className="flex border border-[#b8c1d3] rounded-[8px] overflow-hidden h-[360px]">
          {/* Left tree panel */}
          <div className="w-[240px] flex-shrink-0 border-r border-[#b8c1d3] overflow-y-auto p-4 bg-white [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <p className="text-[14px] font-semibold text-[#374151] mb-3">Optional Details</p>
            {OPT_TREE.map(group => (
              <div key={group.label} className="mb-3">
                {group.children.length > 0 ? (
                  <>
                    <div className="text-[13px] font-semibold text-[#6b7280] pb-1 border-b border-[#b8c1d3] mb-1">{group.label}</div>
                    {group.children.map(child => (
                      <div key={child} className="flex justify-between items-center py-[5px] pl-4 text-[13px] text-[#374151]">
                        <span>{child}</span>
                        <button
                          className="w-5 h-5 border border-[#d1d5db] rounded-[4px] bg-white text-[#6b7280] cursor-pointer flex items-center justify-center text-[15px] leading-none hover:border-[#1e7070] hover:text-[#1e7070] flex-shrink-0"
                          type="button"
                        >+</button>
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="flex justify-between items-center text-[13px] font-semibold text-[#6b7280] border-b border-[#b8c1d3] pb-1">
                    <span>{group.label}</span>
                    <button
                      className="w-5 h-5 border border-[#d1d5db] rounded-[4px] bg-white text-[#6b7280] cursor-pointer flex items-center justify-center text-[15px] leading-none hover:border-[#1e7070] hover:text-[#1e7070] flex-shrink-0"
                      type="button"
                    >+</button>
                  </div>
                )}
              </div>
            ))}
          </div>
          {/* Right code editor */}
          <div className="flex-1 flex flex-col bg-[#1a1e2a] overflow-hidden">
            <div className="flex-1 flex overflow-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <div
                ref={lineNumRef}
                className="px-3 py-3 text-[rgba(255,255,255,0.25)] font-mono text-[12px] leading-[1.65] text-right select-none flex-shrink-0 border-r border-[rgba(255,255,255,0.08)] min-w-[42px] overflow-y-hidden"
              >
                {Array.from({ length: lineCount }, (_, i) => (
                  <div key={i} style={{ height: 'calc(12px * 1.65)' }}>{String(i + 1).padStart(2, '0')}</div>
                ))}
              </div>
              <textarea
                ref={textareaRef}
                className="flex-1 bg-transparent text-[#e2e8f0] border-none outline-none resize-none font-mono text-[12px] leading-[1.65] p-3 caret-white whitespace-pre overflow-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                value={jsonValue}
                onChange={e => setJsonValue(e.target.value)}
                onScroll={handleScroll}
                spellCheck={false}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
              />
            </div>
            <div className="flex justify-end gap-2 px-3 py-2 border-t border-[rgba(255,255,255,0.08)] flex-shrink-0">
              <button
                className="flex items-center gap-1 px-[10px] py-1 border border-[rgba(255,255,255,0.2)] rounded-[4px] bg-transparent text-[rgba(255,255,255,0.65)] text-[12px] cursor-pointer hover:bg-[rgba(255,255,255,0.08)] hover:text-white [&>svg]:w-3 [&>svg]:h-3"
                type="button"
                onClick={handleFormat}
              >
                <AlignLeft /> Format
              </button>
              <button
                className="flex items-center gap-1 px-[10px] py-1 border border-[rgba(255,255,255,0.2)] rounded-[4px] bg-transparent text-[rgba(255,255,255,0.65)] text-[12px] cursor-pointer hover:bg-[rgba(255,255,255,0.08)] hover:text-white [&>svg]:w-3 [&>svg]:h-3"
                type="button"
              >
                <CheckCircle /> Validate
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (data.mode === 'details') {
      return (
        <div>
          <div className="mb-5">
            <p className="text-[14px] font-semibold text-[#374151] mb-4">Required Details</p>
            <div className="grid grid-cols-2 gap-4 mb-4 max-[700px]:grid-cols-1">
              <Input label="Host"     required placeholder="Enter the host"          value={data.host}     onChange={e => onChange({ host: e.target.value })}     error={errors.host} />
              <Input label="Port"     required placeholder="Enter the port"          value={data.port}     onChange={e => onChange({ port: e.target.value })}     error={errors.port} />
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4 max-[700px]:grid-cols-1">
              <Input label="Username" required placeholder="Enter the username"      value={data.username} onChange={e => onChange({ username: e.target.value })} error={errors.username} />
              <Input label="Password" required type="password" placeholder="Enter the password" value={data.password} onChange={e => onChange({ password: e.target.value })} error={errors.password} />
            </div>
            <Input label="Database Name" required placeholder="Enter a database name" value={data.dbName} onChange={e => onChange({ dbName: e.target.value })} error={errors.dbName} />
          </div>
          <OptionalDetails sslEnabled={data.sslEnabled} onSslChange={v => onChange({ sslEnabled: v })} />
        </div>
      );
    }

    return (
      <div>
        <div className="mb-5">
          <p className="text-[14px] font-semibold text-[#374151] mb-4">Required Details</p>
          <Input label="Connection URI" required placeholder="Enter a connection URI" value={data.uri} onChange={e => onChange({ uri: e.target.value })} error={errors.uri} />
        </div>
        <OptionalDetails sslEnabled={data.sslEnabled} onSslChange={v => onChange({ sslEnabled: v })} />
      </div>
    );
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <div className="flex gap-5">
          {(['details', 'uri'] as const).map(m => (
            <label key={m} className={`flex items-center gap-2 cursor-pointer text-[14px] ${data.mode === m ? 'font-semibold text-[#374151]' : 'font-normal text-[#374151]'}`}>
              <input
                type="radio"
                className="w-4 h-4 cursor-pointer accent-[#1e7070]"
                checked={data.mode === m}
                onChange={() => onChange({ mode: m })}
              />
              {m === 'details' ? 'Connect with details' : 'Connect with URI'}
            </label>
          ))}
        </div>
        <button
          className="bg-transparent border-none text-[#1e7070] text-[14px] cursor-pointer p-0 underline underline-offset-[2px] hover:opacity-80"
          onClick={() => setIsJson(v => !v)}
        >
          {isJson ? 'Switch to Form' : 'Switch to JSON'}
        </button>
      </div>
      {renderBody()}
    </div>
  );
};
