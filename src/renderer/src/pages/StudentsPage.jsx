import { useEffect, useState } from 'react'
import { createStudent, searchStudents, updateStudentDetails, deleteStudent } from '../Features/api'
import { useSelector } from 'react-redux'
import { FaSearch, FaChevronLeft, FaChevronRight, FaEdit, FaTrash } from 'react-icons/fa'
import { Filter, Plus } from 'lucide-react'
import { useToaster } from '../components/Toast/useToaster'
import Sidebar from '../components/Sidebar'
import AddStudentModal from '../components/AddStudentModal'
import EditStudentModal from '../components/EditStudentModal'
import './StudentsPage.css'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button'

const StudentsPage = () => {
  const navigate = useNavigate()
  const [students, setStudents] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState({
    isOpen: false,
    studentId: null,
    studentName: ''
  })
  const [filterStatus, setFilterStatus] = useState('all')
  const { token } = useSelector((state) => state.auth)
  const { showToast } = useToaster()

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

  // Filter students based on selected status
  const getFilteredStudents = () => {
    if (filterStatus === 'all') return students
    if (filterStatus === 'active') return students.filter((s) => s.active)
    if (filterStatus === 'inactive') return students.filter((s) => !s.active)
    return students
  }

  const handleRowClick = (student) => {
    const studentPk = student?.id ?? student?.student_id ?? student?.pk
    if (!studentPk) {
      showToast('Error', 'Student record is missing an internal id', 'error')
      return
    }
    navigate(`/students/${studentPk}`)
  }

  const handleAddStudent = async (studentData) => {
    try {
      await createStudent(token, studentData)
      showToast('Success', 'Student added successfully!', 'success')
      setIsAddModalOpen(false)
      // Refresh students list so the new student appears immediately
      const data = await searchStudents(token, searchTerm, currentPage)
      setStudents(data.results)
      setTotalPages(Math.ceil(data.count / 10))
    } catch (error) {
      showToast('Error', error.message || 'Failed to add student', 'error')
      throw error
    }
  }

  const handleEditStudent = async (studentData) => {
    try {
      if (!selectedStudent) return
      const studentPk = selectedStudent?.id ?? selectedStudent?.student_id ?? selectedStudent?.pk
      if (!studentPk) {
        showToast('Error', 'Student record is missing an internal id', 'error')
        return
      }
      await updateStudentDetails(token, studentPk, studentData)
      showToast('Success', 'Student updated successfully!', 'success')
      setIsEditModalOpen(false)
      setSelectedStudent(null)
      // Refresh students list
      const data = await searchStudents(token, searchTerm, currentPage)
      setStudents(data.results)
    } catch (error) {
      showToast('Error', error.message || 'Failed to update student', 'error')
      throw error
    }
  }

  const handleDeleteStudent = async () => {
    try {
      // API call for delete - implement based on your backend
      await deleteStudent(token, deleteConfirm.studentId)
      showToast('Success', 'Student deleted successfully!', 'success')
      setDeleteConfirm({ isOpen: false, studentId: null, studentName: '' })
      // Refresh students list
      const data = await searchStudents(token, searchTerm, currentPage)
      setStudents(data.results)
    } catch (error) {
      showToast('Error', error.message || 'Failed to delete student', 'error')
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
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <Button
                variant="primary"
                onClick={() => setIsAddModalOpen(true)}
                className="gap-2"
                title="Add Student"
                aria-label="Add student"
              >
                <Plus size={18} />
              </Button>
            </div>
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
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan="6" className="loading-cell">
                      <div className="student-spinner"></div>
                      <span className="student-loading-text">Loading students...</span>
                    </td>
                  </tr>
                ) : getFilteredStudents().length === 0 ? (
                  <tr>
                    <td colSpan="6" className="loading-cell">
                      <span className="student-loading-text">No students</span>
                    </td>
                  </tr>
                ) : (
                  getFilteredStudents().map((student) => (
                    <tr key={student.id_number} className="table-row">
                      <td onClick={() => handleRowClick(student)}>{student.id_number}</td>
                      <td onClick={() => handleRowClick(student)}>{student.name}</td>
                      <td onClick={() => handleRowClick(student)}>{student.year_level}</td>
                      <td onClick={() => handleRowClick(student)}>
                        {student.borrowed_books_count}
                      </td>
                      <td onClick={() => handleRowClick(student)}>
                        <span className={`status ${student.active ? 'active' : 'inactive'}`}>
                          {student.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons-container">
                          <button
                            className="action-btn edit"
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedStudent(student)
                              setIsEditModalOpen(true)
                            }}
                            title="Edit"
                            aria-label="Edit student"
                          >
                            <FaEdit />
                          </button>
                          <button
                            className="action-btn delete"
                            onClick={(e) => {
                              e.stopPropagation()
                              const studentPk = student?.id ?? student?.student_id ?? student?.pk
                              if (!studentPk) {
                                showToast(
                                  'Error',
                                  'Student record is missing an internal id',
                                  'error'
                                )
                                return
                              }
                              setDeleteConfirm({
                                isOpen: true,
                                studentId: studentPk,
                                studentName: student.name
                              })
                            }}
                            title="Delete"
                            aria-label="Delete student"
                          >
                            <FaTrash />
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

          {selectedStudent && (
            <EditStudentModal
              isOpen={isEditModalOpen}
              onClose={() => {
                setIsEditModalOpen(false)
                setSelectedStudent(null)
              }}
              onSubmit={handleEditStudent}
              student={selectedStudent}
            />
          )}

          {deleteConfirm.isOpen && (
            <div className="delete-modal-overlay">
              <div className="delete-modal-content">
                <div className="delete-modal-header">
                  <h3>Confirm Delete</h3>
                </div>
                <div className="delete-modal-body">
                  <p>
                    Are you sure you want to delete student{' '}
                    <strong>{deleteConfirm.studentName}</strong>?
                  </p>
                  <p className="delete-warning">This action cannot be undone.</p>
                </div>
                <div className="delete-modal-footer">
                  <button
                    className="cancel-delete-btn"
                    onClick={() =>
                      setDeleteConfirm({ isOpen: false, studentId: null, studentName: '' })
                    }
                  >
                    Cancel
                  </button>
                  <button className="confirm-delete-btn" onClick={handleDeleteStudent}>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      {/* Custom toasts handled via useToaster */}
    </div>
  )
}

export default StudentsPage
