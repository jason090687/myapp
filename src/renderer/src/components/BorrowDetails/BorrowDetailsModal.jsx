import React, { useState } from 'react'
import {
  FaTimes,
  FaUndo,
  FaMoneyBill,
  FaUser,
  FaBook,
  FaLayerGroup,
  FaCalendarAlt,
  FaClock,
  FaInfoCircle
} from 'react-icons/fa'
import './BorrowDetailsModal.css'

const fieldIcons = {
  'Student Name': <FaUser />,
  'Book Title': <FaBook />,
  'Lexile Level': <FaLayerGroup />,
  'Borrow Date': <FaCalendarAlt />,
  'Due Date': <FaClock />,
  Status: <FaInfoCircle />
}

const BorrowDetailsModal = ({ isOpen, onClose, borrowData, onReturn, onRenew, onPay }) => {
  const [processingAction, setProcessingAction] = useState(null)

  if (!isOpen || !borrowData) return null

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString()

  const isOverdue = (dueDate) => new Date(dueDate) < new Date()

  const isDue = isOverdue(borrowData.due_date)
  const canRenew = borrowData.renewed_count < 3
  const shouldShowButtons = !borrowData.is_returned

  const detailItems = [
    { label: 'Student Name', value: borrowData.student_name },
    { label: 'Book Title', value: borrowData.book_title },
    { label: 'Lexile Level', value: borrowData.lexile_level || 'N/A' },
    { label: 'Borrow Date', value: formatDate(borrowData.borrowed_date) },
    { label: 'Due Date', value: formatDate(borrowData.due_date) },
    { label: 'Status', value: borrowData.status }
  ]

  const handleReturn = async (id) => {
    setProcessingAction('return')
    try {
      await onReturn(id)
      onClose()
    } catch (error) {
      console.error('Error returning book:', error)
    } finally {
      setProcessingAction(null)
    }
  }

  const handleRenew = async (data) => {
    setProcessingAction('renew')
    try {
      await onRenew(data)
    } catch (error) {
      console.error('Error renewing book:', error)
    } finally {
      setProcessingAction(null)
    }
  }

  const handlePay = async (data) => {
    setProcessingAction('pay')
    try {
      await onPay(data)
    } catch (error) {
      console.error('Error processing payment:', error)
    } finally {
      setProcessingAction(null)
    }
  }

  const Spinner = () => (
    <div className="button-spinner">
      <div className="spinner" />
    </div>
  )

  return (
    <div className="borrow-details-overlay" onClick={onClose}>
      <div className="borrow-details-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="borrow-details-header">
          <div className="header-content-detail">
            <h2 className="header-title-detail">Borrow Details</h2>
            <span className={`status-tag ${borrowData.status?.toLowerCase()}`}>
              {borrowData.status}
            </span>
          </div>
          <button className="close-button" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        {/* Body – form-field style */}
        <div className="borrow-details-body">
          {detailItems.map(({ label, value }) =>
            value ? (
              <div key={label} className="detail-item">
                <span className="detail-label">{label}</span>
                <div className="detail-field">
                  <span className="detail-field-icon">{fieldIcons[label]}</span>
                  <span className="detail-value">{value}</span>
                </div>
              </div>
            ) : null
          )}
        </div>

        {/* Footer */}
        {shouldShowButtons && (
          <div className="borrow-details-footer">
            <button
              className="action-button return"
              onClick={() => handleReturn(borrowData.id)}
              disabled={processingAction !== null}
            >
              {processingAction === 'return' ? (
                <Spinner />
              ) : (
                <>
                  <FaUndo /> Return Book
                </>
              )}
            </button>

            {isDue && !borrowData.paid && (
              <button
                className="action-button pay"
                onClick={() => handlePay(borrowData)}
                disabled={processingAction !== null}
              >
                {processingAction === 'pay' ? (
                  <Spinner />
                ) : (
                  <>
                    <FaMoneyBill /> Pay Overdue
                  </>
                )}
              </button>
            )}

            {canRenew && (
              <button
                className="action-button renew"
                onClick={() => handleRenew(borrowData)}
                disabled={borrowData.paid || processingAction !== null}
              >
                {processingAction === 'renew' ? (
                  <Spinner />
                ) : (
                  <>
                    <FaUndo /> Renew
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default BorrowDetailsModal
