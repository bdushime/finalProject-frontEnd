import PropTypes from 'prop-types';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

function getPageItems({ currentPage, totalPages, maxPageButtons }) {
  if (totalPages <= 1) return [];

  const maxButtons = Math.max(5, maxPageButtons || 7);
  const pages = [];

  // Always show first/last. Show a small window around the current page.
  const first = 1;
  const last = totalPages;

  const windowStart = Math.max(first, currentPage - 2);
  const windowEnd = Math.min(last, currentPage + 2);

  pages.push(first);

  if (windowStart > first + 1) pages.push('ellipsis-left');

  for (let p = windowStart; p <= windowEnd; p += 1) {
    if (p !== first && p !== last) pages.push(p);
  }

  if (windowEnd < last - 1) pages.push('ellipsis-right');

  if (last !== first) pages.push(last);

  // If `maxPageButtons` is extremely small, trim while keeping first/last.
  if (pages.filter((x) => typeof x === 'number').length > maxButtons) {
    return [first, 'ellipsis-left', currentPage, 'ellipsis-right', last];
  }

  return pages;
}

export function NotificationsPagination({
  currentPage,
  totalPages,
  onPageChange,
  className = '',
  showPageNumbers = true,
  maxPageButtons = 7,
}) {
  if (totalPages <= 1) return null;

  const pageItems = showPageNumbers
    ? getPageItems({ currentPage, totalPages, maxPageButtons })
    : [];

  return (
    <nav aria-label="Notifications pagination" className={className}>
      <div className="flex items-center justify-center gap-2 sm:gap-4 mt-6">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="h-9"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Previous page</span>
        </Button>

        {showPageNumbers && (
          <div className="flex items-center gap-1">
            {pageItems.map((item, idx) => {
              if (item === 'ellipsis-left' || item === 'ellipsis-right') {
                return (
                  <span
                    key={`${item}-${idx}`}
                    className="px-2 text-slate-400 select-none"
                    aria-hidden="true"
                  >
                    ...
                  </span>
                );
              }

              const pageNumber = item;
              const active = pageNumber === currentPage;

              return (
                <Button
                  key={pageNumber}
                  type="button"
                  variant={active ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onPageChange(pageNumber)}
                  aria-current={active ? 'page' : undefined}
                  className={`min-w-9 h-9 px-3 ${
                    active ? 'shadow-sm' : 'bg-white'
                  }`}
                >
                  {pageNumber}
                </Button>
              );
            })}
          </div>
        )}

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="h-9"
        >
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">Next page</span>
        </Button>
      </div>
    </nav>
  );
}

NotificationsPagination.propTypes = {
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  className: PropTypes.string,
  showPageNumbers: PropTypes.bool,
  maxPageButtons: PropTypes.number,
};

