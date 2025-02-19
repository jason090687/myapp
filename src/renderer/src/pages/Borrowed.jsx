import { useEffect, useState } from 'react'
import { FaSearch, FaChevronLeft, FaChevronRight, FaPlus } from 'react-icons/fa'
import Sidebar from '../components/Sidebar'
import { useSelector } from 'react-redux'
import { borrowBook, fetchBorrowedBooks, returnBook } from '../Features/api'
import './Borrowed.css'
import BorrowBookModal from '../components/BorrowBookModal'

function Borrowed() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [isLoading, setLoading] = useState(false)
  const [borrowedBooks, setBorrowedBooks] = useState([])
  // const [students, setStudents] = useState({})
  // const [books, setBooks] = useState({})
  const { token } = useSelector((state) => state.auth)
  const [pagination, setPagination] = useState({
    count: 0,
    next: null,
    previous: null,
    currentPage: 1
  })
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Add debounce effect for search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 500)
    return () => clearTimeout(timer)
  }, [searchTerm])

  // Update fetchBorrowedData to include search
  const fetchBorrowedData = async () => {
    setLoading(true)
    try {
      const response = await fetchBorrowedBooks(token, debouncedSearchTerm)
      if (response && response.results) {
        setBorrowedBooks(response.results)
      }
    } catch (error) {
      console.error('Error fetching borrowed books:', error)
    } finally {
      setLoading(false)
    }
  }

  // Add effect for search updates
  useEffect(() => {
    fetchBorrowedData()
  }, [debouncedSearchTerm, token])

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString()

  const handleSidebarToggle = () => setIsCollapsed(!isCollapsed)

  const handlePageChange = (newPage) => {
    fetchBorrowedData(newPage)
  }

  const handleBorrowBook = () => {
    setIsModalOpen(true) // Ensure this is being called when clicking the button
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
  }

  const handleSubmitBorrow = async (borrowData) => {
    try {
      await borrowBook(token, borrowData) // Make sure you're using the correct API call
      setIsModalOpen(false)
      await fetchBorrowedData() // Refresh the list
      alert('Book borrowed successfully!')
    } catch (error) {
      console.error('Error borrowing book:', error)
      alert(error.message || 'Failed to borrow book')
    }
  }

  const handleReturnBook = async (borrowId) => {
    try {
      const returnData = {
        borrow: borrowId,
        returned_date: new Date().toISOString().split('T')[0]
      }
      await returnBook(token, returnData)
      await fetchBorrowedData() // Refresh the list
      alert('Book returned successfully!')
    } catch (error) {
      console.error('Error returning book:', error)
      alert(error.message || 'Failed to return book')
    }
  }

  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
  }

  const totalPages = Math.ceil(pagination.count / 10)

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
                placeholder="Search by student or book..."
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
                  ) : borrowedBooks.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>
                        No borrowed books found
                      </td>
                    </tr>
                  ) : (
                    borrowedBooks.map((item) => (
                      <tr key={item.id}>
                        <td>{item.student}</td>
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
                              className="action-btn return"
                              disabled={item.is_returned}
                              onClick={() => handleReturnBook(item.id)}
                              title={
                                item.is_returned ? 'Book already returned' : 'Click to return book'
                              }
                            >
                              {item.is_returned ? 'Returned' : 'Return'}
                            </button>
                            <button
                              className="action-btn renew"
                              disabled={item.is_returned || item.renewed_count >= 3}
                              title={
                                item.is_returned
                                  ? 'Cannot renew returned book'
                                  : item.renewed_count >= 3
                                    ? 'Maximum renewals reached'
                                    : 'Click to renew book'
                              }
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
                <span className="pagination-total">(Total: {pagination.count})</span>
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
  )
}

export default Borrowed
