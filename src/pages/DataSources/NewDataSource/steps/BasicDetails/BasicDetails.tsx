import React from 'react';
import { Input, Textarea, Select, Checkbox } from '../../../../../components/Components';
import type { BasicDetailsData } from '../../../../../types/types';
import type { ApiLanguage } from '../../../../../lib/api';

interface BasicDetailsProps {
  data: BasicDetailsData;
  onChange: (patch: Partial<BasicDetailsData>) => void;
  errors?: Record<string, string>;
  languages?: ApiLanguage[];
}

export const BasicDetails: React.FC<BasicDetailsProps> = ({ data, onChange, errors = {}, languages = [] }) => {
  const langOptions = languages.map(l => ({ value: l.id, label: l.name }));

  return (
    <div className="flex flex-col gap-5">
      <Input
        label="Name"
        required
        placeholder="Enter a name for your data source"
        value={data.name}
        onChange={e => onChange({ name: e.target.value })}
        error={errors.name}
      />

      <div className="grid grid-cols-2 gap-4 max-[700px]:grid-cols-1">
        <Select
          label="Primary Language"
          placeholder="Select the primary language"
          options={langOptions}
          value={data.primaryLang}
          onChange={e => onChange({ primaryLang: e.target.value })}
        />
        <Select
          label="Secondary Language"
          placeholder="Select the secondary language"
          options={langOptions}
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
        <div className="max-w-[50%] max-[700px]:max-w-full">
          <div className={`border-[1.5px] rounded-[6px] p-3 px-4 transition-all ${data.readWrite ? 'border-[#1e7070] bg-[rgba(30,112,112,0.04)]' : 'border-[#b8c1d3]'}`}>
            <Checkbox
              checked={data.readWrite}
              onChange={v => onChange({ readWrite: v })}
              label="Read Access"
              description="Required to scan tables and perform reconciliation."
            />
          </div>
        </div>
      </div>
    </div>
  );
};
