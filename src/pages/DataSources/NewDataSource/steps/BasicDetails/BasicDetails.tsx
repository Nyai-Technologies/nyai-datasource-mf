import React from 'react';
import { Input, Textarea, Select, Checkbox } from '../../../../../components/Components';
import type { BasicDetailsData } from '../../../../../types/types';

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
  <div className="flex flex-col gap-5">
    <div className="grid grid-cols-2 gap-4 max-[700px]:grid-cols-1">
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

    <div className="grid grid-cols-2 gap-4 max-[700px]:grid-cols-1">
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

    <div>
      <p className="text-[14px] font-semibold text-[#1a2030] mb-1">
        Database Access Permissions <span className="text-[#ef4444]">*</span>
      </p>
      <p className="text-[13px] text-[#6b7280] mb-4 leading-[1.5]">
        To analyse your data and power DPDP compliance, NYAI needs certain permissions for this database. These permissions are used only for consent-related operations and nothing else.
      </p>
      <div className="grid grid-cols-2 gap-3 max-[700px]:grid-cols-1">
        <div className={`border-[1.5px] rounded-[6px] p-3 px-4 transition-all ${data.readWrite ? 'border-[#1e7070] bg-[rgba(30,112,112,0.04)]' : 'border-[#b8c1d3]'}`}>
          <Checkbox
            checked={data.readWrite}
            onChange={v => onChange({ readWrite: v })}
            label="Read & Write Access"
            description="Required to scan tables and identify PII columns."
          />
        </div>
        <div className={`border-[1.5px] rounded-[6px] p-3 px-4 transition-all ${data.alter ? 'border-[#1e7070] bg-[rgba(30,112,112,0.04)]' : 'border-[#b8c1d3]'}`}>
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
