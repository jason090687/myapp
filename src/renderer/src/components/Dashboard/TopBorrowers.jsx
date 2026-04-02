import { TableSkeleton } from './DashboardSkeletons'
import { Users } from 'lucide-react'

const TopBorrowers = ({ topBorrowers = [], isLoading }) => {
  const sorted = [...topBorrowers].sort((a, b) => b.books_borrowed - a.books_borrowed)

  return (
    <div className="overdue">
      {isLoading ? (
        <TableSkeleton rows={5} columns={2} />
      ) : (
        <div>
          <div
            className="borrowers-header"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem'
            }}
          >
            <h3>Top Borrowers</h3>
          </div>

          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Books Borrowed</th>
              </tr>
            </thead>
            <tbody>
              {sorted.length === 0 ? (
                <tr>
                  <td colSpan={2}>
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '2.5rem 1rem',
                      gap: '0.5rem',
                      color: '#9ca3af',
                    }}>
                      <Users size={32} strokeWidth={1.5} color="#d1d5db" />
                      <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                        No borrowers found
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#d1d5db' }}>
                        Borrow records will appear here once available
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                sorted.map((borrower) => (
                  <tr key={borrower.student_id}>
                    <td>{borrower.student_name}</td>
                    <td><strong>{borrower.books_borrowed}</strong></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default TopBorrowers