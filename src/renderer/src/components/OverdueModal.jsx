import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { FaCalendar, FaMoneyBill } from 'react-icons/fa'
import './OverdueModal.css'
import { Bounce, toast } from 'react-toastify'
import { useSelector } from 'react-redux'
import { processOverduePayment, returnBook, renewBook } from '../Features/api'

const OverdueModal = ({ isOpen, onClose, onSubmit, borrowData, onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [overdueAmount, setOverdueAmount] = useState(0)
  const [selectedAction, setSelectedAction] = useState('pay')
  const { token } = useSelector((state) => state.auth)

  useEffect(() => {
    if (borrowData.due_date) {
      const dueDate = new Date(borrowData.due_date)
      const today = new Date()
      const diffTime = Math.abs(today - dueDate)
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      const amount = diffDays * 2 // 2 pesos per day
      setOverdueAmount(amount)
    }
  }, [borrowData.due_date])

  const calculateNewDueDate = (currentDueDate) => {
    let newDate = new Date(currentDueDate)
    let daysAdded = 0

    while (daysAdded < 5) {
      newDate.setDate(newDate.getDate() + 1)
      // Skip weekends (0 is Sunday, 6 is Saturday)
      if (newDate.getDay() !== 0 && newDate.getDay() !== 6) {
        daysAdded++
      }
    }

    return newDate.toISOString().split('T')[0]
  }

  const handlePayment = async () => {
    if (isSubmitting || !borrowData.id) return
    setIsSubmitting(true)

    try {
      const paymentData = {
        id: borrowData.id,
        amount: overdueAmount,
        paid: true,
        paid_at: new Date().toISOString().split('T')[0]
      }

      if (selectedAction === 'return') {
        paymentData.is_returned = true
        paymentData.returned_date = new Date().toISOString().split('T')[0]
      } else if (selectedAction === 'renew') {
        const newDueDate = calculateNewDueDate(borrowData.due_date)
        paymentData.due_date = newDueDate
        paymentData.renewed = true
      }

      await processOverduePayment(token, borrowData.id, paymentData)
      await onSubmit(paymentData)

      // Ensure table refresh happens after successful payment
      if (onSuccess) {
        await onSuccess()
      }

      toast.success(
        selectedAction === 'return'
          ? 'Book returned and payment processed successfully!'
          : selectedAction === 'renew'
            ? 'Book renewed and payment processed successfully!'
            : 'Payment processed successfully!'
      )

      onClose()
    } catch (error) {
      console.error(error)
      toast.error(error.message || 'Failed to process payment')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="overdue-modal-overlay">
      <div className="overdue-modal-content">
        <div className="overdue-modal-header">
          <h2>Process Overdue Payment</h2>
          <button onClick={onClose} className="overdue-modal-close">
            &times;
          </button>
        </div>
        <div className="overdue-modal-body">
          <div className="overdue-info-group">
            <label>Student Name</label>
            <p>{borrowData.student_name}</p>
          </div>
          <div className="overdue-info-group">
            <label>Book Title</label>
            <p>{borrowData.book_title}</p>
          </div>
          <div className="overdue-info-group">
            <label>Due Date</label>
            <p>
              <FaCalendar className="calendar-icon" />
              {new Date(borrowData.due_date).toLocaleDateString()}
            </p>
          </div>
          <div className="overdue-info-group">
            <label>Amount Due</label>
            <p className="amount">
              <FaMoneyBill className="money-icon" />₱{overdueAmount.toFixed(2)}
            </p>
          </div>
          <div className="overdue-info-group">
            <label>Payment Date</label>
            <p>
              <FaCalendar className="calendar-icon" />
              {new Date().toLocaleDateString()}
            </p>
          </div>
          <div className="overdue-info-group">
            <label>Select Action</label>
            <select
              className="action-select"
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
            >
              <option value="pay">Pay Overdue Only</option>
              <option value="return">Return Book and Pay</option>
              <option value="renew">Renew Book and Pay</option>
            </select>
          </div>
        </div>
        <div className="overdue-modal-footer">
          <button type="button" onClick={onClose} className="overdue-cancel-btn">
            Cancel
          </button>
          <button
            type="button"
            onClick={handlePayment}
            className="overdue-submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <div className="button-spinner">
                <div className="spinner"></div>
              </div>
            ) : selectedAction === 'return' ? (
              'Return and Pay'
            ) : selectedAction === 'renew' ? (
              'Renew and Pay'
            ) : (
              'Pay Overdue'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

OverdueModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  borrowData: PropTypes.shape({
    student_name: PropTypes.string.isRequired,
    book_title: PropTypes.string.isRequired,
    due_date: PropTypes.string.isRequired
  }).isRequired,
  onSuccess: PropTypes.func
}

export default OverdueModal
