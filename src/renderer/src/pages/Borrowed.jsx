import { useEffect, useState } from 'react'
import { FaSearch, FaChevronLeft, FaChevronRight, FaPlus } from 'react-icons/fa'
import { RotateCcw, RefreshCw, DollarSign } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import { useSelector } from 'react-redux'
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
        returned_date: new Date().toISOString().split('T')[0],
        status: 'Returned'
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
      student: borrowItem.student,
      book: borrowItem.book_title,
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
      student: borrowItem.student,
      book: borrowItem.book_title,
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
    if (!searchTerm) return borrowedBooks

    const searchLower = searchTerm.toLowerCase()
    return borrowedBooks.filter((book) => {
      const studentName = studentMap[book.student] || book.student_name || book.student || ''
      const bookTitle = bookMap[book.book] || book.title || book.book || ''

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
          <DollarSign size={20} />
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
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search by student, book, or date..."
                value={searchTerm}
                onChange={handleSearch}
                className="search-input"
              />
            </div>
            <button className="borrow-book-btn" onClick={handleBorrowBook}>
              <FaPlus /> Borrow Book
            </button>
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
                              {getStatusText(item.status)}
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
                <FaChevronLeft />
              </button>
              <span className="pagination-info">
                Page {pagination.currentPage} of {totalPages}
              </span>
              <button
                className="pagination-btn"
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={!pagination.next}
              >
                <FaChevronRight />
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
