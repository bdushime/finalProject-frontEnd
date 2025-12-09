import { useMemo } from 'react';

/**
 * Custom hook for pagination logic
 * @param {Array} items - The array of items to paginate
 * @param {number} currentPage - The current page number (1-indexed)
 * @param {number} pageSize - Number of items per page
 * @returns {Object} Pagination state and helpers
 */
export function usePagination(items = [], currentPage = 1, pageSize = 10) {
  const pagination = useMemo(() => {
    const totalItems = items.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
    const startIndex = (safeCurrentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedItems = items.slice(startIndex, endIndex);
    
    return {
      totalItems,
      totalPages,
      currentPage: safeCurrentPage,
      startIndex,
      endIndex,
      paginatedItems,
      hasNextPage: safeCurrentPage < totalPages,
      hasPreviousPage: safeCurrentPage > 1,
      isFirstPage: safeCurrentPage === 1,
      isLastPage: safeCurrentPage === totalPages,
    };
  }, [items, currentPage, pageSize]);

  return pagination;
}

