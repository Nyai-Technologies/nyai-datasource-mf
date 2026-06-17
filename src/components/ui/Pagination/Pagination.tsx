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
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1 && !onPageSize) return null;

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

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-[#b8c1d3]">
      <div className="flex items-center gap-1">
        <button
          className={`${pageBtnBase} ${page === 1 ? 'opacity-40 cursor-not-allowed' : 'hover:border-[#1e7070] hover:text-[#1e7070]'}`}
          onClick={() => page > 1 && onPage(page - 1)}
        >
          <ChevronLeft size={14} />
        </button>

        {pages.map((p, i) =>
          p === '...' ? (
            <span key={`dots-${i}`} className="w-[30px] h-[30px] flex items-center justify-center text-[#9ca3af] text-[12px]">…</span>
          ) : (
            <button
              key={p}
              className={`${pageBtnBase} ${p === page ? 'bg-[#1e7070] border-[#1e7070] text-white font-semibold' : 'hover:border-[#1e7070] hover:text-[#1e7070]'}`}
              onClick={() => onPage(p as number)}
            >
              {p}
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
