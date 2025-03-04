import { useEffect, useState } from 'react'
import { FaSearch, FaChevronLeft, FaChevronRight, FaPlus } from 'react-icons/fa'
import Sidebar from '../components/Sidebar'
import { useSelector } from 'react-redux'
import {
  fetchBorrowedBooks,
  returnBook,
  renewBook,
  processOverduePayment // Add this import
} from '../Features/api'
import './Borrowed.css'
import BorrowBookModal from '../components/BorrowBookModal'
import RenewModal from '../components/RenewModal'
import OverdueModal from '../components/OverdueModal'
import { Bounce, toast } from 'react-toastify'
import { useSearchParams } from 'react-router-dom'

const Borrowed = () => {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [isLoading, setLoading] = useState(false)
  const [borrowedBooks, setBorrowedBooks] = useState([])
  const { token } = useSelector((state) => state.auth) // Ensure token exists
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
    if (item.is_returned) return 'Return'
    if (item.paid && isOverdue(item.due_date)) return 'Paid'
    return isOverdue(item.due_date) ? 'DUE' : 'BORROWED' // Changed to uppercase for emphasis
  }

  // Debounce effect for search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 500)
    return () => clearTimeout(timer)
  }, [searchTerm])

  // Add sorting function
  const sortBorrowedBooks = (books) => {
    return [...books].sort((a, b) => {
      // First prioritize non-returned books
      if (a.is_returned !== b.is_returned) {
        return a.is_returned ? 1 : -1
      }

      // Then sort by borrow date (newest first)
      return new Date(b.borrowed_date) - new Date(a.borrowed_date)
    })
  }

  // Fetch borrowed books data
  const fetchBorrowedData = async (page = 1) => {
    if (!token) {
      console.error('Token missing: Skipping API call')
      return
    }

    setLoading(true)
    try {
      const response = await fetchBorrowedBooks(token, page)
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

  // Update list when search term changes
  useEffect(() => {
    fetchBorrowedData()
  }, [debouncedSearchTerm])

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
      // await borrowBook(token, borrowData)
      setIsModalOpen(false)
      await fetchBorrowedData(pagination.currentPage) // Refresh the borrowed books list
    } catch (error) {
      console.error('Error borrowing book:', error)
    }
  }

  const handleReturnBook = async (borrowId) => {
    try {
      await returnBook(token, borrowId, {
        returned_date: new Date().toISOString().split('T')[0]
      })
      await fetchBorrowedData(pagination.currentPage)
      toast.success('Book returned successfully!', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: false,
        theme: 'light',
        transition: Bounce
      })
    } catch (error) {
      console.error('Error returning book:', error)
      toast.error(error.message || 'Failed to return book', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: false,
        theme: 'light',
        transition: Bounce
      })
    }
  }

  const handleRenewClick = (borrowItem) => {
    setSelectedBorrow({
      id: borrowItem.id,
      student_name: borrowItem.student,
      book_title: borrowItem.book_title,
      due_date: borrowItem.due_date
    })
    setIsRenewModalOpen(true)
  }

  const handleRenewSubmit = async (renewData) => {
    try {
      await renewBook(token, renewData.id, { due_date: renewData.due_date })
      await fetchBorrowedData(pagination.currentPage)
    } catch (error) {
      throw error
    }
  }

  const handleOverdueClick = (borrowItem) => {
    setSelectedOverdue({
      id: borrowItem.id,
      student_name: borrowItem.student,
      book_title: borrowItem.book_title,
      due_date: borrowItem.due_date
    })
    setIsOverdueModalOpen(true)
  }

  const handleOverdueSubmit = async (paymentData) => {
    try {
      await processOverduePayment(token, paymentData.id, paymentData)

      // Update local state immediately
      setBorrowedBooks((prevBooks) =>
        prevBooks.map((book) => {
          if (book.id === paymentData.id) {
            return {
              ...book,
              paid: true,
              paid_at: paymentData.paid_at,
              is_returned: paymentData.is_returned || book.is_returned,
              returned_date: paymentData.is_returned
                ? paymentData.returned_date
                : book.returned_date
            }
          }
          return book
        })
      )

      // Refresh the data from server
      await fetchBorrowedData(pagination.currentPage)

      toast.success('Action completed successfully!')
    } catch (error) {
      toast.error(error.message || 'Failed to process action')
      throw error
    }
  }

  // Ensure refreshTable is not wrapped in useCallback to avoid stale closure
  const refreshTable = async () => {
    try {
      await fetchBorrowedData(pagination.currentPage)
    } catch (error) {
      console.error('Failed to refresh table:', error)
    }
  }

  // Add filteredBooks computed value
  const getFilteredBooks = () => {
    if (!searchTerm) return borrowedBooks

    return borrowedBooks.filter(
      (book) =>
        book.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.book_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        formatDate(book.borrowed_date).toLowerCase().includes(searchTerm.toLowerCase()) ||
        formatDate(book.due_date).toLowerCase().includes(searchTerm.toLowerCase())
    )
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
      >
        {item.is_returned ? 'Returned' : 'Return'}
      </button>
      <button
        className="action-btn renew"
        disabled={item.is_returned || item.renewed_count >= 3}
        onClick={() => handleRenewClick(item)}
      >
        Renew
      </button>
      {isOverdue(item.due_date) && !item.is_returned && !item.paid && (
        <button className="action-btn overdue" onClick={() => handleOverdueClick(item)}>
          Pay
        </button>
      )}
    </div>
  )

  const totalPages = Math.ceil(pagination.count / 10)

  // Add this effect to scroll to the highlighted item
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
                        className={
                          highlightedId === item.id.toString()
                            ? 'highlighted'
                            : getRowClassName(item)
                        }
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
      </div>
    </div>
  )
}

export default Borrowed
