import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface FilterOption {
  value: string;
  label: string;
}

interface FilterDropdownProps {
  label: string;
  options: FilterOption[];
  value: string;
  onChange: (value: string) => void;
}

export const FilterDropdown: React.FC<FilterDropdownProps> = ({ label, options, value, onChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find(o => o.value === value && o.value !== '');

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        className={`flex items-center gap-[6px] h-9 px-3 border rounded-[6px] bg-white text-[14px] cursor-pointer transition-all whitespace-nowrap [&>svg]:flex-shrink-0 ${
          selected
            ? 'border-[#1e7070] text-[#1e7070] bg-[rgba(30,112,112,0.12)]'
            : 'border-[#b8c1d3] text-[#6b7280] hover:border-[#d1d5db] hover:text-[#1a2030]'
        }`}
        onClick={() => setOpen(v => !v)}
      >
        <span>{selected ? selected.label : label}</span>
        <ChevronDown size={13} />
      </button>

      {open && (
        <div className="absolute top-[calc(100%+4px)] left-0 min-w-[160px] bg-white border border-[#b8c1d3] rounded-[8px] shadow-[0_4px_16px_rgba(0,0,0,0.12)] z-50 overflow-hidden py-1">
          {options.map(opt => (
            <button
              key={opt.value}
              type="button"
              className={`flex items-center gap-2 w-full px-3 py-2 border-none bg-transparent text-[14px] text-[#1a2030] cursor-pointer text-left transition-all hover:bg-[#f1f5f9] ${
                value === opt.value ? 'font-semibold text-[#1e7070]' : ''
              }`}
              onClick={() => { onChange(opt.value); setOpen(false); }}
            >
              <span className="w-4 h-4 flex-shrink-0 flex items-center justify-center text-[#1e7070]">
                {value === opt.value && <Check size={13} strokeWidth={2.5} />}
              </span>
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
