import { TableSkeleton } from './DashboardSkeletons'

const TopBorrowers = ({ topBorrowers, isLoading }) => {
  return (
    <div className="overdue">
      {isLoading ? (
        <TableSkeleton rows={5} columns={4} />
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
              {topBorrowers
                .sort((a, b) => b.books_borrowed - a.books_borrowed)
                .map((borrower) => (
                  <tr key={borrower.student_id}>
                    <td>{borrower.student_name}</td>
                    <td>
                      <strong>{borrower.books_borrowed}</strong>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default TopBorrowers
