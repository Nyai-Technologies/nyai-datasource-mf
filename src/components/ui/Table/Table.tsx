import React, { useState } from 'react';
import { Check, MoreVertical } from 'lucide-react';
import type { SortState } from '../../../types/types';

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
    <svg className="w-3.5 h-3.5 inline ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 9l4-4 4 4" className={active && dir === 'asc' ? 'opacity-100' : 'opacity-30'} />
      <path d="M8 15l4 4 4-4" className={active && dir === 'desc' ? 'opacity-100' : 'opacity-30'} />
    </svg>
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
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse text-[14px]">
        <thead>
          <tr className="bg-[#eef4f2] border-b border-gray-200">
            {columns.map(col => {
              const key = String(col.key);
              const active = sort.key === key;
              return (
                <th key={key} className="px-5 py-3 text-left text-[13px] font-medium text-gray-600 whitespace-nowrap">
                  <span
                    className={col.sortable ? 'cursor-pointer select-none' : 'cursor-default'}
                    onClick={() => col.sortable && handleSort(key)}
                  >
                    {col.label}
                    {col.sortable && <SortIcons active={active} dir={active ? sort.dir : null} />}
                  </span>
                </th>
              );
            })}
            {onAction && <th className="px-3 py-3 w-10 bg-[#eef4f2]" />}
          </tr>
        </thead>
        <tbody>
          {sorted.length === 0 ? (
            <tr>
              <td colSpan={columns.length + (onAction ? 1 : 0)} className="py-12 px-5 text-center text-gray-400 text-[14px]">
                No data found.
              </td>
            </tr>
          ) : sorted.map(row => (
            <tr
              key={row.id}
              className="border-b border-gray-300 hover:bg-gray-50 transition-colors"
              style={onRowClick ? { cursor: 'pointer' } : undefined}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
            >
              {columns.map(col => {
                const key = String(col.key);
                const val = (row as Record<string, unknown>)[key];
                return (
                  <td key={key} className="px-5 py-3.5 text-gray-800 align-middle first:font-medium">
                    {col.render ? col.render(val, row) : (
                      key === 'status' ? (
                        <span className="inline-flex items-center justify-center w-[22px] h-[22px] rounded-full border-2 border-[#22c55e]">
                          <Check size={13} className="text-[#22c55e]" strokeWidth={2.5} />
                        </span>
                      ) : String(val ?? '')
                    )}
                  </td>
                );
              })}
              {onAction && (
                <td className="px-3 py-3.5 text-gray-800 align-middle" onClick={e => e.stopPropagation()}>
                  <button
                    className="bg-transparent border-none cursor-pointer text-gray-400 p-1 rounded transition-all hover:text-gray-600 hover:bg-gray-100"
                    onClick={e => { e.stopPropagation(); onAction(row); }}
                  >
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
