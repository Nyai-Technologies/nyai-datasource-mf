import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './Pagination.module.scss';

interface PaginationProps {
  page: number;
  total: number;
  pageSize: number;
  onPage: (p: number) => void;
  onPageSize?: (ps: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  page,
  total,
  pageSize,
  onPage,
  onPageSize,
}) => {
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
    <div className={styles.wrapper}>
      <div className={styles.pages}>
        <button
          className={`${styles.arrow} ${page === 1 ? styles.disabled : ''}`}
          onClick={() => page > 1 && onPage(page - 1)}
        >
          <ChevronLeft />
        </button>

        {pages.map((p, i) =>
          p === '...' ? (
            <span key={`dots-${i}`} className={styles.dots}>…</span>
          ) : (
            <button
              key={p}
              className={`${styles.page} ${p === page ? styles.active : ''}`}
              onClick={() => onPage(p as number)}
            >
              {p}
            </button>
          ),
        )}

        <button
          className={`${styles.arrow} ${page === totalPages ? styles.disabled : ''}`}
          onClick={() => page < totalPages && onPage(page + 1)}
        >
          <ChevronRight />
        </button>
      </div>

      {onPageSize && (
        <div className={styles.perPage}>
          <select value={pageSize} onChange={e => onPageSize(Number(e.target.value))}>
            {[10, 20, 50].map(n => <option key={n} value={n}>{n} / page</option>)}
          </select>
        </div>
      )}
    </div>
  );
};
