import React, { useRef, useState } from 'react';
import { AlignLeft, CheckCircle, ChevronDown } from 'lucide-react';
import { Input, Checkbox, Accordion } from '../../../../../components/Components';
import type { ConnectionData } from '../../../../../types/types';
import styles from './ConnectionDetails.module.scss';

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
  <div className={styles.fileField}>
    <span className={styles.fileLabel}>{label}</span>
    <div className={styles.fileRow}>
      <textarea className={styles.fileTextarea} />
      <div className={styles.uploadPanel}>
        <span className={styles.uploadTitle}>Upload File</span>
        <span className={styles.uploadSub}>Supported file types - .pem</span>
      </div>
    </div>
  </div>
);

const CertificatesContent: React.FC = () => {
  const [ssl, setSsl] = useState(true);
  const [sslMode, setSslMode] = useState('verify-full');
  return (
    <div>
      <div className={styles.sslRow}>
        <Checkbox checked={ssl} onChange={setSsl} label="SSL" />
        <div className={styles.sslSelectWrap}>
          <select className={styles.sslSelect} value={sslMode} onChange={e => setSslMode(e.target.value)}>
            <option value="verify-full">Verify Full</option>
            <option value="verify-ca">Verify CA</option>
            <option value="require">Require</option>
            <option value="prefer">Prefer</option>
            <option value="allow">Allow</option>
            <option value="disable">Disable</option>
          </select>
          <ChevronDown className={styles.sslSelectChevron} />
        </div>
      </div>
      <p className={styles.subTitle}>Client</p>
      <FileField label="Certificate" />
      <FileField label="Private Key" />
      <div className={styles.fileField}>
        <span className={styles.fileLabel}>Passphrase</span>
        <textarea className={styles.fileTextarea} />
      </div>
      <p className={styles.subTitle}>Server</p>
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
      <div className={styles.proxyRow}>
        <Input placeholder="Enter the host"     label="Host"     value={host}     onChange={e => setHost(e.target.value)} />
        <Input placeholder="Enter the port"     label="Port"     value={port}     onChange={e => setPort(e.target.value)} />
      </div>
      <div className={styles.proxyRow}>
        <Input placeholder="Enter the username" label="Username" value={username} onChange={e => setUsername(e.target.value)} />
        <Input placeholder="Enter the password" label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
      </div>
      <div className={styles.proxyHalf}>
        <Input placeholder="Enter the type"    label="Type"     value={type}     onChange={e => setType(e.target.value)} />
      </div>
    </div>
  );
};

const OptionalDetails: React.FC = () => (
  <div className={styles.optionalSection}>
    <p className={styles.sectionTitle}>Optional Details</p>
    <Accordion title="Certificates"><CertificatesContent /></Accordion>
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
        <div className={styles.jsonLayout}>
          <div className={styles.optTree}>
            <p className={styles.optTreeTitle}>Optional Details</p>
            {OPT_TREE.map(group => (
              <div key={group.label} className={styles.treeGroup}>
                {group.children.length > 0 ? (
                  <>
                    <div className={styles.treeGroupLabel}>{group.label}</div>
                    {group.children.map(child => (
                      <div key={child} className={styles.treeRow}>
                        <span>{child}</span>
                        <button className={styles.addBtn} type="button">+</button>
                      </div>
                    ))}
                  </>
                ) : (
                  <div className={styles.treeGroupSingle}>
                    <span>{group.label}</span>
                    <button className={styles.addBtn} type="button">+</button>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className={styles.codeEditor}>
            <div className={styles.codeScroller}>
              <div className={styles.lineNumbers} ref={lineNumRef}>
                {Array.from({ length: lineCount }, (_, i) => (
                  <div key={i}>{String(i + 1).padStart(2, '0')}</div>
                ))}
              </div>
              <textarea
                ref={textareaRef}
                className={styles.codeArea}
                value={jsonValue}
                onChange={e => setJsonValue(e.target.value)}
                onScroll={handleScroll}
                spellCheck={false}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
              />
            </div>
            <div className={styles.codeToolbar}>
              <button className={styles.codeBtn} type="button" onClick={handleFormat}>
                <AlignLeft /> Format
              </button>
              <button className={styles.codeBtn} type="button">
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
          <div className={styles.section}>
            <p className={styles.sectionTitle}>Required Details</p>
            <div className={styles.row}>
              <Input label="Host"     required placeholder="Enter the host"          value={data.host}     onChange={e => onChange({ host: e.target.value })}     error={errors.host} />
              <Input label="Port"     required placeholder="Enter the port"          value={data.port}     onChange={e => onChange({ port: e.target.value })}     error={errors.port} />
            </div>
            <div className={styles.row}>
              <Input label="Username" required placeholder="Enter the username"      value={data.username} onChange={e => onChange({ username: e.target.value })} error={errors.username} />
              <Input label="Password" required type="password" placeholder="Enter the password" value={data.password} onChange={e => onChange({ password: e.target.value })} error={errors.password} />
            </div>
            <Input label="Database Name" required placeholder="Enter a database name" value={data.dbName}   onChange={e => onChange({ dbName: e.target.value })}   error={errors.dbName} />
            {/* <div style={{ marginTop: 12 }}>
              <Checkbox checked={data.sslEnabled} onChange={v => onChange({ sslEnabled: v })} label="SSL Enabled" />
            </div> */}
          </div>
          <OptionalDetails />
        </div>
      );
    }

    return (
      <div>
        <div className={styles.uriSection}>
          <p className={styles.sectionTitle}>Required Details</p>
          <Input label="Connection URI" required placeholder="Enter a connection URI" value={data.uri} onChange={e => onChange({ uri: e.target.value })} error={errors.uri} />
        </div>
        <OptionalDetails />
      </div>
    );
  };

  return (
    <div>
      <div className={styles.topRow}>
        <div className={styles.radioGroup}>
          {(['details', 'uri'] as const).map(m => (
            <label key={m} className={`${styles.radioLabel} ${data.mode === m ? styles.radioActive : ''}`}>
              <input type="radio" className={styles.radio} checked={data.mode === m} onChange={() => onChange({ mode: m })} />
              {m === 'details' ? 'Connect with details' : 'Connect with URI'}
            </label>
          ))}
        </div>
        <button className={styles.switchLink} onClick={() => setIsJson(v => !v)}>
          {isJson ? 'Switch to Form' : 'Switch to JSON'}
        </button>
      </div>
      {renderBody()}
    </div>
  );
};
