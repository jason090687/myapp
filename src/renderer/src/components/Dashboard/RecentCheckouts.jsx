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

const RecentCheckouts = ({ recentCheckouts, isLoading, studentMap = {}, bookMap = {} }) => {
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
                    <td>{studentMap[checkout.student] || checkout.student || '-'}</td>
                    <td>{bookMap[checkout.book] || checkout.book || '-'}</td>
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

export default RecentCheckouts
