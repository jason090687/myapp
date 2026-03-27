import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { Calendar, X, User, BookOpen } from 'lucide-react'
import { Button } from '../ui/button'
import './styles/OverdueModal.css'
import { useToaster } from '../Toast/useToaster'
import { useActivity } from '../../context/ActivityContext'
import { useProcessOverduePayment } from '../../hooks'
import { useMutation } from '@tanstack/react-query'

const OverdueModal = ({
  isOpen,
  onClose,
  borrowData = { id: 0, student: '', book: '', due_date: new Date().toISOString() },
  onSuccess = () => { },
  studentMap = {}
}) => {
  const [selectedAction, setSelectedAction] = useState('return')
  const [orNumber, setOrNumber] = useState('')

  const { addActivity } = useActivity()
  const { showToast } = useToaster()

  const paymentMutation = useProcessOverduePayment()

  useEffect(() => {
    if (!isOpen) return
    setSelectedAction('return')
    setOrNumber('')
  }, [isOpen, borrowData?.id])

  // Days overdue
  const getDaysOverdue = () => {
    const today = new Date()
    const due = new Date(borrowData.due_date)
    const diff = today - due
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
    return Math.max(0, days)
  }

  // Daily fine
  const getDailyFine = () => 2

  const calculateNewDueDate = (currentDueDate) => {
    let newDate = new Date(currentDueDate)
    newDate.setDate(newDate.getDate() + 5)
    return newDate.toISOString().split('T')[0]
  }

  const handlePayment = () => {
    if (!borrowData.id) return

    if (!orNumber.trim()) {
      showToast('OR Number is required', '', 'error')
      return
    }

    const fineAmount = getDaysOverdue() * getDailyFine()

    const paymentData = {
      id: borrowData.id,
      amount: fineAmount,
      paid: true,
      paid_at: new Date().toISOString().split('T')[0],
      or_number: orNumber.trim()
    }

    if (selectedAction === 'return') {
      paymentData.is_returned = true
      paymentData.returned_date = new Date().toISOString().split('T')[0]
    }

    if (selectedAction === 'renew') {
      paymentData.due_date = calculateNewDueDate(borrowData.due_date)
      paymentData.renewed = true
      paymentData.renewed_count = (borrowData.renewed_count || 0) + 1
    }

    paymentMutation.mutate(
      { borrowId: borrowData.id, paymentData },
      {
        onSuccess: (_, variables) => {
          const amount = variables.paymentData.amount
          addActivity({
            type: selectedAction === 'return' ? 'overdue' : 'book_borrowed',
            description: `Book ${selectedAction === 'return' ? 'returned' : 'renewed'} with overdue payment of ₱${amount}`
          })
          showToast(
            selectedAction === 'return'
              ? 'Book returned and payment processed successfully!'
              : 'Book renewed and payment processed successfully!',
            '',
            'success'
          )
          onClose()
          onSuccess?.()
        },
        onError: (error) => {
          showToast('Failed to process payment', error.message || '', 'error')
        }
      }
    )
  }

  if (!isOpen) return null

  return (
    <div className="overdue-modal-overlay">
      <div className="overdue-modal-content">
        <div className="overdue-modal-header">
          <h2>Process Overdue Payment</h2>
          <button onClick={onClose} className="overdue-modal-close" aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        <div className="overdue-modal-body">
          <div className="overdue-info-group">
            <label>Student Name</label>
            <p>
              <User size={18} />
              <span>
                {studentMap[borrowData.student] ||
                  borrowData.student_name ||
                  borrowData.student ||
                  'N/A'}
              </span>
            </p>
          </div>

          <div className="overdue-info-group">
            <label>Book Title</label>
            <p>
              <BookOpen size={18} />
              <span>{borrowData.book_title || borrowData.book || 'N/A'}</span>
            </p>
          </div>

          <div className="overdue-info-group">
            <label>Due Date</label>
            <p>
              <Calendar size={18} />
              <span>{new Date(borrowData.due_date).toLocaleDateString()}</span>
            </p>
          </div>

          <div className="overdue-info-group">
            <label>Payment Date</label>
            <p>
              <Calendar size={18} />
              <span>{new Date().toLocaleDateString()}</span>
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

        <div className="overdue-payment-summary">
          <div className="summary-breakdown">
            <div className="breakdown-row">
              <span>Days Overdue:</span>
              <span>{getDaysOverdue()} days</span>
            </div>

            <div className="breakdown-row">
              <span>Daily Fine:</span>
              <span>₱{getDailyFine()}/day</span>
            </div>

            <div className="breakdown-divider"></div>
          </div>

          <div className="summary-label">Total Amount to Pay</div>

          <div className="summary-amount">₱{(getDaysOverdue() * getDailyFine()).toFixed(2)}</div>
        </div>

        <div className="overdue-modal-footer">
          <Button
            type="button"
            onClick={onClose}
            variant="secondary"
            className="overdue-cancel-btn"
          >
            Cancel
          </Button>

          <Button
            type="button"
            onClick={handlePayment}
            variant="primary"
            className="overdue-submit-btn"
            disabled={paymentMutation.isPending}
          >
            {paymentMutation.isPending
              ? 'Processing...'
              : selectedAction === 'return'
                ? 'Return Book and Pay'
                : 'Renew Book and Pay'}
          </Button>
        </div>
      </div>
    </div>
  )
}

OverdueModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  borrowData: PropTypes.object,
  onSuccess: PropTypes.func,
  studentMap: PropTypes.object
}

export default OverdueModal
