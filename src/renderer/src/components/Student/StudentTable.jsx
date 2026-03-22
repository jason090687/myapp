import { FaEdit, FaTrash, FaChevronLeft, FaChevronRight } from 'react-icons/fa'

const StudentTable = ({
  students,
  isLoading,
  currentPage,
  totalPages,
  onRowClick,
  onEdit,
  onDelete,
  onPageChange,
  showToast
}) => {
  const handleEditClick = (e, student) => {
    e.stopPropagation()
    onEdit(student)
  }

  const handleDeleteClick = (e, student) => {
    e.stopPropagation()
    const studentPk = student?.id ?? student?.student_id ?? student?.pk
    if (!studentPk) {
      showToast('Error', 'Student record is missing an internal id', 'error')
      return
    }
    onDelete({
      isOpen: true,
      studentId: studentPk,
      studentName: student.name
    })
  }

  return (
    <>
      <div className="table-container">
        <table className="students-table">
          <thead>
            <tr>
              <th>ID Number</th>
              <th>RFID Number</th>
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
                <td colSpan="7" className="loading-cell">
                  <div className="student-spinner"></div>
                  <span className="student-loading-text">Loading students...</span>
                </td>
              </tr>
            ) : students.length === 0 ? (
              <tr>
                <td colSpan="7" className="loading-cell">
                  <span className="student-loading-text">No students</span>
                </td>
              </tr>
            ) : (
              students.map((student) => (
                <tr key={student.id_number} className="table-row">
                  <td onClick={() => onRowClick(student)}>{student.id_number}</td>
                  <td onClick={() => onRowClick(student)}>{student.rfid_number}</td>
                  <td onClick={() => onRowClick(student)}>{student.name}</td>
                  <td onClick={() => onRowClick(student)}>{student.year_level}</td>
                  <td onClick={() => onRowClick(student)}>{student.borrowed_books_count}</td>
                  <td onClick={() => onRowClick(student)}>
                    <span className={`status ${student.active ? 'active' : 'inactive'}`}>
                      {student.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons-container">
                      <button
                        className="action-btn edit"
                        onClick={(e) => handleEditClick(e, student)}
                        title="Edit"
                        aria-label="Edit student"
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="action-btn delete"
                        onClick={(e) => handleDeleteClick(e, student)}
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
          onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
          disabled={currentPage === 1}
        >
          <FaChevronLeft />
        </button>
        <span className="pagination-info">
          Page {currentPage} of {totalPages}
        </span>
        <button
          className="pagination-btn"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <FaChevronRight />
        </button>
      </div>
    </>
  )
}

export default StudentTable
