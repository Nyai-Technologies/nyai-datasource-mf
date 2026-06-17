import type React from 'react';

export type IconComponent = React.ComponentType<{ size?: number | string; className?: string }>;

export interface NavItem {
  label: string;
  icon?: IconComponent;
  path: string;
}
