import React from 'react';
import styles from './Input.module.scss';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  required?: boolean;
}

export const Input: React.FC<InputProps> = ({ label, required, id, ...props }) => {
  const inputId = id ?? (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={styles.field}>
      {label && (
        <label className={styles.label} htmlFor={inputId}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      )}
      <input id={inputId} className={styles.input} {...props} />
    </div>
  );
};

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  required?: boolean;
}

export const Textarea: React.FC<TextareaProps> = ({ label, required, id, ...props }) => {
  const inputId = id ?? (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={styles.field}>
      {label && (
        <label className={styles.label} htmlFor={inputId}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      )}
      <textarea id={inputId} className={styles.textarea} {...props} />
    </div>
  );
};
