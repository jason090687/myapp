import { ChevronLeft, ChevronRight } from 'lucide-react'
import ActionButtons from './BorrowedTableActions'
import '../../pages/Borrowed.css'
import Pagination from '../Pagination'

const BorrowedTable = ({
  isLoading,
  getFilteredBooks,
  searchTerm,
  highlightedId,
  getRowClassName,
  windowWidth,
  handleRowClick,
  formatDate,
  getStatusBadgeClass,
  getStatusText,
  handleRenewClick,
  handleReturnBook,
  handleOverdueClick,
  isOverdue,
  pagination,
  totalPages,
  handlePageChange,
}) => {
  return (
    <div className="borrowed-table-container">
      <table className="borrowed-table">
        <thead>
          <tr>
            <th>Student</th>
            <th>Book</th>
            <th>Borrow Date</th>
            <th>Due Date</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan="6" className="loading-cell">
                <div className="borrowed-spinner"></div>
                <span className="borrowed-loading-text">Loading borrowed books...</span>
              </td>
            </tr>
          ) : getFilteredBooks().length === 0 ? (
            <tr>
              <td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>
                {searchTerm ? 'No matches found' : 'No borrowed books found'}
              </td>
            </tr>
          ) : (
            getFilteredBooks().map((item) => (
              <tr
                key={item.id}
                id={`borrowed-item-${item.id}`}
                onClick={() => handleRowClick(item)}
                style={{ cursor: 'pointer' }}
                className={`${highlightedId === item.id.toString() ? 'highlighted' : getRowClassName(item)
                  } ${windowWidth <= 1500 ? 'clickable-row' : ''}`}
              >
                <td>{item.student_name}</td>
                <td>{item.book_title}</td>
                <td>{formatDate(item.borrowed_date)}</td>
                <td>{formatDate(item.due_date)}</td>

                <td>
                  <div className="status-badge-container">
                    <span className={`status-badge ${getStatusBadgeClass(item)}`}>
                      {getStatusText(item)}
                    </span>
                  </div>
                </td>

                <td>
                  <ActionButtons
                    item={item}
                    handleReturnBook={handleReturnBook}
                    handleRenewClick={handleRenewClick}
                    handleOverdueClick={handleOverdueClick}
                    isOverdue={isOverdue}
                  />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <Pagination
        currentPage={pagination.currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  )
}

export default BorrowedTable
