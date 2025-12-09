import PropTypes from 'prop-types';
import { Button } from '@components/ui/button';

/**
 * Reusable pagination controls component
 * @param {Object} props
 * @param {number} props.currentPage - Current page number
 * @param {number} props.totalPages - Total number of pages
 * @param {Function} props.onPageChange - Callback when page changes (receives new page number)
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.showPageInfo - Whether to show "Page X of Y" text (default: true)
 */
export function PaginationControls({
  currentPage,
  totalPages,
  onPageChange,
  className = '',
  showPageInfo = true,
}) {
  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  if (totalPages <= 1) {
    return null; // Don't show pagination if there's only one page or no pages
  }

  return (
    <div className={`flex items-center justify-center gap-4 ${className}`}>
      <Button
        variant="outline"
        disabled={currentPage === 1}
        onClick={handlePrevious}
      >
        Previous
      </Button>
      
      {showPageInfo && (
        <span className="text-sm text-gray-600">
          Page {currentPage} of {totalPages}
        </span>
      )}
      
      <Button
        variant="outline"
        disabled={currentPage === totalPages}
        onClick={handleNext}
      >
        Next
      </Button>
    </div>
  );
}

PaginationControls.propTypes = {
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  className: PropTypes.string,
  showPageInfo: PropTypes.bool,
};

export default PaginationControls;

