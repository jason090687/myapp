import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { FaCalendar, FaMoneyBill } from 'react-icons/fa'
import './OverdueModal.css'
import { Bounce, toast } from 'react-toastify'
import { useSelector } from 'react-redux'
import { processOverduePayment, fetchOverdueBorrowedBooks } from '../Features/api'

const OverdueModal = ({
  isOpen,
  onClose,
  onSubmit,
  borrowData = { id: 0, student_name: '', book_title: '', due_date: new Date().toISOString() },
  onSuccess = () => {}
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [overdueAmount, setOverdueAmount] = useState(0)
  const [isLoadingAmount, setIsLoadingAmount] = useState(false)
  const [selectedAction, setSelectedAction] = useState('pay')
  const { token } = useSelector((state) => state.auth)

  useEffect(() => {
    const fetchAmountData = async () => {
      if (!borrowData.id || !token) return

      setIsLoadingAmount(true)
      try {
        const response = await fetchOverdueBorrowedBooks(token, borrowData.id)
        setOverdueAmount(Number(response.amount) || 0)
      } catch (error) {
        toast.error('Failed to fetch overdue amount')
        setOverdueAmount(0)
      } finally {
        setIsLoadingAmount(false)
      }
    }

    if (isOpen && borrowData.id) {
      fetchAmountData()
    }
  }, [borrowData.id, token, isOpen])

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
        paymentData.renewed_count = (borrowData.renewed_count || 0) + 1
      }

      await processOverduePayment(token, borrowData.id, paymentData)
      await onSubmit(paymentData)

      toast.success(
        selectedAction === 'return'
          ? 'Book returned and payment processed successfully!'
          : 'Book renewed and payment processed successfully!'
      )

      // Close both modals
      onClose()
      if (onSuccess) {
        onSuccess()
      }
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
            {isLoadingAmount ? (
              <div className="amount-loading">Loading amount...</div>
            ) : (
              <p className="amount">
                <FaMoneyBill className="money-icon" />₱
                {typeof overdueAmount === 'number' ? overdueAmount.toFixed(2) : '0.00'}
              </p>
            )}
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
            ) : (
              'Renew and Pay'
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
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    student_name: PropTypes.string,
    book_title: PropTypes.string,
    due_date: PropTypes.string
  }),
  onSuccess: PropTypes.func
}

export default OverdueModal
