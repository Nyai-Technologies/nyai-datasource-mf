import React from 'react';
import styles from './Button.module.scss';

type Variant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}) => {
  const cls = [
    styles.btn,
    styles[variant],
    size !== 'md' ? styles[size] : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <button className={cls} {...props}>
      {children}
    </button>
  );
};
