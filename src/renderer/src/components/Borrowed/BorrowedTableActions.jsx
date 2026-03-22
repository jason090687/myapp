import { RotateCcw, RefreshCw, AlertCircle } from 'lucide-react'

const ActionButtons = ({
  item,
  handleReturnBook,
  handleRenewClick,
  handleOverdueClick,
  isOverdue
}) => {
  return (
    <div className="action-buttons-container">
      <button
        className="action-btn return"
        disabled={item.is_returned}
        onClick={() => handleReturnBook(item.id)}
        title={item.is_returned ? 'Already Returned' : 'Return Book'}
      >
        <RotateCcw size={20} />
      </button>

      <button
        className="action-btn renew"
        disabled={item.is_returned || item.renewed_count >= 3}
        onClick={() => handleRenewClick(item)}
        title={item.renewed_count >= 3 ? 'Renewal Limit Reached' : 'Renew Book'}
      >
        <RefreshCw size={20} />
      </button>

      <button
        className="action-btn overdue"
        disabled={!isOverdue(item.due_date) || item.is_returned || item.paid}
        onClick={() => handleOverdueClick(item)}
        title={
          !isOverdue(item.due_date)
            ? 'Not Overdue'
            : item.is_returned
              ? 'Already Returned'
              : item.paid
                ? 'Fine Already Paid'
                : 'Pay Overdue Fine'
        }
      >
        <AlertCircle size={20} />
      </button>
    </div>
  )
}

export default ActionButtons
