import PropTypes from 'prop-types'
import { isOverdue } from '../utils/dateUtils'

const BorrowedTableActions = ({ item, onReturn, onRenew, onOverdue }) => {
  // Add defensive checks
  if (!item || typeof item !== 'object') return null

  const isReturned = item.is_returned || false
  const isPaid = item.paid || false
  const isOverdueStatus = isOverdue(item?.due_date)
  const isOverdueAndNotPaid = !isReturned && !isPaid && isOverdueStatus
  const renewCount = parseInt(item?.renewed_count) || 0

  return (
    <div className="action-buttons-container">
      <button className="action-btn return" disabled={isReturned} onClick={() => onReturn(item.id)}>
        {isReturned ? 'Returned' : 'Return'}
      </button>
      <button
        className="action-btn renew"
        disabled={isReturned || renewCount >= 3}
        onClick={() => onRenew(item)}
      >
        Renew
      </button>
      {isOverdueAndNotPaid && (
        <button className="action-btn overdue" onClick={() => onOverdue(item)}>
          Pay
        </button>
      )}
    </div>
  )
}

BorrowedTableActions.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    is_returned: PropTypes.bool,
    paid: PropTypes.bool,
    due_date: PropTypes.string,
    renewed_count: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  }).isRequired,
  onReturn: PropTypes.func.isRequired,
  onRenew: PropTypes.func.isRequired,
  onOverdue: PropTypes.func.isRequired
}

export default BorrowedTableActions
