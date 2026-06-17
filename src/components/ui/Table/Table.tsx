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
    <span className={`flex flex-col gap-[1px] transition-opacity ${active ? 'opacity-100' : 'opacity-35'}`}>
      <svg viewBox="0 0 10 6" className="w-2 h-2" fill={active && dir === 'asc' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5">
        <path d="M1 5l4-4 4 4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <svg viewBox="0 0 10 6" className="w-2 h-2" fill={active && dir === 'desc' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5">
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
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse text-[14px]">
        <thead>
          <tr>
            {columns.map(col => {
              const key = String(col.key);
              const active = sort.key === key;
              return (
                <th key={key} className="px-4 py-3 bg-[#f0f5f5] text-[#1a2030] font-semibold text-[12px] text-left whitespace-nowrap border-b border-[#b8c1d3]">
                  <span
                    className={`inline-flex items-center gap-[6px] ${col.sortable ? 'cursor-pointer select-none' : 'cursor-default'} ${active ? '[&>span]:opacity-100' : ''}`}
                    onClick={() => col.sortable && handleSort(key)}
                  >
                    {col.label}
                    {col.sortable && <SortIcons active={active} dir={active ? sort.dir : null} />}
                  </span>
                </th>
              );
            })}
            {onAction && <th className="px-4 py-3 bg-[#f0f5f5] border-b border-[#b8c1d3]" />}
          </tr>
        </thead>
        <tbody>
          {sorted.length === 0 ? (
            <tr>
              <td colSpan={columns.length + (onAction ? 1 : 0)} className="py-12 px-4 text-center text-[#9ca3af] text-[14px]">
                No data found.
              </td>
            </tr>
          ) : sorted.map(row => (
            <tr
              key={row.id}
              className="transition-colors [&:hover_td]:bg-[#f8fafc] [&:last-child_td]:border-b-0"
              style={onRowClick ? { cursor: 'pointer' } : undefined}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
            >
              {columns.map(col => {
                const key = String(col.key);
                const val = (row as Record<string, unknown>)[key];
                return (
                  <td key={key} className="px-4 py-3 text-[#1a2030] border-b border-[#b8c1d3] align-middle first:font-medium">
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
                <td className="px-4 py-3 text-[#1a2030] border-b border-[#b8c1d3] align-middle">
                  <button
                    className="bg-transparent border-none cursor-pointer text-[#9ca3af] p-1 rounded-[3px] transition-all hover:text-[#1a2030] hover:bg-[#f1f5f9]"
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
