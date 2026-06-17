import React from 'react';
import { Check } from 'lucide-react';
import styles from './Checkbox.module.scss';

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  onChange,
  label,
  description,
  disabled,
}) => (
  <label className={styles.wrapper} style={{ opacity: disabled ? 0.5 : 1, cursor: disabled ? 'not-allowed' : 'pointer' }}>
    <input
      type="checkbox"
      className={styles.hidden}
      checked={checked}
      onChange={e => !disabled && onChange(e.target.checked)}
      disabled={disabled}
    />
    <span className={`${styles.box} ${checked ? styles.checked : ''}`}>
      <Check strokeWidth={3} />
    </span>
    {(label || description) && (
      <span>
        {label && <span className={styles.labelText}>{label}</span>}
        {description && <p className={styles.description}>{description}</p>}
      </span>
    )}
  </label>
);
