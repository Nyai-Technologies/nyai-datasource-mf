import type React from 'react';

export type IconComponent = React.ComponentType<{ size?: number | string; className?: string }>;

export interface NavItem {
  label: string;
  icon?: IconComponent;
  path: string;
}

export interface BreadcrumbItem {
  label: string;
  path?: string;
}

export interface DataSource {
  id: string;
  appName: string;
  name: string;
  status: 'completed' | 'sample_collected' | 'created';
  type: string;
  lastSynced: string;
  addedBy: string;
}

export type SortDir = 'asc' | 'desc' | null;

export interface SortState {
  key: string;
  dir: SortDir;
}

// ── Form state types for NewDataSource wizard ────────────────

export interface BasicDetailsData {
  appName: string;
  name: string;
  description: string;
  primaryLang: string;
  secondaryLang: string;
  readWrite: boolean;
  alter: boolean;
}

export interface ConnectionData {
  mode: 'details' | 'uri';
  host: string;
  port: string;
  username: string;
  password: string;
  dbName: string;
  uri: string;
  sslEnabled: boolean;
}

export interface SelectedTable {
  tableName: string;
  columns: string[];
}

// ── Consent list row (maps from ApiConsent) ──────────────────

export interface ConsentRow {
  id: string;
  name: string;
  status: 'Active' | 'Inactive';
  purposes: number;
  createdBy: string;
  createdOn: string;
  type: string;
}
