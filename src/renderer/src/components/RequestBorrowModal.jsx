import { useState } from 'react'
import PropTypes from 'prop-types'
import { User, BookOpen, Calendar, X, FileText, XCircle, Check } from 'lucide-react'
import { createPortal } from 'react-dom'
import { Button } from './ui/button'
import './RequestBorrowModal.css'
import { useToaster } from './Toast/useToaster'
import { borrowBook, rejectBorrowRequest, updateBook } from '../Features/api'
import { useSelector } from 'react-redux'

function RequestBorrowModal({ isOpen, onClose, onApprove, borrowRequest, onRequestUpdate }) {
  const [isLoading, setIsLoading] = useState(false)
  const [dueDate, setDueDate] = useState(() => {
    const today = new Date()
    today.setDate(today.getDate() + 7) // Default to 7 days from now
    return today.toISOString().split('T')[0]
  })
  const { showToast } = useToaster()
  const { token } = useSelector((state) => state.auth)

  const formatDate = (value) => {
    if (!value) return ''
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return String(value)
    return date.toLocaleDateString()
  }

  const requestedDate = borrowRequest?.request_date ?? borrowRequest?.requestDate
  const studentName =
    borrowRequest?.studentName ?? borrowRequest?.student_name ?? borrowRequest?.student?.name
  const requestNotes = borrowRequest?.notes ?? ''

  const handleReject = async () => {
    try {
      setIsLoading(true)
      await rejectBorrowRequest(token, borrowRequest.id, { response_notes: 'Request rejected' })
      onClose()
      if (onRequestUpdate) {
        onRequestUpdate(borrowRequest.id, { status: 'rejected' })
      }
      showToast('Success', 'Request rejected', 'info')
    } catch (error) {
      console.error('Error rejecting request:', error)
      showToast('Error', 'Failed to reject request', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const studentId = borrowRequest?.student ?? borrowRequest?.studentId

    if (!studentId) {
      showToast('Error', 'Student ID is missing', 'error')
      return
    }

    try {
      setIsLoading(true)

      const approvalData = {
        student_id: studentId,
        action: 'approved',
        response_notes: requestNotes || ''
      }

      await onApprove({ id: borrowRequest.id, ...approvalData })

      await borrowBook(token, {
        book: borrowRequest.bookId,
        student: studentId,
        due_date: dueDate,
        status: 'borrowed'
      })

      await updateBook(token, borrowRequest.bookId, { status: 'borrowed' })

      onClose()
    } catch (error) {
      console.error('Error approving request:', error)
      showToast('Error', error.message || 'Failed to approve borrow request', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    // Reset due date to default (7 days from now)
    const today = new Date()
    today.setDate(today.getDate() + 7)
    setDueDate(today.toISOString().split('T')[0])
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
            {/* Book Title */}
            <div className="borrow-form-group">
              <label htmlFor="book-title">Book Title</label>
              <div className="borrow-input-wrapper">
                <BookOpen className="borrow-input-icon" size={18} />
                <input
                  type="text"
                  id="book-title"
                  value={borrowRequest.bookTitle || ''}
                  readOnly
                  className="borrow-input"
                />
              </div>
            </div>

            {/* Student Name */}
            <div className="borrow-form-group">
              <label htmlFor="student-name">Student Name</label>
              <div className="borrow-input-wrapper">
                <User className="borrow-input-icon" size={18} />
                <input
                  type="text"
                  id="student-name"
                  value={studentName || ''}
                  readOnly
                  className="borrow-input"
                />
              </div>
            </div>

            {/* Request Date */}
            <div className="borrow-form-group">
              <label htmlFor="request-date">Request Date</label>
              <div className="borrow-input-wrapper">
                <Calendar className="borrow-input-icon" size={18} />
                <input
                  type="text"
                  id="request-date"
                  value={formatDate(requestedDate)}
                  readOnly
                  className="borrow-input"
                />
              </div>
            </div>

            {/* Notes */}
            <div className="borrow-form-group">
              <label htmlFor="notes">Notes</label>
              <div className="borrow-input-wrapper">
                <FileText className="borrow-input-icon" size={18} />
                <input
                  type="text"
                  name="notes"
                  id="notes"
                  className="borrow-input"
                  value={requestNotes}
                  readOnly
                />
              </div>
            </div>

            {/* Due Date */}
            <div className="borrow-form-group">
              <label htmlFor="due-date">Due Date</label>
              <div className="borrow-input-wrapper">
                <Calendar className="borrow-input-icon" size={18} />
                <input
                  type="date"
                  id="due-date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="borrow-input"
                  required
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
              type="button"
              variant="danger"
              onClick={handleReject}
              disabled={isLoading}
              className="borrow-reject-btn"
            >
              <XCircle size={16} />
              {isLoading ? 'Rejecting...' : 'Reject'}
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isLoading}
              className="borrow-submit-btn"
            >
              <Check size={16} />
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
  onRequestUpdate: PropTypes.func,
  borrowRequest: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    bookId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    bookTitle: PropTypes.string,
    studentName: PropTypes.string,
    requestDate: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
    notes: PropTypes.string,
    isRead: PropTypes.bool,
    is_read: PropTypes.bool
  })
}

export default RequestBorrowModal
