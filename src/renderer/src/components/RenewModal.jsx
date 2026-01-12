import { useState } from 'react'
import PropTypes from 'prop-types'
import { Calendar, X, User, BookOpen } from 'lucide-react'
import { Button } from './ui/button'
import './RenewModal.css'
import { useToaster } from './Toast/useToaster'

const RenewModal = ({
  isOpen = false,
  onClose = () => {},
  onSubmit = () => {},
  borrowData = {
    id: '',
    student_name: '',
    book_title: '',
    due_date: ''
  }
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { showToast } = useToaster()

  const parseDateOnly = (dateStr) => {
    if (!dateStr) return null
    // Prefer local date parsing for YYYY-MM-DD to avoid timezone shifts.
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      const [year, month, day] = dateStr.split('-').map(Number)
      return new Date(year, month - 1, day)
    }
    const parsed = new Date(dateStr)
    return Number.isNaN(parsed.getTime()) ? null : parsed
  }

  const formatDateOnly = (dateObj) => {
    const pad2 = (n) => String(n).padStart(2, '0')
    const year = dateObj.getFullYear()
    const month = pad2(dateObj.getMonth() + 1)
    const day = pad2(dateObj.getDate())
    return `${year}-${month}-${day}`
  }

  const calculateNewDueDate = (currentDueDate) => {
    const baseDate = parseDateOnly(currentDueDate)
    if (!baseDate) return ''

    // Include weekends: extend by 5 calendar days.
    const newDate = new Date(baseDate)
    newDate.setDate(newDate.getDate() + 5)
    return formatDateOnly(newDate)
  }

  const handleRenew = async () => {
    if (isSubmitting) return
    setIsSubmitting(true)

    try {
      const newDueDate = calculateNewDueDate(borrowData.due_date)
      await onSubmit({
        ...borrowData,
        due_date: newDueDate
      })

      window.showToast('Book renewed successfully!', '', 'success')
      onClose()
    } catch (error) {
      window.showToast('Failed to renew book', error.message || '', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="renew-modal-overlay">
      <div className="renew-modal-content">
        <div className="renew-modal-header">
          <h2>Renew Book</h2>
          <button onClick={onClose} className="renew-modal-close" aria-label="Close modal">
            <X size={20} />
          </button>
        </div>
        <div className="renew-modal-body">
          <div className="renew-info-group">
            <label>Student Name</label>
            <p>
              <User className="user-icon" size={18} />
              <span>{borrowData.student_name}</span>
            </p>
          </div>
          <div className="renew-info-group">
            <label>Book Title</label>
            <p>
              <BookOpen className="book-icon" size={18} />
              <span>{borrowData.book_title}</span>
            </p>
          </div>
          <div className="renew-info-group">
            <label>Current Due Date</label>
            <p>
              <Calendar className="calendar-icon" size={18} />
              <span>{(parseDateOnly(borrowData.due_date) || new Date()).toLocaleDateString()}</span>
            </p>
          </div>
          <div className="renew-info-group">
            <label>New Due Date</label>
            <p>
              <Calendar className="calendar-icon" size={18} />
              <span>
                {(
                  parseDateOnly(calculateNewDueDate(borrowData.due_date)) || new Date()
                ).toLocaleDateString()}
              </span>
            </p>
          </div>
        </div>
        <div className="renew-modal-footer">
          <Button type="button" onClick={onClose} variant="secondary" className="renew-cancel-btn">
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleRenew}
            variant="primary"
            className="renew-submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Renewing...' : 'Renew Book'}
          </Button>
        </div>
      </div>
    </div>
  )
}

RenewModal.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  onSubmit: PropTypes.func,
  borrowData: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    student_name: PropTypes.string,
    book_title: PropTypes.string,
    due_date: PropTypes.string
  })
}

export default RenewModal
