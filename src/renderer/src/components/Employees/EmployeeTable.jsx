import React from 'react'
import { FaChevronLeft, FaChevronRight, FaEdit, FaTrash } from 'react-icons/fa'

const EmployeeTable = ({
    staff,
    isLoading,
    handleRowClick,
    setSelectedStaff,
    setIsEditModalOpen,
    confirmDeleteStaff,
    currentPage,
    onPageChange,
    totalPages
}) => {
    return (
        <>
            <div className="students-table-container">
                <table className="students-table">
                    <thead>
                        <tr>
                            <th>Employee ID</th>
                            <th>Employee RFID</th>
                            <th>Employee Name</th>
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
                                        <td onClick={() => handleRowClick(employee)}>{employee.borrowed_books_count}</td>
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
                                                        const employeePk = employee?.id ?? employee?.employee_id ?? employee?.pk
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

                <div className='pagination-footer'>
                    <span className="pagination-info">
                        Page {currentPage} of {totalPages}
                    </span>
                    <div className="pagination">
                        <button
                            className="pagination-btn"
                            onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
                            disabled={currentPage === 1}
                        >
                            <FaChevronLeft />
                        </button>

                        {[...Array(totalPages)].map((_, n) => (
                            <button key={n} className={`pagination-btn${currentPage === n + 1 ? " active" : ""}`}>
                                {n + 1}
                            </button>
                        ))}

                        <button
                            className="pagination-btn"
                            onClick={() => onPageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                        >
                            <FaChevronRight />
                        </button>
                    </div>
                </div>
            </div>

        </>
    )
}

export default EmployeeTable
