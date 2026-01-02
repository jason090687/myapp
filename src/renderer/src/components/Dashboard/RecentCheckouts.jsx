import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import { TableSkeleton } from './DashboardSkeletons'
import './RecentCheckouts.css'

const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const RecentCheckouts = ({ recentCheckouts, isLoading }) => {
  return (
    <div className="recent-checkouts-container">
      <div className="recent-checkouts-header">
        <div>
          <h3 className="recent-checkouts-title">Recent Check-outs</h3>
          <p className="recent-checkouts-subtitle">Latest library transactions</p>
        </div>
        <Link to="/borrowed" className="view-all-link">
          View all
        </Link>
      </div>

      {isLoading ? (
        <TableSkeleton rows={5} columns={5} />
      ) : (
        <div className="table-wrapper">
          <table className="checkouts-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Book</th>
                <th>Borrow Date</th>
                <th>Due Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentCheckouts.length > 0 ? (
                recentCheckouts.map((checkout) => (
                  <tr key={checkout.id}>
                    <td>{checkout.student_name || checkout.student || '-'}</td>
                    <td>{checkout.book_title || checkout.book || '-'}</td>
                    <td>{formatDate(checkout.borrowed_date)}</td>
                    <td>{formatDate(checkout.due_date)}</td>
                    <td>
                      <span className={`status-badge ${(checkout.status || '').toLowerCase()}`}>
                        {checkout.status || '-'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="empty-state">
                    No checkouts found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

RecentCheckouts.propTypes = {
  recentCheckouts: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      student_name: PropTypes.string,
      student: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      book_title: PropTypes.string,
      book: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      borrowed_date: PropTypes.string,
      due_date: PropTypes.string,
      status: PropTypes.string
    })
  ).isRequired,
  isLoading: PropTypes.bool.isRequired
}

export default RecentCheckouts
