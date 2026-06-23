import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  total: number;
  pageSize: number;
  onPage: (p: number) => void;
  onPageSize?: (ps: number) => void;
}

const pageBtnBase = 'w-[30px] h-[30px] flex items-center justify-center border border-[#b8c1d3] rounded-[6px] bg-white text-[12px] text-[#6b7280] cursor-pointer transition-all';

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

  // Pre-compute jump target for each ellipsis (stable, not computed during render)
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
    <div className="flex items-center justify-between px-4 py-3 border-t border-[#b8c1d3]">
      <div className="flex items-center gap-1">
        <button
          className={`${pageBtnBase} ${page === 1 ? 'opacity-40 cursor-not-allowed' : 'hover:border-[#1e7070] hover:text-[#1e7070]'}`}
          onClick={() => page > 1 && onPage(page - 1)}
        >
          <ChevronLeft size={14} />
        </button>

        {enriched.map((item) =>
          item.type === 'dots' ? (
            <button
              key={`dots-before-${item.jump}`}
              type="button"
              className="w-[30px] h-[30px] flex items-center justify-center bg-transparent border-none text-[#9ca3af] text-[13px] cursor-pointer select-none hover:text-[#1e7070]"
              onClick={() => onPage(item.jump)}
            >
              …
            </button>
          ) : (
            <button
              key={item.value}
              className={`${pageBtnBase} ${item.value === page ? 'bg-[#1e7070] border-[#1e7070] text-white font-semibold' : 'hover:border-[#1e7070] hover:text-[#1e7070]'}`}
              onClick={() => onPage(item.value)}
            >
              {item.value}
            </button>
          ),
        )}

        <button
          className={`${pageBtnBase} ${page === totalPages ? 'opacity-40 cursor-not-allowed' : 'hover:border-[#1e7070] hover:text-[#1e7070]'}`}
          onClick={() => page < totalPages && onPage(page + 1)}
        >
          <ChevronRight size={14} />
        </button>
      </div>

      {onPageSize && (
        <div className="flex items-center gap-2 text-[12px] text-[#6b7280]">
          <select
            className="h-[30px] pl-2 pr-6 border border-[#b8c1d3] rounded-[6px] text-[12px] text-[#6b7280] bg-white cursor-pointer outline-none appearance-none focus:border-[#1e7070]"
            value={pageSize}
            onChange={e => onPageSize(Number(e.target.value))}
          >
            {[10, 20, 50].map(n => <option key={n} value={n}>{n} / page</option>)}
          </select>
        </div>
      )}
    </div>
  );
};
