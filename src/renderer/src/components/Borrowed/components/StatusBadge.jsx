import PropTypes from 'prop-types'
import { getStatusBadgeClass, getStatusText } from '../utils/statusUtils'

const StatusBadge = ({ item }) => {
  if (!item || typeof item !== 'object') return null

  return (
    <div className="status-badge-container">
      <span className={`status-badge ${getStatusBadgeClass(item)}`}>{getStatusText(item)}</span>
    </div>
  )
}

StatusBadge.propTypes = {
  item: PropTypes.shape({
    is_returned: PropTypes.bool,
    paid: PropTypes.bool,
    due_date: PropTypes.string
  }).isRequired
}

export default StatusBadge
