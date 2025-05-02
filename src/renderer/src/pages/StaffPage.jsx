import { useEffect, useState } from 'react'
import { createStudent, fetchEmployees } from '../Features/api'
import { useSelector } from 'react-redux'
import { FaSearch, FaChevronLeft, FaChevronRight, FaPlus } from 'react-icons/fa'
import { toast, ToastContainer, Bounce } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Sidebar from '../components/Sidebar'
import './StudentsPage.css' // Reuse students page styles
import AddStaffBookModal from '../components/AddStaffBookModal'
import { useNavigate } from 'react-router-dom'

const StaffPage = () => {
  const [employees, setEmployees] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const { token } = useSelector((state) => state.auth)

  const navigate = useNavigate()

  useEffect(() => {
    const loadEmployees = async () => {
      try {
        setIsLoading(true)
        const data = await fetchEmployees(token, currentPage, searchTerm)
        // Check if data.results exists, otherwise use data directly
        setEmployees(data.results || data)
        setTotalPages(Math.ceil((data.count || data.length) / 10))
      } catch (error) {
        console.error('Error loading employees:', error)
        toast.error('Failed to load employees')
        setEmployees([])
        setTotalPages(0)
      } finally {
        setIsLoading(false)
      }
    }

    const timer = setTimeout(loadEmployees, 300) // Debounce search
    return () => clearTimeout(timer)
  }, [token, currentPage, searchTerm])

  const handleRowClick = (studentId) => {
    navigate(`/staff/${studentId}`)
  }

  const handleAddStaff = async (staffData) => {
    try {
      await createStudent(token, staffData)
      toast.success('Staff member added successfully!', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'light',
        transition: Bounce
      })
      setIsAddModalOpen(false)
    } catch (error) {
      toast.error(error.message || 'Failed to add staff member', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'light',
        transition: Bounce
      })
      throw error
    }
  }

  return (
    <div className="wrapper">
      <Sidebar isCollapsed={isCollapsed} onToggle={() => setIsCollapsed(!isCollapsed)} />
      <main className="main">
        <div className="students-container">
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
            <button className="add-student-btn" onClick={() => setIsAddModalOpen(true)}>
              <FaPlus /> Add Staff
            </button>
          </div>

          <div className="table-container">
            <table className="students-table">
              <thead>
                <tr>
                  <th>Employee ID</th>
                  <th>Name</th>
                  <th>Borrowed Books</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan="3" className="loading-cell">
                      <div className="student-spinner"></div>
                      <span className="student-loading-text">Loading staff...</span>
                    </td>
                  </tr>
                ) : (
                  employees.map((employee) => (
                    <tr
                      key={employee.id_number}
                      className="clickable-row"
                      onClick={() => handleRowClick(employee.id_number)}
                    >
                      <td>{employee.id_number}</td>
                      <td>{employee.name}</td>
                      <td>{employee.borrowed_books_count}</td>
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
              Page {currentPage} of {totalPages || 1}
            </span>
            <button
              className="pagination-btn"
              onClick={() => setCurrentPage((prev) => prev + 1)}
              disabled={currentPage === totalPages}
            >
              <FaChevronRight />
            </button>
          </div>

          <AddStaffBookModal
            isOpen={isAddModalOpen}
            onClose={() => setIsAddModalOpen(false)}
            onSubmit={handleAddStaff}
          />
        </div>
      </main>
      <ToastContainer />
    </div>
  )
}

export default StaffPage
