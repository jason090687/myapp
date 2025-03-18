import { useEffect, useState } from 'react'
import { fetchEmployees } from '../Features/api'
import { useSelector } from 'react-redux'
import { FaSearch, FaChevronLeft, FaChevronRight, FaPlus, FaTools } from 'react-icons/fa'
import { Bounce, toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Sidebar from '../components/Sidebar'
import './StudentsPage.css' // Reuse students page styles

const StaffPage = () => {
  const [employees, setEmployees] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [isCollapsed, setIsCollapsed] = useState(false)
  const { token } = useSelector((state) => state.auth)

  useEffect(() => {
    const loadEmployees = async () => {
      try {
        setIsLoading(true)
        const data = await fetchEmployees(token, currentPage, searchTerm)
        setEmployees(data.results)
        setTotalPages(Math.ceil(data.count / 10))
      } catch (error) {
        console.error('Error loading employees:', error)
        toast.error('Failed to load employees')
      } finally {
        setIsLoading(false)
      }
    }

    const timer = setTimeout(loadEmployees, 300) // Debounce search
    return () => clearTimeout(timer)
  }, [token, currentPage, searchTerm])

  return (
    <div className="wrapper">
      <Sidebar isCollapsed={isCollapsed} onToggle={() => setIsCollapsed(!isCollapsed)} />
      <main className="main">
        <div className="students-container" style={{ position: 'relative' }}>
          {/* Add overlay */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backdropFilter: 'blur(5px)',
              zIndex: 100,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '2rem'
            }}
          >
            <FaTools size={80} style={{ color: '#0a0b64', marginBottom: '2rem' }} />
            <h2
              style={{
                fontSize: '2rem',
                color: '#1e293b',
                marginBottom: '1rem',
                textAlign: 'center',
                fontWeight: '600'
              }}
            >
              Staff Management
            </h2>
            <p
              style={{
                fontSize: '1.1rem',
                color: '#64748b',
                textAlign: 'center',
                maxWidth: '500px',
                lineHeight: '1.6',
                marginBottom: '1rem'
              }}
            >
              This section is currently under development. Coming soon with enhanced staff
              management features.
            </p>
            <div
              style={{
                fontSize: '0.875rem',
                color: '#94a3b8',
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                backgroundColor: '#f1f5f9'
              }}
            >
              Check back later for updates
            </div>
          </div>

          {/* Existing content with blur */}
          <div style={{ filter: 'blur(4px)', pointerEvents: 'none' }}>
            <div className="students-header">
              <div className="search-bar">
                <FaSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Search staff..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                  aria-label="Search staff"
                />
              </div>
              <button className="add-student-btn">
                <FaPlus /> Add Staff
              </button>
            </div>

            <div className="table-container">
              <table className="students-table">
                <thead>
                  <tr>
                    <th>Employee ID</th>
                    <th>Name</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan="5" className="loading-cell">
                        <div className="student-spinner"></div>
                        <span className="student-loading-text">Loading staff...</span>
                      </td>
                    </tr>
                  ) : (
                    employees.map((employee) => (
                      <tr key={employee.id} className="clickable-row">
                        <td>{employee.id_number}</td>
                        <td>{employee.name}</td>

                        <td>
                          <span className={`status ${employee.active ? 'active' : 'inactive'}`}>
                            {employee.active ? 'Active' : 'Inactive'}
                          </span>
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
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                <FaChevronLeft />
              </button>
              <span className="pagination-info">
                Page {currentPage} of {totalPages}
              </span>
              <button
                className="pagination-btn"
                onClick={() => setCurrentPage((prev) => prev + 1)}
                disabled={currentPage === totalPages}
              >
                <FaChevronRight />
              </button>
            </div>
          </div>
        </div>
      </main>
      <ToastContainer />
    </div>
  )
}

export default StaffPage
