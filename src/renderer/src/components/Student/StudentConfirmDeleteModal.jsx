import React from 'react'

const StudentConfirmDeleteModal = ({ deleteConfirm, setDeleteConfirm, handleDeleteStudent }) => {
  return (
    <div className="delete-modal-overlay">
      <div className="delete-modal-content">
        <div className="delete-modal-header">
          <h3>Confirm Delete</h3>
        </div>
        <div className="delete-modal-body">
          <p>
            Are you sure you want to delete student <strong>{deleteConfirm.studentName}</strong>?
          </p>
          <p className="delete-warning">This action cannot be undone.</p>
        </div>
        <div className="delete-modal-footer">
          <button
            className="cancel-delete-btn"
            onClick={() => setDeleteConfirm({ isOpen: false, studentId: null, studentName: '' })}
          >
            Cancel
          </button>
          <button className="confirm-delete-btn" onClick={handleDeleteStudent}>
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

export default StudentConfirmDeleteModal
