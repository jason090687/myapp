import { useEffect, useState } from 'react'
import { createStudent, searchStudents } from '../Features/api'
import { useSelector } from 'react-redux'
import { FaSearch, FaChevronLeft, FaChevronRight, FaPlus } from 'react-icons/fa'
import { Bounce, toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Sidebar from '../components/Sidebar'
import AddStudentModal from '../components/AddStudentModal'
import './StudentsPage.css'
import { useNavigate } from 'react-router-dom'

const StudentsPage = () => {
  const navigate = useNavigate()
  const [students, setStudents] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const { token } = useSelector((state) => state.auth)

  // Effect for fetching students with search
  useEffect(() => {
    const loadStudents = async () => {
      try {
        setIsLoading(true)
        const data = await searchStudents(token, searchTerm, currentPage)
        setStudents(data.results)
        setTotalPages(Math.ceil(data.count / 10))
      } catch (error) {
        console.error('Error loading students:', error)
        toast.error('Failed to load students')
      } finally {
        setIsLoading(false)
      }
    }

    const timer = setTimeout(loadStudents, 300) // Debounce search
    return () => clearTimeout(timer)
  }, [token, currentPage, searchTerm])

  const handleRowClick = (studentId) => {
    navigate(`/students/${studentId}`)
  }

  const handleAddStudent = async (studentData) => {
    try {
      await createStudent(token, studentData)
      toast.success('Student added successfully!', {
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
      toast.error(error.message || 'Failed to add student', {
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
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
                aria-label="Search students"
              />
            </div>
            <button className="add-student-btn" onClick={() => setIsAddModalOpen(true)}>
              <FaPlus /> Add Student
            </button>
          </div>

          <div className="table-container">
            <table className="students-table">
              <thead>
                <tr>
                  <th>ID Number</th>
                  <th>Name</th>
                  <th>Year Level</th>
                  <th>Borrowed Books</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan="5" className="loading-cell">
                      <div className="student-spinner"></div>
                      <span className="student-loading-text">Loading students...</span>
                    </td>
                  </tr>
                ) : (
                  students.map((student) => (
                    <tr
                      key={student.id_number}
                      onClick={() => handleRowClick(student.id_number)}
                      className="clickable-row"
                    >
                      <td>{student.id_number}</td>
                      <td>{student.name}</td>
                      <td>{student.year_level}</td>
                      <td>{student.borrowed_books_count}</td>
                      <td>
                        <span className={`status ${student.active ? 'active' : 'inactive'}`}>
                          {student.active ? 'Active' : 'Inactive'}
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

          <AddStudentModal
            isOpen={isAddModalOpen}
            onClose={() => setIsAddModalOpen(false)}
            onSubmit={handleAddStudent}
          />
        </div>
      </main>
      <ToastContainer />
    </div>
  )
}

export default StudentsPage
