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

  const calculateNewDueDate = (currentDueDate) => {
    // Start with the next day
    let newDate = new Date(currentDueDate)
    newDate.setDate(newDate.getDate() + 1)

    let daysAdded = 0

    while (daysAdded < 5) {
      // Changed from >= to <
      // Skip weekends (0 is Sunday, 6 is Saturday)
      if (newDate.getDay() !== 0 && newDate.getDay() !== 6) {
        daysAdded++
      }
      // If we haven't reached 5 working days, add another day
      if (daysAdded < 5) {
        newDate.setDate(newDate.getDate() + 1)
      }
    }

    return newDate.toISOString().split('T')[0]
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

      showToast('Book renewed successfully!', '', 'success')
      onClose()
    } catch (error) {
      showToast('Failed to renew book', error.message || '', 'error')
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
              <span>{new Date(borrowData.due_date).toLocaleDateString()}</span>
            </p>
          </div>
          <div className="renew-info-group">
            <label>New Due Date</label>
            <p>
              <Calendar className="calendar-icon" size={18} />
              <span>{new Date(calculateNewDueDate(borrowData.due_date)).toLocaleDateString()}</span>
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
