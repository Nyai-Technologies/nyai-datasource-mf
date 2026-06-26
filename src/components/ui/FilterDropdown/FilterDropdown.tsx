import React, { useState, useEffect, useRef } from 'react';

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

const ChevronDown = () => (
  <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M6 9l6 6 6-6" />
  </svg>
);

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
        className="flex items-center gap-1.5 h-9 px-3 border border-gray-200 rounded-lg bg-white text-sm text-gray-600 hover:border-gray-400 cursor-pointer whitespace-nowrap"
        onClick={() => setOpen(v => !v)}
      >
        <span>{selected ? selected.label : label}</span>
        <ChevronDown />
      </button>

      {open && (
        <div className="absolute top-full mt-1 left-0 z-50 bg-white border border-gray-200 rounded-lg shadow-lg min-w-[140px] py-1">
          {options.map(opt => (
            <button
              key={opt.value}
              type="button"
              className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 border-none bg-transparent cursor-pointer ${
                value === opt.value ? 'text-[#1a5c4a] font-medium' : 'text-gray-700'
              }`}
              onClick={() => { onChange(opt.value); setOpen(false); }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
