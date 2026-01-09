import { useState } from 'react'
import PropTypes from 'prop-types'
import { User, BookOpen, Calendar, X, Check } from 'lucide-react'
import { createPortal } from 'react-dom'
import { Button } from './ui/button'
import './RequestBorrowModal.css'
import { useToaster } from './Toast/useToaster'

function RequestBorrowModal({ isOpen, onClose, onApprove, borrowRequest }) {
  const [studentId, setStudentId] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { showToast } = useToaster()

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!studentId) {
      showToast('Error', 'Please enter a student ID', 'error')
      return
    }

    try {
      setIsLoading(true)
      await onApprove({
        id: borrowRequest.id,
        student_id: parseInt(studentId),
        book: borrowRequest.bookId,
        borrow_date: borrowRequest.borrowDate,
        due_date: borrowRequest.returnDate,
        purpose: borrowRequest.purpose
      })
      setStudentId('')
      onClose()
      showToast('Success', 'Borrow request approved successfully!', 'success')
    } catch (error) {
      console.error('Error approving request:', error)
      showToast('Error', error.message || 'Failed to approve borrow request', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setStudentId('')
    onClose()
  }

  if (!isOpen || !borrowRequest) return null

  const modal = (
    <div className="borrow-modal-overlay" onClick={handleClose}>
      <div className="borrow-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="borrow-modal-header">
          <h2>Approve Borrow Request</h2>
          <button className="borrow-modal-close" onClick={handleClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="borrow-modal-form">
          <div className="borrow-form-grid">
            {/* Book Title - Read Only */}
            <div className="borrow-form-group">
              <label htmlFor="book-title">Book Title</label>
              <div className="borrow-input-wrapper">
                <BookOpen className="borrow-input-icon" size={18} />
                <input
                  type="text"
                  id="book-title"
                  value={borrowRequest.bookTitle}
                  readOnly
                  className="borrow-input"
                />
              </div>
            </div>

            {/* Borrow Date - Read Only */}
            <div className="borrow-form-group">
              <label htmlFor="borrow-date">Borrow Date</label>
              <div className="borrow-input-wrapper">
                <Calendar className="borrow-input-icon" size={18} />
                <input
                  type="text"
                  id="borrow-date"
                  value={new Date(borrowRequest.borrowDate).toLocaleDateString()}
                  readOnly
                  className="borrow-input"
                />
              </div>
            </div>

            {/* Due Date - Read Only */}
            <div className="borrow-form-group">
              <label htmlFor="due-date">Due Date</label>
              <div className="borrow-input-wrapper">
                <Calendar className="borrow-input-icon" size={18} />
                <input
                  type="text"
                  id="due-date"
                  value={new Date(borrowRequest.returnDate).toLocaleDateString()}
                  readOnly
                  className="borrow-input"
                />
              </div>
            </div>

            {/* Student ID Input - Required Field */}
            <div className="borrow-form-group">
              <label htmlFor="student-id" className="required">
                Student ID
              </label>
              <div className="borrow-input-wrapper">
                <User className="borrow-input-icon" size={18} />
                <input
                  type="text"
                  id="student-id"
                  placeholder="Enter student ID"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  required
                  disabled={isLoading}
                  className="borrow-input"
                />
              </div>
            </div>
          </div>

          <div className="borrow-modal-footer">
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
              disabled={isLoading}
              className="borrow-cancel-btn"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isLoading || !studentId}
              className="borrow-submit-btn"
            >
              {isLoading ? 'Approving...' : 'Approve Request'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )

  return createPortal(modal, document.body)
}

RequestBorrowModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onApprove: PropTypes.func.isRequired,
  borrowRequest: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    bookId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    bookTitle: PropTypes.string,
    borrowDate: PropTypes.string,
    returnDate: PropTypes.string,
    purpose: PropTypes.string
  })
}

export default RequestBorrowModal
