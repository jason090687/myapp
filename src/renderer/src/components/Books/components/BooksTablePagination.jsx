import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'

function BooksTablePagination({ currentPage, totalPages, totalItems, onPageChange }) {
  return (
    <div className="pagination">
      <button
        className="pagination-btn"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <FaChevronLeft />
      </button>

      <span className="pagination-info">
        Page {currentPage} of {totalPages}
        <span className="pagination-total">(Total: {totalItems})</span>
      </span>

      <button
        className="pagination-btn"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
      >
        <FaChevronRight />
      </button>
    </div>
  )
}

export default BooksTablePagination
