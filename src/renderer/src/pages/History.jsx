import { useState, useEffect } from 'react'
import { FaSearch, FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import Sidebar from '../components/Sidebar'
import { useSelector } from 'react-redux'
import './History.css'

function History() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [historyData, setHistoryData] = useState([])
  const { token } = useSelector((state) => state.auth)
  const [pagination, setPagination] = useState({
    count: 0,
    next: null,
    previous: null,
    currentPage: 1
  })

  const fetchHistoryData = async (page = 1) => {
    setIsLoading(true)
    try {
      // TODO: Implement history API fetch
      // const response = await fetchHistory(token, page, searchTerm)
      // setHistoryData(response.results)
      // setPagination({ ...response, currentPage: page })
    } catch (error) {
      console.error('Error fetching history:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchHistoryData()
  }, [token])

  const handleSidebarToggle = () => setIsCollapsed(!isCollapsed)
  const handlePageChange = (newPage) => fetchHistoryData(newPage)
  const totalPages = Math.ceil(pagination.count / 10)

  return (
    <div className="app-wrapper">
      <Sidebar isCollapsed={isCollapsed} onToggle={handleSidebarToggle} />
      <div className={`history-container ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="history-content">
          <div className="history-header">
            <div className="search-bar">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search history..."
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          </div>

          <div className="table-container">
            <div className="history-table-wrapper">
              <table className="history-table">
                <thead>
                  <tr>
                    <th>Action</th>
                    <th>Book Title</th>
                    <th>Student</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan="6" className="loading-cell">
                        <div className="history-spinner"></div>
                        <span className="history-loading-text">Loading history...</span>
                      </td>
                    </tr>
                  ) : historyData.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="empty-cell">
                        No history found
                      </td>
                    </tr>
                  ) : (
                    historyData.map((item) => (
                      <tr key={item.id}>
                        <td>{item.action}</td>
                        <td>{item.bookTitle}</td>
                        <td>{item.student}</td>
                        <td>{new Date(item.date).toLocaleDateString()}</td>
                        <td>
                          <span className={`status-badge ${item.status.toLowerCase()}`}>
                            {item.status}
                          </span>
                        </td>
                        <td>{item.details}</td>
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
      </div>
    </div>
  )
}

export default History
