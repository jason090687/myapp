import React from 'react'
import { FaTimes, FaUndo, FaMoneyBill } from 'react-icons/fa'
import './BorrowDetailsModal.css'

const BorrowDetailsModal = ({ isOpen, onClose, borrowData, onReturn, onRenew, onPay }) => {
  if (!isOpen || !borrowData) return null

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString()

  // Check if book is overdue
  const isOverdue = (dueDate) => {
    const today = new Date()
    const due = new Date(dueDate)
    return due < today
  }

  // Check various conditions
  const isDue = isOverdue(borrowData.due_date)
  const canRenew = borrowData.renewed_count < 3
  const shouldShowButtons = !borrowData.is_returned

  const detailItems = [
    { label: 'Student Name', value: borrowData.student_name },
    { label: 'Book Title', value: borrowData.book_title },
    { label: 'Borrow Date', value: formatDate(borrowData.borrowed_date) },
    { label: 'Due Date', value: formatDate(borrowData.due_date) },
    { label: 'Status', value: borrowData.status },
    { label: 'Times Renewed', value: `${borrowData.renewed_count || 0} of 3` }
  ]

  return (
    <div className="borrow-details-overlay" onClick={onClose}>
      <div className="borrow-details-content" onClick={(e) => e.stopPropagation()}>
        <div className="borrow-details-header">
          <div className="header-content">
            <h2>Borrow Details</h2>
            <span className={`status-tag ${borrowData.status?.toLowerCase()}`}>
              {borrowData.status}
            </span>
          </div>
          <button className="close-button" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="borrow-details-body">
          {detailItems.map(
            ({ label, value }) =>
              value && (
                <div key={label} className="detail-item">
                  <span className="detail-label">{label}</span>
                  <span className="detail-value">{value}</span>
                </div>
              )
          )}
        </div>

        <div className="borrow-details-footer">
          {shouldShowButtons && (
            <>
              <button className="action-button return" onClick={() => onReturn(borrowData.id)}>
                <FaUndo /> Return Book
              </button>

              {isDue && !borrowData.paid && (
                <button className="action-button pay" onClick={() => onPay(borrowData)}>
                  <FaMoneyBill /> Pay Overdue
                </button>
              )}

              {canRenew && (
                <button
                  className="action-button renew"
                  onClick={() => onRenew(borrowData)}
                  disabled={borrowData.paid}
                >
                  <FaUndo /> Renew
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default BorrowDetailsModal
