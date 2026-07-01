import React from 'react';

const fieldCls = 'flex flex-col w-full';
const labelCls = 'block text-[14px] font-medium text-[#6b7280] mb-[6px]';
const inputCls = 'block w-full h-[38px] px-3 text-[14px] text-[#1a2030] bg-white border border-[#b8c1d3] rounded-[6px] outline-none transition-all placeholder:text-[#a0aec0] placeholder:text-[12px] focus:border-[#1e7070] focus:shadow-[0_0_0_3px_rgba(30,112,112,0.12)] disabled:bg-[#f3f4f6] disabled:text-[#6b7280] disabled:cursor-not-allowed disabled:border-[#e5e7eb]';
const errorCls = 'mt-1 text-[12px] text-[#ef4444]';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  required?: boolean;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, required, error, id, ...props }) => {
  const inputId = id ?? (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={fieldCls}>
      {label && (
        <label className={labelCls} htmlFor={inputId}>
          {label}
          {required && <span className="text-[#ef4444] ml-[3px]">*</span>}
        </label>
      )}
      <input id={inputId} className={`${inputCls} ${error ? 'border-[#ef4444]' : ''}`} {...props} />
      {error && <span className={errorCls}>{error}</span>}
    </div>
  );
};

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  required?: boolean;
  error?: string;
}

export const Textarea: React.FC<TextareaProps> = ({ label, required, error, id, ...props }) => {
  const inputId = id ?? (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={fieldCls}>
      {label && (
        <label className={labelCls} htmlFor={inputId}>
          {label}
          {required && <span className="text-[#ef4444] ml-[3px]">*</span>}
        </label>
      )}
      <textarea
        id={inputId}
        className={`block w-full px-3 py-2 text-[14px] text-[#1a2030] bg-white border border-[#b8c1d3] rounded-[6px] outline-none transition-all placeholder:text-[#a0aec0] placeholder:text-[12px] focus:border-[#1e7070] focus:shadow-[0_0_0_3px_rgba(30,112,112,0.12)] min-h-[130px] resize-y leading-[1.5] ${error ? 'border-[#ef4444]' : ''}`}
        {...props}
      />
      {error && <span className={errorCls}>{error}</span>}
    </div>
  );
};
