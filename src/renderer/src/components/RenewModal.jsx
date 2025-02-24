import { useState } from 'react'
import PropTypes from 'prop-types'
import { FaCalendar } from 'react-icons/fa'
import './RenewModal.css'
import { useSelector } from 'react-redux'
import { Bounce, toast } from 'react-toastify'

const RenewModal = ({ isOpen, onClose, onSubmit, borrowData }) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { token } = useSelector((state) => state.auth)

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

      toast.success('Book renewed successfully!', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: false,
        theme: 'light',
        transition: Bounce
      })
      onClose()
    } catch (error) {
      toast.error(error.message || 'Failed to renew book', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: false,
        theme: 'light',
        transition: Bounce
      })
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
          <button onClick={onClose} className="renew-modal-close">
            &times;
          </button>
        </div>
        <div className="renew-modal-body">
          <div className="renew-info-group">
            <label>Student Name</label>
            <p>{borrowData.student_name}</p>
          </div>
          <div className="renew-info-group">
            <label>Book Title</label>
            <p>{borrowData.book_title}</p>
          </div>
          <div className="renew-info-group">
            <label>Current Due Date</label>
            <p>
              <FaCalendar className="calendar-icon" />
              {new Date(borrowData.due_date).toLocaleDateString()}
            </p>
          </div>
          <div className="renew-info-group">
            <label>New Due Date</label>
            <p>
              <FaCalendar className="calendar-icon" />
              {new Date(calculateNewDueDate(borrowData.due_date)).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="renew-modal-footer">
          <button type="button" onClick={onClose} className="renew-cancel-btn">
            Cancel
          </button>
          <button
            type="button"
            onClick={handleRenew}
            className="renew-submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <div className="button-spinner">
                <div className="spinner"></div>
              </div>
            ) : (
              'Renew Book'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

RenewModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  borrowData: PropTypes.shape({
    student_name: PropTypes.string.isRequired,
    book_title: PropTypes.string.isRequired,
    due_date: PropTypes.string.isRequired
  }).isRequired
}

export default RenewModal
