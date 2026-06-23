import React from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  children: React.ReactNode;
}

const variantClasses: Record<Variant, string> = {
  primary:   'bg-[#1a5c4a] text-white border-[#1a5c4a] hover:bg-[#154a3b] hover:border-[#154a3b]',
  secondary: 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50',
  ghost:     'bg-transparent text-[#1a5c4a] border-transparent px-1 h-auto text-[14px] hover:underline',
  outline:   'bg-white text-gray-600 border-gray-200 hover:border-gray-400 hover:text-gray-800',
  danger:    'bg-[#ef4444] text-white border-[#ef4444] hover:bg-[#dc2626] hover:border-[#dc2626]',
};

const sizeClasses: Record<Size, string> = {
  sm: 'h-[30px] px-3 text-[12px]',
  md: 'h-9 px-4',
  lg: 'h-10 px-5',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}) => {
  const cls = [
    'inline-flex items-center justify-center gap-1.5 text-sm font-medium rounded-lg cursor-pointer border transition-colors outline-none whitespace-nowrap leading-none [&>svg]:w-[15px] [&>svg]:h-[15px] disabled:opacity-50 disabled:cursor-not-allowed',
    variantClasses[variant],
    variant !== 'ghost' ? sizeClasses[size] : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <button className={cls} {...props}>
      {children}
    </button>
  );
};
