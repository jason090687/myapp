import PropTypes from 'prop-types'
import StatusBadge from './StatusBadge'
import BorrowedTableActions from './BorrowedTableActions'
import { formatDate } from '../utils/dateUtils'
import { getRowClassName, sortBorrowedBooks } from '../utils/statusUtils'
import Pagination from '../../Pagination'
import { useMemo, useState, useEffect } from 'react'
import BorrowedDetailsModal from '../../BorrowDetails/BorrowDetailsModal'
import './BorrowedTable.css'

const TABLE_COLUMNS = [
  { key: 'student', label: 'Student', render: (item) => item.student || 'N/A' },
  { key: 'book', label: 'Book', render: (item) => item.book || 'N/A' },
  {
    key: 'borrowed_date',
    label: 'Borrow Date',
    render: (item) => formatDate(item.borrowed_date)
  },
  {
    key: 'due_date',
    label: 'Due Date',
    render: (item) => formatDate(item.due_date)
  },
  {
    key: 'status',
    label: 'Status',
    render: (item) => <StatusBadge item={item} />
  },
  {
    key: 'actions',
    label: 'Action',
    render: (item, { onReturn, onRenew, onOverdue }) => (
      <BorrowedTableActions
        item={item}
        onReturn={onReturn}
        onRenew={onRenew}
        onOverdue={onOverdue}
      />
    )
  }
]

const BorrowedTable = ({
  books = [],
  isLoading = false,
  pagination = {
    currentPage: 1,
    totalPages: 1,
    count: 0,
    next: null,
    previous: null
  },
  onPageChange,
  onReturn,
  onRenew,
  onOverdue
}) => {
  const [selectedBook, setSelectedBook] = useState(null)
  const [windowWidth, setWindowWidth] = useState(window.innerWidth)

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleRowClick = (item) => {
    if (windowWidth <= 1500) {
      setSelectedBook(item)
    }
  }

  // Sort books with unreturned items first
  const sortedBooks = useMemo(() => sortBorrowedBooks(books), [books])

  const renderLoadingState = () => (
    <tbody>
      <tr>
        <td colSpan="6" className="loading-cell">
          <div className="borrowed-spinner"></div>
          <span className="borrowed-loading-text">Loading borrowed books...</span>
        </td>
      </tr>
    </tbody>
  )

  const renderEmptyState = () => (
    <tbody>
      <tr>
        <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>
          No borrowed books found
        </td>
      </tr>
    </tbody>
  )

  return (
    <div className="table-container">
      <div className="borrowed-table-wrapper">
        <table className="borrowed-table">
          <thead>
            <tr>
              {TABLE_COLUMNS.map((column) => (
                <th key={column.key}>{column.label}</th>
              ))}
            </tr>
          </thead>
          {isLoading ? (
            renderLoadingState()
          ) : !sortedBooks || sortedBooks.length === 0 ? (
            renderEmptyState()
          ) : (
            <tbody>
              {sortedBooks.map((item) => (
                <tr
                  key={item.id || Math.random()}
                  className={`${getRowClassName(item)} ${windowWidth <= 1500 ? 'clickable-row' : ''}`}
                  onClick={() => handleRowClick(item)}
                >
                  {TABLE_COLUMNS.map((column) => (
                    <td key={column.key}>
                      {column.render(item, { onReturn, onRenew, onOverdue })}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          )}
        </table>
      </div>

      {selectedBook && windowWidth <= 1500 && (
        <BorrowedDetailsModal
          isOpen={true}
          onClose={() => setSelectedBook(null)}
          borrowData={selectedBook}
          onReturn={onReturn}
          onRenew={onRenew}
          onPay={onOverdue}
        />
      )}

      {!isLoading && books && books.length > 0 && pagination && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPageChange={onPageChange}
          disabled={isLoading}
        />
      )}
    </div>
  )
}

BorrowedTable.propTypes = {
  books: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      student: PropTypes.string,
      book: PropTypes.string,
      borrowed_date: PropTypes.string,
      due_date: PropTypes.string,
      is_returned: PropTypes.bool,
      paid: PropTypes.bool
    })
  ),
  isLoading: PropTypes.bool,
  pagination: PropTypes.shape({
    count: PropTypes.number,
    currentPage: PropTypes.number,
    totalPages: PropTypes.number,
    next: PropTypes.string,
    previous: PropTypes.string
  }),
  onPageChange: PropTypes.func.isRequired,
  onReturn: PropTypes.func.isRequired,
  onRenew: PropTypes.func.isRequired,
  onOverdue: PropTypes.func.isRequired
}

export default BorrowedTable
