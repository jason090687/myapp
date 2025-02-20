import { useEffect, useState } from 'react'
import { FaSearch, FaChevronLeft, FaChevronRight, FaPlus } from 'react-icons/fa'
import Sidebar from '../components/Sidebar'
import { useSelector } from 'react-redux'
import { fetchBorrowedBooks, returnBook, updateBook } from '../Features/api'
import './Borrowed.css'
import BorrowBookModal from '../components/BorrowBookModal'
import { Bounce, toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

function Borrowed() {
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

  const notifySuccess = (message) =>
    toast.success(message, {
      position: 'top-right',
      autoClose: 3000, // Reduce to 3 seconds
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: false, // Disable pause on hover
      draggable: false, // Disable dragging
      progress: undefined,
      theme: 'light',
      transition: Bounce
    })

  const notifyError = (message) =>
    toast.error(message, {
      position: 'top-right',
      autoClose: 3000, // Reduce to 3 seconds
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: false, // Disable pause on hover
      draggable: false, // Disable dragging
      progress: undefined,
      theme: 'light',
      transition: Bounce
    })

  // Debounce effect for search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 500)
    return () => clearTimeout(timer)
  }, [searchTerm])

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
        setBorrowedBooks(response.results || [])
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

  const handleSubmitBorrow = async () => {
    try {
      setIsModalOpen(false)
      await fetchBorrowedData(pagination.currentPage)
      // Move alert to modal only
      // alert('Book borrowed successfully!') - Remove this line
    } catch (error) {
      console.error('Error in parent handleSubmitBorrow:', error)
      notifyError(error.message || 'Failed to borrow book')
    }
  }

  const handleReturnBook = async (borrowId, bookId) => {
    try {
      const returnData = {
        returned_date: new Date().toISOString().split('T')[0]
      }

      // Call the API to return the book
      await returnBook(token, borrowId, returnData)

      // Update the book status to available
      await updateBook(token, bookId, { status: 'available' })

      // Update the UI with the response data
      setBorrowedBooks((prevBooks) =>
        prevBooks.map((book) => {
          if (book.id === borrowId) {
            return {
              ...book,
              is_returned: true,
              returned_date: returnData.returned_date,
              status: 'Returned'
            }
          }
          return book
        })
      )

      notifySuccess('Book returned successfully!')
    } catch (error) {
      console.error('Error returning book:', error)
      notifyError(error.message || 'Failed to return book')
    }
  }

  const totalPages = Math.ceil(pagination.count / 10)

  return (
    <>
      <div className="app-wrapper">
        <Sidebar isCollapsed={isCollapsed} onToggle={handleSidebarToggle} />
        <div className={`borrowed-container ${isCollapsed ? 'collapsed' : ''}`}>
          <div className="borrowed-content">
            <div className="borrowed-header">
              <div className="search-bar">
                <FaSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Search by student or book..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
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
                    ) : borrowedBooks.length === 0 ? (
                      <tr>
                        <td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>
                          No borrowed books found
                        </td>
                      </tr>
                    ) : (
                      borrowedBooks.map((item) => (
                        <tr key={item.id} className={item.is_returned ? 'returned-row' : ''}>
                          <td>{item.student_name}</td>
                          <td>{item.book_title}</td>
                          <td>{formatDate(item.borrowed_date)}</td>
                          <td>{formatDate(item.due_date)}</td>
                          <td>
                            <span
                              className={`status-badge ${item.is_returned ? 'returned' : 'borrowed'}`}
                            >
                              {item.is_returned ? 'Returned' : 'Borrowed'}
                            </span>
                          </td>
                          <td>
                            <div className="action-buttons-container">
                              <button
                                className={`action-btn return ${item.is_returned ? 'returned-btn' : ''}`}
                                disabled={item.is_returned}
                                onClick={() => handleReturnBook(item.id, item.book)}
                              >
                                {item.is_returned ? 'Returned' : 'Return'}
                              </button>
                              <button
                                className="action-btn renew"
                                disabled={item.is_returned || item.renewed_count >= 3}
                              >
                                Renew
                              </button>
                            </div>
                          </td>
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
        </div>
      </div>
      <ToastContainer />
    </>
  )
}

export default Borrowed
