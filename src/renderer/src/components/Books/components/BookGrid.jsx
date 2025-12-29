import { FaEdit, FaTrash, FaEye } from 'react-icons/fa'
import BookGridSkeleton from './BookGridSkeleton'
import './BookGrid.css'

const BookGrid = ({ books, isLoading, onEditBook, onDeleteBook, onViewDetails }) => {
  if (isLoading) {
    return <BookGridSkeleton count={4} />
  }

  if (!books || books.length === 0) {
    return (
      <div className="book-grid-container">
        <div className="empty-state">
          <p className="empty-state-text">No books found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="book-grid-container">
      <div className="books-grid">
        {books.map((book) => (
          <div key={book.id} className="book-card">
            {/* Book Cover */}
            <div className="book-cover-container">
              {book.book_cover ? (
                <img src={book.book_cover} alt={book.title} className="book-cover" />
              ) : (
                <div className="book-cover-placeholder">
                  <span className="placeholder-icon">📚</span>
                </div>
              )}
              <div className="book-status-badge">{book.status}</div>
            </div>

            {/* Book Info */}
            <div className="book-info">
              <h3 className="book-title" title={book.title}>
                {book.title}
              </h3>
              <p className="book-author" title={book.author}>
                {book.author}
              </p>

              {book.publisher && (
                <p className="book-publisher">
                  <span className="label">Publisher:</span> {book.publisher}
                </p>
              )}

              {book.year && (
                <p className="book-year">
                  <span className="label">Year:</span> {book.year}
                </p>
              )}

              {book.isbn && (
                <p className="book-isbn">
                  <span className="label">ISBN:</span> {book.isbn}
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="book-actions">
              <button
                className="action-btn view-btn"
                onClick={() => onViewDetails(book)}
                title="View Details"
                aria-label="View book details"
              >
                <FaEye size={16} />
              </button>
              <button
                className="action-btn edit-btn"
                onClick={() => onEditBook(book)}
                title="Edit Book"
                aria-label="Edit book"
              >
                <FaEdit size={16} />
              </button>
              <button
                className="action-btn delete-btn"
                onClick={() => onDeleteBook(book)}
                title="Delete Book"
                aria-label="Delete book"
              >
                <FaTrash size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default BookGrid
