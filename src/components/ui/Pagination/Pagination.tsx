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

  const pages: (number | '...')[] = [];
  if (totalPages <= 5) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push('...');
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
    if (page < totalPages - 2) pages.push('...');
    pages.push(totalPages);
  }

  const enriched: ({ type: 'page'; value: number } | { type: 'dots'; jump: number })[] =
    pages.map((p, i) => {
      if (p === '...') {
        const prev = pages[i - 1] as number;
        const next = pages[i + 1] as number;
        return { type: 'dots', jump: Math.round((prev + next) / 2) };
      }
      return { type: 'page', value: p };
    });

  return (
    <div className="flex items-center justify-end gap-1.5 px-5 py-3">
      <button
        className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 text-gray-500 disabled:opacity-30 hover:bg-gray-50 cursor-pointer text-base"
        onClick={() => page > 1 && onPage(page - 1)}
        disabled={page === 1}
      >
        ‹
      </button>

      {enriched.map((item) =>
        item.type === 'dots' ? (
          <button
            key={`dots-${item.jump}`}
            type="button"
            className="w-7 h-7 flex items-center justify-center text-gray-400 text-sm cursor-pointer select-none hover:text-gray-600"
            onClick={() => onPage(item.jump)}
          >
            …
          </button>
        ) : (
          <button
            key={item.value}
            className={`w-7 h-7 flex items-center justify-center rounded text-sm cursor-pointer ${
              item.value === page
                ? 'bg-[#1a5c4a] text-white'
                : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
            onClick={() => onPage(item.value)}
          >
            {item.value}
          </button>
        ),
      )}

      <button
        className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 text-gray-500 disabled:opacity-30 hover:bg-gray-50 cursor-pointer text-base"
        onClick={() => page < totalPages && onPage(page + 1)}
        disabled={page === totalPages}
      >
        ›
      </button>

      {onPageSize && (
        <select
          className="ml-2 text-sm text-gray-500 border border-gray-200 rounded px-2 py-1 outline-none cursor-pointer"
          value={pageSize}
          onChange={e => onPageSize(Number(e.target.value))}
        >
          {[10, 20, 50].map(n => <option key={n} value={n}>{n} / page</option>)}
        </select>
      )}
    </div>
  );
};
