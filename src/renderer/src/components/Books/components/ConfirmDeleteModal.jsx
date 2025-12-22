import { FaExclamationTriangle } from 'react-icons/fa'
import '../styles/ConfirmDeleteModal.css'

const ConfirmDeleteModal = ({ isOpen, bookTitle, onConfirm, onCancel, isDeleting }) => {
  if (!isOpen) return null

  return (
    <div className="confirm-modal-overlay">
      <div className="confirm-modal">
        <div className="confirm-modal-header">
          <div className="confirm-modal-icon">
            <FaExclamationTriangle />
          </div>
          <h2>Delete Book</h2>
        </div>

        <div className="confirm-modal-body">
          <p>
            Are you sure you want to delete <strong>{bookTitle}</strong>?
          </p>
          <p className="confirm-modal-warning">This action cannot be undone.</p>
        </div>

        <div className="confirm-modal-footer">
          <button className="confirm-btn cancel" onClick={onCancel} disabled={isDeleting}>
            Cancel
          </button>
          <button className="confirm-btn delete" onClick={onConfirm} disabled={isDeleting}>
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDeleteModal
