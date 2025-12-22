import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { FaCalendar, FaMoneyBill } from 'react-icons/fa'
import './OverdueModal.css'
import { toast } from 'react-toastify'
import { useSelector } from 'react-redux'
import { processOverduePayment, fetchOverdueBorrowedBooks } from '../Features/api'

const OverdueModal = ({
  isOpen,
  onClose,
  onSubmit,
  borrowData = { id: 0, student: '', book_title: '', due_date: new Date().toISOString() },
  onSuccess = () => {}
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [overdueAmount, setOverdueAmount] = useState(0)
  const [isLoadingAmount, setIsLoadingAmount] = useState(false)
  const [selectedAction, setSelectedAction] = useState('pay')
  const [orNumber, setOrNumber] = useState('')
  const { token } = useSelector((state) => state.auth)

  useEffect(() => {
    const fetchAmountData = async () => {
      if (!borrowData.id || !token) return

      setIsLoadingAmount(true)
      try {
        const response = await fetchOverdueBorrowedBooks(token, borrowData.id)
        setOverdueAmount(Number(response.amount) || 0)
      } catch (error) {
        // If API fails, calculate based on overdue days
        const calculatedAmount = calculateOverdueAmount(borrowData.due_date)
        setOverdueAmount(calculatedAmount)
      } finally {
        setIsLoadingAmount(false)
      }
    }

    if (isOpen && borrowData.id) {
      fetchAmountData()
    }
  }, [borrowData.id, token, isOpen])

  // Calculate overdue amount based on days past due date
  const calculateOverdueAmount = (dueDate) => {
    const today = new Date()
    const due = new Date(dueDate)

    // Calculate days overdue
    const diffTime = today - due
    const daysOverdue = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    // If not overdue, return 0
    if (daysOverdue <= 0) return 0

    // Calculate amount: 2 pesos per day
    const dailyFine = 2
    const amount = daysOverdue * dailyFine

    return amount
  }

  // Get days overdue
  const getDaysOverdue = () => {
    const today = new Date()
    const due = new Date(borrowData.due_date)
    const diffTime = today - due
    const daysOverdue = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return Math.max(0, daysOverdue)
  }

  // Get daily fine amount
  const getDailyFine = () => 2

  const calculateNewDueDate = (currentDueDate) => {
    // Start with the next day and add 5 days (including weekends)
    let newDate = new Date(currentDueDate)
    newDate.setDate(newDate.getDate() + 5)

    return newDate.toISOString().split('T')[0]
  }

  const handlePayment = async () => {
    if (isSubmitting || !borrowData.id || !orNumber.trim()) {
      // Add OR number validation
      if (!orNumber.trim()) {
        toast.error('OR Number is required')
        return
      }
      return
    }
    setIsSubmitting(true)

    try {
      // Calculate the fine amount: days overdue × daily fine
      const calculatedFineAmount = getDaysOverdue() * getDailyFine()

      const paymentData = {
        id: borrowData.id,
        amount: calculatedFineAmount,
        paid: true,
        paid_at: new Date().toISOString().split('T')[0],
        or_Number: orNumber.trim() // Add OR number to payload
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
            <p>{borrowData.student || borrowData.student_name || 'N/A'}</p>
          </div>
          <div className="overdue-info-group">
            <label>Book Title</label>
            <p>{borrowData.book || borrowData.book_title || 'N/A'}</p>
          </div>
          <div className="overdue-info-group">
            <label>Due Date</label>
            <p>
              <FaCalendar className="calendar-icon" />
              {new Date(borrowData.due_date).toLocaleDateString()}
            </p>
          </div>
          {/* <div className="overdue-info-group">
            <label>Days Overdue</label>
            <p>
              {Math.ceil((new Date() - new Date(borrowData.due_date)) / (1000 * 60 * 60 * 24))} days
            </p>
          </div> */}
          {/* <div className="overdue-info-group">
            <label>Amount Due (₱50/day)</label>
            {isLoadingAmount ? (
              <div className="amount-loading">Loading amount...</div>
            ) : (
              <p className="amount">
                <FaMoneyBill className="money-icon" />₱
                {typeof overdueAmount === 'number' ? overdueAmount.toFixed(2) : '0.00'}
              </p>
            )}
          </div> */}
          <div className="overdue-info-group">
            <label>Payment Date</label>
            <p>
              <FaCalendar className="calendar-icon" />
              {new Date().toLocaleDateString()}
            </p>
          </div>
          <div className="overdue-info-group">
            <label>OR Number</label>
            <input
              type="text"
              className="or-number-input"
              value={orNumber}
              onChange={(e) => setOrNumber(e.target.value)}
              placeholder="Enter OR Number"
              required
            />
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

        {/* Payment Summary Section */}
        <div className="overdue-payment-summary">
          {' '}
          <div className="summary-breakdown">
            <div className="breakdown-row">
              <span className="breakdown-label">Days Overdue:</span>
              <span className="breakdown-value">{getDaysOverdue()} days</span>
            </div>
            <div className="breakdown-row">
              <span className="breakdown-label">Daily Fine:</span>
              <span className="breakdown-value">₱{getDailyFine()}/day</span>
            </div>
            <div className="breakdown-divider"></div>
          </div>{' '}
          <div className="summary-label">Total Amount to Pay</div>
          <div className="summary-amount">
            <FaMoneyBill className="summary-icon" />
            {(getDaysOverdue() * getDailyFine()).toFixed(2)}
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
