import { FaEdit, FaTrash } from 'react-icons/fa'
import { formatDate } from '../utils/bookUtils'
import { useState, useEffect, useCallback } from 'react'
import Pagination from '../../Pagination'

const TABLE_COLUMNS = [
  { key: 'title', label: 'TITLE', sortable: true, required: true },
  { key: 'author', label: 'AUTHOR', sortable: true, required: true },
  { key: 'series_title', label: 'SERIES TITLE', sortable: false },
  { key: 'publisher', label: 'PUBLISHER', sortable: true },
  { key: 'place_of_publication', label: 'PLACE OF PUBLICATION', sortable: false },
  { key: 'year', label: 'YEAR', sortable: true, type: 'number' },
  { key: 'edition', label: 'EDITION', sortable: false },
  { key: 'volume', label: 'VOLUME', sortable: false },
  { key: 'physical_description', label: 'PHYSICAL DESCRIPTION', sortable: false },
  { key: 'isbn', label: 'ISBN', sortable: false },
  { key: 'accession_number', label: 'ACCESSION NUMBER', sortable: true },
  { key: 'call_number', label: 'CALL NUMBER', sortable: true },
  { key: 'copies', label: 'COPY NO.', sortable: true, required: true },
  { key: 'barcode', label: 'BARCODE', sortable: false },
  { key: 'date_received', label: 'DATE RECEIVED', sortable: true, type: 'date', required: true },
  { key: 'subject', label: 'SUBJECT', sortable: false },
  { key: 'date_processed', label: 'DATE PROCESSED', sortable: true, type: 'date' },
  { key: 'name', label: 'PROCESSED BY', sortable: true },
  { key: 'status', label: 'STATUS', sortable: true }
]

const BooksTable = ({
  books,
  isLoading,
  isFetchingAll,
  onEditBook,
  onDeleteBook,
  onRowClick,
  pagination,
  onPageChange
}) => {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth)

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleRowClick = useCallback(
    (e, book) => {
      if (e.target.closest('.action-buttons-container')) {
        e.stopPropagation()
        return
      }

      if (windowWidth <= 1500) {
        e.preventDefault()
        e.stopPropagation()
        onRowClick?.(book)
      }
    },
    [windowWidth, onRowClick]
  )

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
        if (column.key === 'copies') {
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
          <th key={column.key} className={`col-${column.key}`} data-column={column.key}>
            <div className="header-content">
              {column.label}
              {column.required && <span className="required-indicator">*</span>}
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
          onClick={(e) => handleRowClick(e, book)}
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
                onClick={() => onDeleteBook(book.id, book.title)}
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

export default BooksTable
