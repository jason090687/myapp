import { Edit2, Trash2, Eye, BookOpen, Tag, Calendar, Library } from 'lucide-react'
import BookGridSkeleton from './BookGridSkeleton'
import Pagination from '../../Pagination'
import './BookGrid.css'

const BookGrid = ({
  books,
  isLoading,
  onEditBook,
  onDeleteBook,
  onViewDetails,
  pagination,
  onPageChange
}) => {
  const getStatusColor = (status) => {
    const statusLower = status?.toLowerCase()
    if (statusLower === 'available') return 'status-available'
    if (statusLower === 'borrowed') return 'status-borrowed'
    if (statusLower === 'reserved') return 'status-reserved'
    return 'status-default'
  }

  if (isLoading) {
    return (
      <div className="book-grid-wrapper">
        <BookGridSkeleton count={4} />
      </div>
    )
  }

  if (!books || books.length === 0) {
    return (
      <div className="book-grid-wrapper">
        <div className="book-grid-container">
          <div className="empty-state">
            <div className="empty-state-icon">
              <BookOpen size={48} />
            </div>
            <p className="empty-state-title">No books found</p>
            <p className="empty-state-description">Try adjusting your filters or search criteria</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="book-grid-wrapper">
      <div className="book-grid-container">
        <div className="books-grid">
          {books.map((book) => (
            <div key={book.id} className="book-card" onClick={() => onViewDetails(book)}>
              {/* Book Cover */}
              <div className="book-cover-container">
                {book.book_cover ? (
                  <img src={book.book_cover} alt={book.title} className="book-cover" />
                ) : (
                  <div className="book-cover-placeholder">
                    <BookOpen className="placeholder-icon" size={64} strokeWidth={1.5} />
                  </div>
                )}
                <div className={`book-status-badge ${getStatusColor(book.status)}`}>
                  {book.status}
                </div>
              </div>

              {/* Book Info */}
              <div className="book-info">
                <h3 className="book-title" title={book.title}>
                  {book.title}
                </h3>
                <p className="book-author" title={book.author}>
                  {book.author || 'Unknown Author'}
                </p>

                <div className="book-metadata">
                  {book.subject && (
                    <div className="metadata-item">
                      <Tag className="metadata-icon" size={14} />
                      <span className="metadata-text">{book.subject}</span>
                    </div>
                  )}
                  {book.year && (
                    <div className="metadata-item">
                      <Calendar className="metadata-icon" size={14} />
                      <span className="metadata-text">{book.year}</span>
                    </div>
                  )}
                  {book.copies > 0 && (
                    <div className="metadata-item">
                      <Library className="metadata-icon" size={14} />
                      <span className="metadata-text">
                        {book.copies} {book.copies === 1 ? 'copy' : 'copies'}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="book-actions">
                <button
                  className="action-btn action-btn-view"
                  onClick={(e) => {
                    e.stopPropagation()
                    onViewDetails(book)
                  }}
                  title="View Details"
                  aria-label="View book details"
                >
                  <Eye size={16} />
                  <span>View</span>
                </button>
                <button
                  className="action-btn action-btn-edit"
                  onClick={(e) => {
                    e.stopPropagation()
                    onEditBook(book)
                  }}
                  title="Edit Book"
                  aria-label="Edit book"
                >
                  <Edit2 size={16} />
                  <span>Edit</span>
                </button>
                <button
                  className="action-btn action-btn-delete"
                  onClick={(e) => {
                    e.stopPropagation()
                    onDeleteBook(book)
                  }}
                  title="Delete Book"
                  aria-label="Delete book"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      {pagination && !isLoading && books.length > 0 && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalItems={pagination.count}
          onPageChange={onPageChange}
        />
      )}
    </div>
  )
}

export default BookGrid
