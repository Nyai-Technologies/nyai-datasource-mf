import React, { useState } from 'react';
import { Check, MoreVertical } from 'lucide-react';
import type { SortState } from '../../../types/types';
import styles from './Table.module.scss';

export interface Column<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  render?: (value: unknown, row: T) => React.ReactNode;
}

interface TableProps<T extends { id: string }> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (row: T) => void;
  onAction?: (row: T) => void;
}

function SortIcons({ active, dir }: { active: boolean; dir: 'asc' | 'desc' | null }) {
  return (
    <span className={`${styles.sortIcons} ${active ? styles.sortActive : ''}`}>
      <svg viewBox="0 0 10 6" fill={active && dir === 'asc' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5">
        <path d="M1 5l4-4 4 4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <svg viewBox="0 0 10 6" fill={active && dir === 'desc' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5">
        <path d="M1 1l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

export function Table<T extends { id: string }>({ columns, data, onRowClick, onAction }: TableProps<T>) {
  const [sort, setSort] = useState<SortState>({ key: '', dir: null });

  const handleSort = (key: string) => {
    setSort(prev =>
      prev.key === key
        ? { key, dir: prev.dir === 'asc' ? 'desc' : prev.dir === 'desc' ? null : 'asc' }
        : { key, dir: 'asc' },
    );
  };

  const sorted = [...data].sort((a, b) => {
    if (!sort.dir || !sort.key) return 0;
    const av = (a as Record<string, unknown>)[sort.key] as string ?? '';
    const bv = (b as Record<string, unknown>)[sort.key] as string ?? '';
    return sort.dir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
  });

  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead className={styles.thead}>
          <tr>
            {columns.map(col => {
              const key = String(col.key);
              const active = sort.key === key;
              return (
                <th key={key} className={styles.th}>
                  <span
                    className={`${styles.thInner} ${!col.sortable ? styles.noSort : ''}`}
                    onClick={() => col.sortable && handleSort(key)}
                  >
                    {col.label}
                    {col.sortable && <SortIcons active={active} dir={active ? sort.dir : null} />}
                  </span>
                </th>
              );
            })}
            {onAction && <th className={styles.th} />}
          </tr>
        </thead>
        <tbody>
          {sorted.length === 0 ? (
            <tr><td colSpan={columns.length + (onAction ? 1 : 0)} className={styles.empty}>No data found.</td></tr>
          ) : sorted.map(row => (
            <tr
              key={row.id}
              className={styles.tr}
              style={onRowClick ? { cursor: 'pointer' } : undefined}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
            >
              {columns.map(col => {
                const key = String(col.key);
                const val = (row as Record<string, unknown>)[key];
                return (
                  <td key={key} className={styles.td}>
                    {col.render ? col.render(val, row) : (
                      key === 'status' ? (
                        <span className={styles.statusBadge}>
                          <Check strokeWidth={2.5} />
                        </span>
                      ) : String(val ?? '')
                    )}
                  </td>
                );
              })}
              {onAction && (
                <td className={styles.td}>
                  <button className={styles.actionBtn} onClick={e => { e.stopPropagation(); onAction(row); }}>
                    <MoreVertical size={16} />
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
