import React from 'react';
import { Check } from 'lucide-react';

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
}

export const Checkbox: React.FC<CheckboxProps> = ({ checked, onChange, label, description, disabled }) => (
  <label
    className="flex items-start gap-3 cursor-pointer select-none"
    style={{ opacity: disabled ? 0.5 : 1, cursor: disabled ? 'not-allowed' : 'pointer' }}
  >
    <input
      type="checkbox"
      className="hidden"
      checked={checked}
      onChange={e => !disabled && onChange(e.target.checked)}
      disabled={disabled}
    />
    <span
      className={`w-[18px] h-[18px] border-[1.5px] rounded-[3px] flex items-center justify-center flex-shrink-0 transition-all mt-[1px] ${
        checked ? 'bg-[#1e7070] border-[#1e7070]' : 'bg-white border-[#d1d5db]'
      }`}
    >
      <Check size={11} strokeWidth={3} className={`text-white ${checked ? 'opacity-100' : 'opacity-0'}`} />
    </span>
    {(label || description) && (
      <span>
        {label && <span className="text-[14px] text-[#1a2030] leading-[1.4]">{label}</span>}
        {description && <p className="text-[12px] text-[#9ca3af] mt-[2px] leading-[1.4]">{description}</p>}
      </span>
    )}
  </label>
);
