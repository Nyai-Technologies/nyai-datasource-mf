import React from 'react';
import { Input, Textarea, Select, Checkbox } from '../../../../../components/Components';
import type { BasicDetailsData } from '../../../../../types/types';
import styles from './BasicDetails.module.scss';

const LANGS = [
  { value: 'en', label: 'English' },
  { value: 'hi', label: 'Hindi' },
  { value: 'mr', label: 'Marathi' },
];

interface BasicDetailsProps {
  data: BasicDetailsData;
  onChange: (patch: Partial<BasicDetailsData>) => void;
  errors?: Record<string, string>;
}

export const BasicDetails: React.FC<BasicDetailsProps> = ({ data, onChange, errors = {} }) => (
  <div className={styles.form}>
    <div className={styles.row}>
      <Input
        label="App Name"
        required
        placeholder="Enter the app name (e.g. MDM)"
        value={data.appName}
        onChange={e => onChange({ appName: e.target.value })}
        error={errors.appName}
      />
      <Input
        label="Name"
        required
        placeholder="Enter a name for your data source"
        value={data.name}
        onChange={e => onChange({ name: e.target.value })}
        error={errors.name}
      />
    </div>

    <div className={styles.row}>
      <Select
        label="Primary Language"
        placeholder="Select the primary language"
        options={LANGS}
        value={data.primaryLang}
        onChange={e => onChange({ primaryLang: e.target.value })}
      />
      <Select
        label="Secondary Language"
        placeholder="Select the secondary language"
        options={LANGS}
        value={data.secondaryLang}
        onChange={e => onChange({ secondaryLang: e.target.value })}
      />
    </div>

    <Textarea
      label="Description"
      required
      placeholder="Describe what data this source has and for which purpose it was collected"
      value={data.description}
      onChange={e => onChange({ description: e.target.value })}
      error={errors.description}
    />

    <div className={styles.section}>
      <p className={styles.sectionTitle}>
        Database Access Permissions <span style={{ color: '#ef4444' }}>*</span>
      </p>
      <p className={styles.sectionDesc}>
        To analyse your data and power DPDP compliance, NYAI needs certain permissions for this database. These permissions are used only for consent-related operations and nothing else.
      </p>
      <div className={styles.permGrid}>
        <div className={`${styles.permCard} ${data.readWrite ? styles.permSelected : ''}`}>
          <Checkbox
            checked={data.readWrite}
            onChange={v => onChange({ readWrite: v })}
            label="Read & Write Access"
            description="Required to scan tables and identify PII columns."
          />
        </div>
        <div className={`${styles.permCard} ${data.alter ? styles.permSelected : ''}`}>
          <Checkbox
            checked={data.alter}
            onChange={v => onChange({ alter: v })}
            label="Read, Write & Alter Access"
            description="Allows NYAI to store consent records directly in your database."
          />
        </div>
      </div>
    </div>
  </div>
);
