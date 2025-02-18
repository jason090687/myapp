import { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import './Dashboard.css'

function Dashboard() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [yearSelect, setYearSelect] = useState('2023')
  const [totalBooks, setTotalBooks] = useState('Loading...')
  const [borrowedBooks, setBorrowedBooks] = useState('Loading...')

  const handleSidebarToggle = () => {
    setIsCollapsed(!isCollapsed)
  }

  useEffect(() => {
    const fetchTotalBooksCount = async () => {
      try {
        const response = await fetch('https://countmein.pythonanywhere.com/api/v1/marc/search/')
        const data = await response.json()
        setTotalBooks(data.count)
      } catch (error) {
        console.error('Error fetching total books count:', error)
        setTotalBooks('Error')
      }
    }

    fetchTotalBooksCount()
  }, [])

  useEffect(() => {
    // Add your API fetch logic here later
  }, [])

  return (
    <div className="app-wrapper">
      <Sidebar isCollapsed={isCollapsed} onToggle={handleSidebarToggle} />
      <div className={`dashboard-container ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="dashboard-content">
          <div className="cards-grid">
            <div className="card">
              <h3>Total Books</h3>
              <p>{totalBooks}</p>
            </div>
            <div className="card">
              <h3>Borrowed Books</h3>
              <p>10</p>
            </div>
            <div className="card">
              <h3>Returned Books</h3>
              <p>10</p>
            </div>
            <div className="card">
              <h3>Overdue Books</h3>
              <p>20</p>
            </div>
            <div className="card">
              <h3>Missing Books</h3>
              <p>290</p>
            </div>
            <div className="card">
              <h3>Visitors</h3>
              <p>100</p>
            </div>
            <div className="card">
              <h3>Pending Fees</h3>
              <p>₱339</p>
            </div>
          </div>

          <div className="stats-container">
            <div className="chart">
              <div className="chart-header">
                <h3>Check-out Statistics</h3>
                <div className="chart-controls">
                  <select value={yearSelect} onChange={(e) => setYearSelect(e.target.value)}>
                    <option value="2023">2023</option>
                    <option value="2022">2022</option>
                  </select>
                </div>
              </div>
              <div className="chart-container">{/* Add your chart component here */}</div>
            </div>

            <div className="overdue">
              <h3>Overdue History</h3>
              <table>
                <thead>
                  <tr>
                    <th>Member ID</th>
                    <th>Title</th>
                    <th>ISBN</th>
                    <th>Due Date</th>
                    <th>Fine</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>#27362</td>
                    <td>The Quantum Paradox</td>
                    <td>0-123456-47-9</td>
                    <td>5</td>
                    <td>
                      <strong>₱5</strong>
                    </td>
                  </tr>
                  <tr>
                    <td>#32223</td>
                    <td>Beneath the Crimson Sky</td>
                    <td>0-76452641-3</td>
                    <td>5</td>
                    <td>
                      <strong>₱6</strong>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="top-books_and_Checkout">
            <div className="recent-checkouts">
              <h3>Recent Check-out's</h3>
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>ISBN</th>
                    <th>Title</th>
                    <th>Author</th>
                    <th>Member</th>
                    <th>Issued Date</th>
                    <th>Return Date</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>#27362</td>
                    <td>33837</td>
                    <td>Echoes of the Forgotten</td>
                    <td>James Holloway</td>
                    <td>Virella Duskbane</td>
                    <td>2025-01-09</td>
                    <td>2025-01-20</td>
                  </tr>
                </tbody>
              </table>
              <div className="view-all">
                <a href="#">View all</a>
              </div>
            </div>

            <div className="top-books">
              <div>
                <button className="book-filter-btn active">Top Books</button>
                <button className="book-filter-btn inactive">New Arrivals</button>
              </div>

              {[1, 2, 3].map((_, index) => (
                <div className="book" key={index}>
                  <h4>Echoes of the Forgotten</h4>
                  <p>James Holloway</p>
                  <span className="available">Available</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
