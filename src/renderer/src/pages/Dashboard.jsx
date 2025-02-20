import { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import './Dashboard.css'
import {
  FaBook,
  FaBookReader,
  FaUndo,
  FaClock,
  FaExclamationTriangle,
  FaUsers,
  FaMoneyBill
} from 'react-icons/fa'

function Dashboard() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [yearSelect, setYearSelect] = useState('2023')
  const [totalBooks, setTotalBooks] = useState('Loading...')
  const [borrowedBooks, setBorrowedBooks] = useState('Loading...')
  const [topBorrowers, setTopBorrowers] = useState([])

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
    const fetchBorrowedBooksCount = async () => {
      try {
        const response = await fetch('https://countmein.pythonanywhere.com/api/v1/borrow/list/')
        const data = await response.json()
        setBorrowedBooks(data.count)
      } catch (error) {
        console.error('Error fetching borrowed books count:', error)
        setBorrowedBooks('Error')
      }
    }

    fetchBorrowedBooksCount()
  }, [])

  useEffect(() => {
    const fetchAllStudents = async () => {
      try {
        // Fetch first page to get total count
        const firstResponse = await fetch('https://countmein.pythonanywhere.com/api/v1/students/')
        const firstData = await firstResponse.json()
        
        const totalPages = Math.ceil(firstData.count / 10) // Assuming 10 items per page
        
        // Create array of promises for all pages
        const pagePromises = Array.from({ length: totalPages }, (_, i) => 
          fetch(`https://countmein.pythonanywhere.com/api/v1/students/?page=${i + 1}`)
            .then(res => res.json())
        )
        
        // Fetch all pages in parallel
        const pages = await Promise.all(pagePromises)
        
        // Combine all results
        const allStudents = pages.flatMap(page => page.results)
        
        // Filter and sort students
        const activeBorrowers = allStudents
          .filter(student => student.borrowed_books_count >= 1)
          .sort((a, b) => b.borrowed_books_count - a.borrowed_books_count)
        
        setTopBorrowers(activeBorrowers)
      } catch (error) {
        console.error('Error fetching all students:', error)
      }
    }

    fetchAllStudents()
  }, [])

  const cards = [
    { title: 'Total Books', value: totalBooks, icon: FaBook },
    { title: 'Borrowed Books', value: borrowedBooks, icon: FaBookReader },
    { title: 'Returned Books', value: '10', icon: FaUndo },
    { title: 'Overdue Books', value: '20', icon: FaClock },
    { title: 'Missing Books', value: '290', icon: FaExclamationTriangle },
    { title: 'Visitors', value: '100', icon: FaUsers },
    { title: 'Pending Fees', value: '₱339', icon: FaMoneyBill }
  ]

  return (
    <div className="app-wrapper">
      <Sidebar isCollapsed={isCollapsed} onToggle={handleSidebarToggle} />
      <div className={`dashboard-container ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="dashboard-content">
          <div className="cards-grid">
            {cards.map((card, index) => (
              <div className="card" key={index}>
                <div className="card-icon">
                  <card.icon />
                </div>
                <div className="card-content">
                  <h3>{card.title}</h3>
                  <p>{card.value}</p>
                </div>
              </div>
            ))}
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
              <h3>Top Borrowers</h3>
              <table>
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Books Borrowed</th>
                  </tr>
                </thead>
                <tbody>
                  {topBorrowers.map((borrower, index) => (
                    <tr key={borrower.id_number}>
                      <td>{borrower.name}</td>
                      <td>
                        <strong>{borrower.borrowed_books_count}</strong>
                      </td>
                    </tr>
                  ))}
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
                    <th>Student</th>
                    <th>Title</th>
                    <th>Call #</th>
                    <th>Acc. #</th>
                    <th>Date Borrowed</th>
                    <th>Due Date</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Virella Duskbane</td>
                    <td>Echoes of the Forgotten</td>
                    <td>808.8 1991</td>
                    <td>889</td>
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
