import React from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  children: React.ReactNode;
}

const variantClasses: Record<Variant, string> = {
  primary:   'bg-[#1e7070] text-white border-[#1e7070] hover:bg-[#155858] hover:border-[#155858]',
  secondary: 'bg-white text-[#1a2030] border-[#d1d5db] hover:bg-[#f1f5f9]',
  ghost:     'bg-transparent text-[#1e7070] border-transparent px-1 h-auto text-[14px] hover:underline',
  outline:   'bg-white text-[#6b7280] border-[#b8c1d3] hover:border-[#d1d5db] hover:text-[#1a2030]',
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
    'inline-flex items-center justify-center gap-2 text-[14px] font-medium rounded-[6px] cursor-pointer border transition-all outline-none whitespace-nowrap leading-none [&>svg]:w-[15px] [&>svg]:h-[15px] disabled:opacity-50 disabled:cursor-not-allowed',
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
