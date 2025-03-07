import { FaSortUp, FaSortDown, FaEdit, FaTrash } from 'react-icons/fa'
import { formatDate } from '../utils/bookUtils'
import BookDetailsModal from './BookDetailsModal'
import { useState, useEffect } from 'react'

const TABLE_COLUMNS = [
  { key: 'title', label: 'TITLE', sortable: true, required: true },
  { key: 'author', label: 'AUTHOR', sortable: true, required: true },
  { key: 'seriesTitle', label: 'SERIES TITLE', sortable: false },
  { key: 'publisher', label: 'PUBLISHER', sortable: true },
  { key: 'placeOfPublication', label: 'PLACE OF PUBLICATION', sortable: false },
  { key: 'year', label: 'YEAR', sortable: true, type: 'number' },
  { key: 'edition', label: 'EDITION', sortable: false },
  { key: 'volume', label: 'VOLUME', sortable: false },
  { key: 'physicalDescription', label: 'PHYSICAL DESCRIPTION', sortable: false },
  { key: 'isbn', label: 'ISBN', sortable: false },
  { key: 'accessionNo', label: 'ACCESSION NUMBER', sortable: true },
  { key: 'callNumber', label: 'CALL NUMBER', sortable: true }, // Add this line
  { key: 'copy_number', label: 'COPY NO.', sortable: true, required: true },
  { key: 'barcode', label: 'BARCODE', sortable: false },
  { key: 'dateReceived', label: 'DATE RECEIVED', sortable: true, type: 'date', required: true },
  { key: 'subject', label: 'SUBJECT', sortable: false },
  { key: 'dateProcessed', label: 'DATE PROCESSED', sortable: true, type: 'date' },
  { key: 'processedBy', label: 'PROCESSED BY', sortable: true },
  { key: 'status', label: 'STATUS', sortable: true }
]

const BooksTable = ({
  books,
  isLoading,
  isFetchingAll,
  sortConfig,
  onSort,
  onEditBook,
  onDeleteBook,
  onRowClick
}) => {
  const [selectedBook, setSelectedBook] = useState(null)
  const [windowWidth, setWindowWidth] = useState(window.innerWidth)

  // Add window resize listener
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleRowClick = (book) => {
    if (windowWidth <= 1500) {
      setSelectedBook(book)
      // Remove the onRowClick call since we're handling the modal internally
      // onRowClick && onRowClick(book) // Remove this line
    }
  }

  const renderCellContent = (column, value, book) => {
    if (!value && value !== 0) return '-'

    switch (column.type) {
      case 'date':
        return formatDate(value)
      case 'number':
        return value.toString()
      default:
        if (column.key === 'status') {
          return <span className={`status-badge ${value.toLowerCase()}`}>{value}</span>
        }
        if (column.key === 'copy_number') {
          // Remove any existing "of" format and extract just the number
          const copyNum = value.toString().split(' of ')[0]
          const totalCopies = parseInt(book.copies)
          return totalCopies ? `${copyNum} of ${totalCopies}` : copyNum
        }
        return value
    }
  }

  const renderTableHeader = () => (
    <thead>
      <tr>
        {TABLE_COLUMNS.map((column) => (
          <th
            key={column.key}
            className={`col-${column.key} ${column.sortable ? 'sortable' : ''}`}
            onClick={(e) => {
              e.stopPropagation() // Stop event propagation
              if (column.sortable) {
                onSort(column.key)
              }
            }}
            data-column={column.key}
          >
            <div className="header-content">
              {column.label}
              {column.required && <span className="required-indicator">*</span>}
              {column.sortable && sortConfig.column === column.key && (
                <span className="sort-icon">
                  {sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />}
                </span>
              )}
            </div>
          </th>
        ))}
        <th className="col-action" data-column="action">
          ACTION
        </th>
      </tr>
    </thead>
  )

  const renderLoadingState = () => (
    <tbody>
      <tr>
        <td colSpan={TABLE_COLUMNS.length + 1} className="loading-cell">
          <div className="table-spinner"></div>
          <span className="table-loading-text">
            {isFetchingAll ? 'Loading all books for sorting...' : 'Loading books...'}
          </span>
        </td>
      </tr>
    </tbody>
  )

  const renderEmptyState = () => (
    <tbody>
      <tr>
        <td colSpan={TABLE_COLUMNS.length + 1} style={{ textAlign: 'center', padding: '20px' }}>
          No books found
        </td>
      </tr>
    </tbody>
  )

  const renderTableBody = () => (
    <tbody>
      {books.slice(0, 10).map((book, index) => (
        <tr
          key={book.id || index}
          onClick={() => handleRowClick(book)}
          style={{ cursor: windowWidth <= 1500 ? 'pointer' : 'default' }}
        >
          {TABLE_COLUMNS.map((column) => (
            <td key={column.key} className={`col-${column.key}`} data-content={book[column.key]}>
              {renderCellContent(column, book[column.key], book)}
            </td>
          ))}
          <td className="col-action">
            <div className="action-buttons-container">
              <button className="action-btn edit" onClick={() => onEditBook(book)} title="Edit">
                <FaEdit />
              </button>
              <button
                className="action-btn delete"
                onClick={() => onDeleteBook(book.id)}
                title="Delete"
              >
                <FaTrash />
              </button>
            </div>
          </td>
        </tr>
      ))}
      {books.length < 10 &&
        [...Array(10 - books.length)].map((_, index) => (
          // Add empty rows to maintain consistent height
          <tr key={`empty-${index}`} style={{ height: '61px' }}>
            {TABLE_COLUMNS.map((column) => (
              <td key={column.key} className={`col-${column.key}`}></td>
            ))}
            <td className="col-action"></td>
          </tr>
        ))}
    </tbody>
  )

  return (
    <>
      <div className="table-container">
        <div className="books-table-wrapper">
          <table className="books-table" role="grid">
            {renderTableHeader()}
            {isLoading || isFetchingAll
              ? renderLoadingState()
              : !books.length
                ? renderEmptyState()
                : renderTableBody()}
          </table>
        </div>
      </div>

      {windowWidth <= 1500 && (
        <BookDetailsModal
          book={selectedBook}
          isOpen={!!selectedBook}
          onClose={() => setSelectedBook(null)}
          onEdit={onEditBook}
          onDelete={onDeleteBook}
        />
      )}
    </>
  )
}

export default BooksTable
