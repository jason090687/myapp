import { useState } from 'react'
import { FaSearch, FaEdit, FaTrash } from 'react-icons/fa'
import { Plus, Filter } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import { Button } from '../components/ui/button'
import './StudentsPage.css' // Reuse students page styles
import AddStaffBookModal from '../components/AddStaffBookModal'
import EditStaffModal from '../components/EditStaffModal'
import { useStaff } from '../hooks'

const StaffPage = () => {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  // Destructure all needed values from useStaff hook
  const {
    staff,
    isLoading,
    refetch,
    filterStatus,
    setFilterStatus,
    selectedStaff,
    setSelectedStaff,
    deleteConfirm,
    handleRowClick,
    handleAddStaff,
    handleEditStaff,
    handleDeleteStaff,
    confirmDeleteStaff,
    cancelDelete
  } = useStaff()

  const handleAddStaffClick = async (staffData) => {
    try {
      await handleAddStaff(staffData)
      setIsAddModalOpen(false)
    } catch (error) {
      console.error('Error adding staff:', error)
    }
  }

  const handleEditStaffClick = async (staffData) => {
    try {
      await handleEditStaff(staffData)
      setIsEditModalOpen(false)
      setSelectedStaff(null)
    } catch (error) {
      console.error('Error editing staff:', error)
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
                className="search-input"
                aria-label="Search staff"
                disabled
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
                title="Add Staff"
                aria-label="Add staff"
              >
                <Plus size={18} />
              </Button>
            </div>
          </div>

          <div className="table-container">
            <table className="students-table">
              <thead>
                <tr>
                  <th>Employee ID</th>
                  <th>Employee RFID</th>
                  <th>Name</th>
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
                      <span className="student-loading-text">Loading staff...</span>
                    </td>
                  </tr>
                ) : staff.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="loading-cell">
                      <span className="student-loading-text">No staff found</span>
                    </td>
                  </tr>
                ) : (
                  staff.map((employee) => {
                    const employeePk = employee?.id ?? employee?.employee_id ?? employee?.pk
                    return (
                      <tr key={employeePk ?? employee.id_number} className="table-row">
                        <td onClick={() => handleRowClick(employee)}>{employee.id_number}</td>
                        <td onClick={() => handleRowClick(employee)}>{employee.rfid_number}</td>
                        <td onClick={() => handleRowClick(employee)}>{employee.name}</td>
                        <td onClick={() => handleRowClick(employee)}>
                          {employee.borrowed_books_count}
                        </td>
                        <td onClick={() => handleRowClick(employee)}>
                          <span className={`status ${employee.active ? 'active' : 'inactive'}`}>
                            {employee.active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons-container">
                            <button
                              className="action-btn edit"
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedStaff(employee)
                                setIsEditModalOpen(true)
                              }}
                              title="Edit"
                              aria-label="Edit staff member"
                            >
                              <FaEdit />
                            </button>
                            <button
                              className="action-btn delete"
                              onClick={(e) => {
                                e.stopPropagation()
                                const employeePk =
                                  employee?.id ?? employee?.employee_id ?? employee?.pk
                                if (!employeePk) {
                                  return
                                }
                                confirmDeleteStaff(employeePk, employee.name)
                              }}
                              title="Delete"
                              aria-label="Delete staff member"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          <AddStaffBookModal
            isOpen={isAddModalOpen}
            onClose={() => setIsAddModalOpen(false)}
            onSubmit={handleAddStaffClick}
          />

          {selectedStaff && (
            <EditStaffModal
              isOpen={isEditModalOpen}
              onClose={() => {
                setIsEditModalOpen(false)
                setSelectedStaff(null)
              }}
              onSubmit={handleEditStaffClick}
              studentData={selectedStaff}
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
                    Are you sure you want to delete staff member{' '}
                    <strong>{deleteConfirm.staffName}</strong>?
                  </p>
                  <p className="delete-warning">This action cannot be undone.</p>
                </div>
                <div className="delete-modal-footer">
                  <button className="cancel-delete-btn" onClick={cancelDelete}>
                    Cancel
                  </button>
                  <button className="confirm-delete-btn" onClick={handleDeleteStaff}>
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

export default StaffPage
