import React from 'react'
import { FaEdit, FaTrash } from 'react-icons/fa'

const EmployeeTable = ({
    staff,
    isLoading,
    handleRowClick,
    setSelectedStaff,
    setIsEditModalOpen,
    confirmDeleteStaff
}) => {
    return (
        <div className="table-container">
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
        </div>
    )
}

export default EmployeeTable
