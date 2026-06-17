import React from 'react';
import { ChevronDown } from 'lucide-react';
import styles from './Select.module.scss';

interface SelectOption { value: string; label: string; }

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  required?: boolean;
  placeholder?: string;
  options: SelectOption[];
}

export const Select: React.FC<SelectProps> = ({
  label,
  required,
  placeholder,
  options,
  id,
  value,
  ...props
}) => {
  const inputId = id ?? (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
  const isEmpty = !value;

  return (
    <div className={styles.field}>
      {label && (
        <label className={styles.label} htmlFor={inputId}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      )}
      <div className={styles.wrapper}>
        <select
          id={inputId}
          value={value}
          className={`${styles.select} ${isEmpty ? styles.empty : ''}`}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <ChevronDown className={styles.chevron} />
      </div>
    </div>
  );
};
