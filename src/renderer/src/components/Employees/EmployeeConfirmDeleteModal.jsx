import React from 'react'

const EmployeeConfirmDeleteModal = ({ deleteConfirm, cancelDelete, handleDeleteStaff }) => {
    return (
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
    )
}

export default EmployeeConfirmDeleteModal;


