import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import styles from './FilterDropdown.module.scss';

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

export const FilterDropdown: React.FC<FilterDropdownProps> = ({
  label,
  options,
  value,
  onChange,
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find(o => o.value === value && o.value !== '');

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className={styles.wrap}>
      <button
        type="button"
        className={`${styles.btn} ${selected ? styles.btnActive : ''}`}
        onClick={() => setOpen(v => !v)}
      >
        <span>{selected ? selected.label : label}</span>
        <ChevronDown size={13} />
      </button>
      {open && (
        <div className={styles.dropdown}>
          {options.map(opt => (
            <button
              key={opt.value}
              type="button"
              className={`${styles.option} ${value === opt.value ? styles.optionActive : ''}`}
              onClick={() => { onChange(opt.value); setOpen(false); }}
            >
              <span className={styles.optionCheck}>
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
