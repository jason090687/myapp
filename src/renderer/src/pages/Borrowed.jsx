import { useEffect, useState } from 'react'
import { Search, Plus, Filter, X } from 'lucide-react'
import { RotateCcw, RefreshCw, AlertCircle } from 'lucide-react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import { useSelector } from 'react-redux'
import { Button } from '../components/ui/button'
import {
  fetchBorrowedBooks,
  returnBook,
  renewBook,
  processOverduePayment,
  updateBook
} from '../Features/api'
import './Borrowed.css'
import BorrowBookModal from '../components/BorrowBookModal'
import RenewModal from '../components/RenewModal'
import OverdueModal from '../components/OverdueModal'
import { useSearchParams } from 'react-router-dom'
import BorrowDetailsModal from '../components/BorrowDetails/BorrowDetailsModal'
import { useToaster } from '../components/Toast/useToaster'

const Borrowed = () => {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setLoading] = useState(false)
  const [borrowedBooks, setBorrowedBooks] = useState([])
  const { token } = useSelector((state) => state.auth)
  const { showToast } = useToaster()
  const [pagination, setPagination] = useState({
    count: 0,
    next: null,
    previous: null,
    currentPage: 1
  })
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isRenewModalOpen, setIsRenewModalOpen] = useState(false)
  const [selectedBorrow, setSelectedBorrow] = useState(null)
  const [isOverdueModalOpen, setIsOverdueModalOpen] = useState(false)
  const [selectedOverdue, setSelectedOverdue] = useState(null)
  const [searchParams] = useSearchParams()
  const highlightedId = searchParams.get('id')
  const shouldHighlight = searchParams.get('highlight') === 'true'
  const [selectedBorrowDetails, setSelectedBorrowDetails] = useState(null)
  const [windowWidth, setWindowWidth] = useState(window.innerWidth)
  const [filterStatus, setFilterStatus] = useState('all')

  // Add function to check if book is overdue
  const isOverdue = (dueDate) => {
    const today = new Date()
    const due = new Date(dueDate)
    return due < today
  }

  // Add a class to overdue rows
  const getRowClassName = (item) => {
    let className = item.is_returned ? 'disabled-row' : ''
    if (!item.is_returned && isOverdue(item.due_date)) {
      className += ' overdue'
    }
    return className
  }

  // Add overdue status to status badge
  const getStatusBadgeClass = (item) => {
    if (item.is_returned) return 'returned'
    if (item.paid && isOverdue(item.due_date)) return 'paid-overdue'
    return isOverdue(item.due_date) ? 'overdue' : 'borrowed'
  }

  const getStatusText = (item) => {
    if (item.is_returned) return 'Returned'
    if (item.paid && isOverdue(item.due_date)) return 'Paid'
    return isOverdue(item.due_date) ? 'DUE' : 'BORROWED'
  }

  const sortBorrowedBooks = (books) => {
    return [...books].sort((a, b) => {
      if (a.is_returned !== b.is_returned) {
        return a.is_returned ? 1 : -1
      }

      return new Date(b.borrowed_date) - new Date(a.borrowed_date)
    })
  }

  const fetchBorrowedData = async (page = 1) => {
    if (!token) {
      console.error('Token missing: Skipping API call')
      return
    }

    setLoading(true)
    try {
      const response = await fetchBorrowedBooks(token, page)
      console.log(response)
      if (response) {
        const sortedBooks = sortBorrowedBooks(response.results || [])
        setBorrowedBooks(sortedBooks)
        setPagination({
          count: response.count || 0,
          next: response.next,
          previous: response.previous,
          currentPage: page
        })
      }
    } catch (error) {
      console.error('Error fetching borrowed books:', error.message)
    } finally {
      setLoading(false)
    }
  }

  // Fetch data only when token is available
  useEffect(() => {
    if (token) {
      fetchBorrowedData()
    }
  }, [token])

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString()

  const handleSidebarToggle = () => setIsCollapsed(!isCollapsed)

  const handlePageChange = (newPage) => {
    if (newPage > 0) {
      fetchBorrowedData(newPage)
    }
  }

  const handleBorrowBook = () => setIsModalOpen(true)

  const handleCloseModal = () => setIsModalOpen(false)

  const handleSubmitBorrow = async (borrowData) => {
    try {
      setIsModalOpen(false)
      await fetchBorrowedData(1)

      await updateBook(token, borrowData.book, {
        status: 'Borrowed'
      })
      showToast('Success', 'Book borrowed successfully!', 'success')
    } catch (error) {
      console.error('Error borrowing book:', error)
      showToast('Error', error.message || 'Failed to borrow book', 'error')
    }
  }

  const handleReturnBook = async (borrowId) => {
    const borrowItem = borrowedBooks.find((item) => item.id === borrowId)
    if (!borrowItem) {
      showToast('Error', 'Borrow record not found', 'error')
      return
    }

    try {
      await returnBook(token, borrowId, {
        returned_date: new Date().toISOString().split('T')[0]
      })
      await updateBook(token, borrowItem.book, {
        status: 'Available'
      })
      await fetchBorrowedData(pagination.currentPage)
      showToast('Success', 'Book returned successfully!', 'success')
    } catch (error) {
      console.error('Error returning book:', error)
      showToast('Error', error.message || 'Failed to return book', 'error')
    }
  }

  const handleRenewClick = (borrowItem) => {
    setSelectedBorrow({
      id: borrowItem.id,
      student_name: borrowItem.student_name,
      book_title: borrowItem.book_title,
      due_date: borrowItem.due_date
    })
    setIsRenewModalOpen(true)
  }

  const handleRenewSubmit = async (renewData) => {
    try {
      await renewBook(token, renewData.id, { due_date: renewData.due_date })
      setIsRenewModalOpen(false)
      await fetchBorrowedData(pagination.currentPage)
      showToast('Success', 'Book renewed successfully!', 'success')
    } catch (error) {
      console.error('Error renewing book:', error)
      showToast('Error', error.message || 'Failed to renew book', 'error')
      throw error
    }
  }

  const handleOverdueClick = (borrowItem) => {
    setSelectedOverdue({
      id: borrowItem.id,
      student_name: borrowItem.student_name,
      book_title: borrowItem.book_title,
      due_date: borrowItem.due_date
    })
    setIsOverdueModalOpen(true)
  }

  const handleOverdueSubmit = async (paymentData) => {
    try {
      await processOverduePayment(token, paymentData.id, paymentData)

      // Refresh the data from server
      await fetchBorrowedData(pagination.currentPage)
      showToast('Success', 'Action completed successfully!', 'success')
    } catch (error) {
      console.error('Error processing payment:', error)
      showToast('Error', error.message || 'Failed to process action', 'error')
      throw error
    }
  }

  const refreshTable = () => fetchBorrowedData(pagination.currentPage)

  // Add filteredBooks computed value
  const getFilteredBooks = () => {
    let filtered = borrowedBooks

    // Hide records without a valid student
    filtered = filtered.filter((book) => {
      const studentId =
        book.student_id ?? book.student ?? book.studentId ?? book.studentID ?? book.id_number
      const studentName = (book.student_name || '').trim().toLowerCase()

      return (
        (studentId != null && String(studentId).trim()) ||
        (studentName && !studentName.includes('undefined') && !studentName.includes('null'))
      )
    })

    // Apply status filter
    if (filterStatus === 'borrowed') {
      filtered = filtered.filter((book) => !book.is_returned && !isOverdue(book.due_date))
    } else if (filterStatus === 'returned') {
      filtered = filtered.filter((book) => book.is_returned)
    } else if (filterStatus === 'overdue') {
      filtered = filtered.filter((book) => !book.is_returned && isOverdue(book.due_date))
    }

    // Apply search filter
    if (!searchTerm) return filtered

    const searchLower = searchTerm.toLowerCase()
    return filtered.filter((book) => {
      const studentName = book.student_name || ''
      const bookTitle = book.book_title || ''

      return (
        studentName.toLowerCase().includes(searchLower) ||
        bookTitle.toLowerCase().includes(searchLower) ||
        formatDate(book.borrowed_date).toLowerCase().includes(searchLower) ||
        formatDate(book.due_date).toLowerCase().includes(searchLower)
      )
    })
  }

  // Update the search handler
  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
    // Reset to first page when searching
    if (pagination.currentPage !== 1) {
      handlePageChange(1)
    }
  }

  // Update the table row rendering to hide overdue button when paid or renewed
  const renderActionButtons = (item) => (
    <div className="action-buttons-container">
      <button
        className="action-btn return"
        disabled={item.is_returned}
        onClick={() => handleReturnBook(item.id)}
        title={item.is_returned ? 'Already Returned' : 'Return Book'}
      >
        <RotateCcw size={20} />
      </button>
      <button
        className="action-btn renew"
        disabled={item.is_returned || item.renewed_count >= 3}
        onClick={() => handleRenewClick(item)}
        title={item.renewed_count >= 3 ? 'Renewal Limit Reached' : 'Renew Book'}
      >
        <RefreshCw size={20} />
      </button>
      {isOverdue(item.due_date) && !item.is_returned && !item.paid && (
        <button
          className="action-btn overdue"
          onClick={() => handleOverdueClick(item)}
          title="Pay Overdue Fine"
        >
          <AlertCircle size={20} />
        </button>
      )}
    </div>
  )

  const totalPages = Math.ceil(pagination.count / 10)

  useEffect(() => {
    if (highlightedId && shouldHighlight) {
      const element = document.getElementById(`borrowed-item-${highlightedId}`)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
        element.classList.add('highlighted')
        // Remove highlight after animation
        setTimeout(() => {
          element.classList.remove('highlighted')
        }, 3000)
      }
    }
  }, [highlightedId, shouldHighlight])

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleRowClick = (item) => {
    if (windowWidth <= 1500) {
      setSelectedBorrowDetails(item)
    }
    // Do nothing if screen is larger than 1500px
  }

  return (
    <div className="app-wrapper">
      <Sidebar isCollapsed={isCollapsed} onToggle={handleSidebarToggle} />
      <div className={`borrowed-container ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="borrowed-content">
          <div className="borrowed-header">
            <div className="search-bar">
              <Search className="search-icon" size={18} />
              <input
                type="text"
                placeholder="Search students, books, dates..."
                value={searchTerm}
                onChange={handleSearch}
                className="search-input"
                aria-label="Search borrowed books"
              />
              {searchTerm && (
                <X
                  size={16}
                  className="search-clear"
                  onClick={() => setSearchTerm('')}
                  style={{
                    position: 'absolute',
                    right: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    cursor: 'pointer',
                    color: '#94a3b8'
                  }}
                />
              )}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Filter
                  size={16}
                  style={{
                    position: 'absolute',
                    left: '0.75rem',
                    color: '#64748b',
                    pointerEvents: 'none',
                    zIndex: 1
                  }}
                />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="filter-select"
                  style={{
                    padding: '0.5rem 2.5rem 0.5rem 2.25rem',
                    borderRadius: '0.5rem',
                    border: '1px solid #e2e8f0',
                    backgroundColor: 'white',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#334155',
                    outline: 'none',
                    transition: 'all 0.2s',
                    appearance: 'none',
                    backgroundImage:
                      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2364748b' d='M6 9L1 4h10z'/%3E%3C/svg%3E\")",
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 0.75rem center'
                  }}
                  onMouseEnter={(e) => (e.target.style.borderColor = '#cbd5e1')}
                  onMouseLeave={(e) => (e.target.style.borderColor = '#e2e8f0')}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#3b82f6'
                    e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e2e8f0'
                    e.target.style.boxShadow = 'none'
                  }}
                >
                  <option value="all">All Status</option>
                  <option value="borrowed">Borrowed</option>
                  <option value="overdue">Overdue</option>
                  <option value="returned">Returned</option>
                </select>
              </div>
              <Button
                variant="secondary"
                onClick={() => fetchBorrowedData(pagination.currentPage)}
                className="gap-2"
                title="Refresh"
                aria-label="Refresh data"
              >
                <RefreshCw size={18} />
              </Button>
              <Button
                variant="primary"
                onClick={handleBorrowBook}
                className="gap-2"
                title="Borrow Book"
                aria-label="Borrow book"
              >
                <Plus size={18} />
              </Button>
            </div>
          </div>
          <div className="table-container">
            <div className="borrowed-table-wrapper">
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
                        className={`${
                          highlightedId === item.id.toString()
                            ? 'highlighted'
                            : getRowClassName(item)
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
                        <td>{renderActionButtons(item)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="pagination">
              <button
                className="pagination-btn"
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={!pagination.previous}
              >
                <ChevronLeft size={18} />
              </button>
              <span className="pagination-info">
                Page {pagination.currentPage} of {totalPages}
              </span>
              <button
                className="pagination-btn"
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={!pagination.next}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
        <BorrowBookModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSubmit={handleSubmitBorrow}
        />
        <RenewModal
          isOpen={isRenewModalOpen}
          onClose={() => setIsRenewModalOpen(false)}
          onSubmit={handleRenewSubmit}
          borrowData={selectedBorrow || {}}
        />
        <OverdueModal
          isOpen={isOverdueModalOpen}
          onClose={() => setIsOverdueModalOpen(false)}
          onSubmit={handleOverdueSubmit}
          onSuccess={refreshTable} // Add this line
          borrowData={selectedOverdue || {}}
        />
        {selectedBorrowDetails && windowWidth <= 1500 && (
          <BorrowDetailsModal
            isOpen={!!selectedBorrowDetails}
            onClose={() => setSelectedBorrowDetails(null)}
            borrowData={selectedBorrowDetails}
            onReturn={handleReturnBook}
            onRenew={handleRenewClick}
            onPay={handleOverdueClick}
          />
        )}
      </div>
    </div>
  )
}

export default Borrowed
