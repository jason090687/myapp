import { FaSortUp, FaSortDown } from 'react-icons/fa'
import { formatDate } from '../utils/bookUtils'

const TABLE_COLUMNS = [
  { key: 'title', label: 'TITLE', sortable: true },
  { key: 'author', label: 'AUTHOR', sortable: true },
  { key: 'seriesTitle', label: 'SERIES TITLE', sortable: false },
  { key: 'publisher', label: 'PUBLISHER', sortable: true },
  { key: 'placeOfPublication', label: 'PLACE OF PUBLICATION', sortable: false },
  { key: 'year', label: 'YEAR', sortable: true, type: 'number' },
  { key: 'edition', label: 'EDITION', sortable: false },
  { key: 'volume', label: 'VOLUME', sortable: false },
  { key: 'physicalDescription', label: 'PHYSICAL DESCRIPTION', sortable: false },
  { key: 'isbn', label: 'ISBN', sortable: false },
  { key: 'accessionNo', label: 'ACCESSION NUMBER', sortable: true },
  { key: 'copy_number', label: 'COPY NO.', sortable: true },
  { key: 'barcode', label: 'BARCODE', sortable: false },
  { key: 'dateReceived', label: 'DATE RECEIVED', sortable: true, type: 'date' },
  { key: 'subject', label: 'SUBJECT', sortable: false },
  { key: 'dateProcessed', label: 'DATE PROCESSED', sortable: true, type: 'date' },
  { key: 'processedBy', label: 'PROCESSED BY', sortable: true },
  { key: 'status', label: 'STATUS', sortable: true }
]

function BooksTable({
  books,
  isLoading,
  isFetchingAll,
  sortConfig,
  onSort,
  onEditBook,
  onDeleteBook
}) {
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
          return `${book.copy_number} of ${book.copies}`
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
            onClick={() => column.sortable && onSort(column.key)}
          >
            <div className="header-content">
              {column.label}
              {column.sortable && sortConfig.column === column.key && (
                <span className="sort-icon">
                  {sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />}
                </span>
              )}
            </div>
          </th>
        ))}
        <th className="col-action">ACTION</th>
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
      {books.map((book, index) => (
        <tr key={book.id || index}>
          {TABLE_COLUMNS.map((column) => (
            <td key={column.key} className={`col-${column.key}`} data-content={book[column.key]}>
              {renderCellContent(column, book[column.key], book)}
            </td>
          ))}
          <td className="col-action">
            <div className="action-buttons-container">
              <button className="action-btn edit" onClick={() => onEditBook(book)}>
                Edit
              </button>
              <button className="action-btn delete" onClick={() => onDeleteBook(book.id)}>
                Delete
              </button>
            </div>
          </td>
        </tr>
      ))}
    </tbody>
  )

  return (
    <div className="table-container">
      <div className="books-table-wrapper">
        <table className="books-table">
          {renderTableHeader()}
          {isLoading || isFetchingAll
            ? renderLoadingState()
            : !books.length
              ? renderEmptyState()
              : renderTableBody()}
        </table>
      </div>
    </div>
  )
}

export default BooksTable
