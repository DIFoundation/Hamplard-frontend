'use client';

import { useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  /** Optional class applied to the root wrapper. */
  className?: string;
}

/**
 * Builds the array of items to render in the pagination bar.
 * Returns page numbers and null values (representing "…" ellipsis).
 *
 * Strategy:
 *  - Always show the first and last page.
 *  - Show up to 3 pages around the current page.
 *  - Insert an ellipsis wherever there is a gap > 1.
 */
function buildPageItems(currentPage: number, totalPages: number): (number | null)[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages = new Set<number>([1, totalPages]);

  for (let offset = -2; offset <= 2; offset++) {
    const p = currentPage + offset;
    if (p > 1 && p < totalPages) pages.add(p);
  }

  const sorted = Array.from(pages).sort((a, b) => a - b);

  const items: (number | null)[] = [];
  for (let i = 0; i < sorted.length; i++) {
    items.push(sorted[i]);
    if (i < sorted.length - 1 && sorted[i + 1] - sorted[i] > 1) {
      items.push(null); // ellipsis placeholder
    }
  }

  return items;
}

export function Pagination({ currentPage, totalPages, onPageChange, className }: PaginationProps) {
  const pageButtonRefs = useRef<Map<number, HTMLButtonElement>>(new Map());
  const hasMounted = useRef(false);

  // Re-focus the active page button after a page change so keyboard users don't
  // lose their position. Skip the very first render to avoid stealing page focus.
  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }
    pageButtonRefs.current.get(currentPage)?.focus();
  }, [currentPage]);

  if (totalPages <= 1) return null;

  const items = buildPageItems(currentPage, totalPages);

  function handleArrowKey(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'ArrowLeft' && currentPage > 1) {
      e.preventDefault();
      onPageChange(currentPage - 1);
    } else if (e.key === 'ArrowRight' && currentPage < totalPages) {
      e.preventDefault();
      onPageChange(currentPage + 1);
    }
  }

  return (
    <nav
      aria-label="Pagination"
      className={cn('flex items-center justify-center gap-1', className)}
      onKeyDown={handleArrowKey}
    >
      {/* ── Previous ── */}
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Go to previous page"
        className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-ink-200 text-ink-600 transition-colors hover:bg-ink-50 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
      </button>

      {/* ── Mobile label ── */}
      <span className="sm:hidden px-3 py-1.5 text-sm text-ink-600">
        Page {currentPage} of {totalPages}
      </span>

      {/* ── Page buttons (hidden on mobile) ── */}
      <div className="hidden sm:contents" role="group" aria-label="Page numbers">
        {items.map((item, idx) =>
          item === null ? (
            <span
              key={`ellipsis-${idx}`}
              className="flex h-9 w-9 items-center justify-center text-sm text-ink-400"
              aria-hidden="true"
            >
              …
            </span>
          ) : (
            <button
              key={item}
              ref={(el) => {
                if (el) pageButtonRefs.current.set(item, el);
                else pageButtonRefs.current.delete(item);
              }}
              type="button"
              onClick={() => onPageChange(item)}
              aria-label={`Page ${item}`}
              aria-current={item === currentPage ? 'page' : undefined}
              className={cn(
                'inline-flex h-9 w-9 items-center justify-center rounded-xl text-sm font-medium transition-all',
                item === currentPage
                  ? 'bg-hamplard-primary text-white shadow-sm'
                  : 'border border-ink-200 text-ink-600 hover:bg-ink-50',
              )}
            >
              {item}
            </button>
          ),
        )}
      </div>

      {/* ── Next ── */}
      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Go to next page"
        className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-ink-200 text-ink-600 transition-colors hover:bg-ink-50 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
      </button>
    </nav>
  );
}
