import React from 'react';

interface PaginationProps {
  page: number;
  total: number;
  pageSize: number;
  onPage: (p: number) => void;
  onPageSize?: (ps: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({ page, total, pageSize, onPage, onPageSize }) => {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const btnBase = 'w-7 h-7 flex items-center justify-center rounded border border-gray-200 text-gray-500 disabled:opacity-30 hover:bg-gray-50 cursor-pointer';

  const visiblePages = [...Array(Math.min(totalPages, 3))].map((_, i) => i + 1);

  return (
    <div className="flex items-center justify-end gap-1.5 px-5 py-3 border-t border-[#b8c1d3]">
      <button
        onClick={() => onPage(Math.max(1, page - 1))}
        disabled={page === 1}
        className={btnBase}
      >‹</button>

      {visiblePages.map(p => (
        <button
          key={p}
          onClick={() => onPage(p)}
          className={`w-7 h-7 flex items-center justify-center rounded text-sm cursor-pointer ${
            page === p ? 'bg-[#1a5c4a] text-white' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >{p}</button>
      ))}

      {totalPages > 3 && <span className="text-gray-400 text-sm">…</span>}

      <button
        onClick={() => onPage(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        className={btnBase}
      >›</button>

      {onPageSize ? (
        <select
          className="ml-2 text-sm text-gray-500 border border-gray-200 rounded px-2 py-1 bg-white outline-none cursor-pointer"
          value={pageSize}
          onChange={e => onPageSize(Number(e.target.value))}
        >
          {[10, 20, 50].map(n => <option key={n} value={n}>{n} / page</option>)}
        </select>
      ) : (
        <span className="ml-2 text-sm text-gray-500 border border-gray-200 rounded px-2 py-1">{pageSize} / page</span>
      )}
    </div>
  );
};
