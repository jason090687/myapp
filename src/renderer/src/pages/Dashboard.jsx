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
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import {
  CardSkeleton,
  ChartSkeleton,
  TableSkeleton,
  BookCardSkeleton
} from '../components/SkeletonLoaders'
import {
  fetchTotalBooksCount,
  fetchDashboardStats,
  fetchAllStudentsWithBorrowCount,
  fetchRecentCheckouts,
  fetchTopBooks,
  fetchNewBooks
} from '../Features/api'

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

function Dashboard() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [yearSelect, setYearSelect] = useState('2023')
  const [totalBooks, setTotalBooks] = useState('Loading...')
  const [borrowedBooks, setBorrowedBooks] = useState('Loading...')
  const [topBorrowers, setTopBorrowers] = useState([])
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: []
  })
  const [recentCheckouts, setRecentCheckouts] = useState([])
  const [isLoading, setIsLoading] = useState(true) // Add this line
  const [activeBookFilter, setActiveBookFilter] = useState('top') // Add this
  const [topBooks, setTopBooks] = useState([]) // Add this
  const [newBooks, setNewBooks] = useState([]) // Add this
  const [isLoadingBooks, setIsLoadingBooks] = useState(true) // Add this
  const { token } = useSelector((state) => state.auth) // Add this line

  const handleSidebarToggle = () => {
    setIsCollapsed(!isCollapsed)
  }

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const stats = await fetchDashboardStats()
        setChartData({
          labels: ['Total Books', 'Borrowed', 'Returned', 'Overdue'],
          datasets: [
            {
              data: [stats.totalBooks, stats.borrowed, stats.returned, stats.overdue],
              borderColor: 'rgb(53, 162, 235)',
              backgroundColor: 'rgba(53, 162, 235, 0.5)',
              tension: 0.4,
              fill: true,
              pointStyle: 'circle',
              pointRadius: 6,
              pointHoverRadius: 8
            }
          ]
        })
        setTotalBooks(stats.totalBooks)
        setBorrowedBooks(stats.borrowed)
      } catch (error) {
        console.error('Error fetching dashboard stats:', error)
      }
    }
    fetchStats()
  }, [])

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const students = await fetchAllStudentsWithBorrowCount()
        setTopBorrowers(students)
      } catch (error) {
        console.error('Error fetching students:', error)
      }
    }
    fetchStudents()
  }, [])

  useEffect(() => {
    const loadRecentCheckouts = async () => {
      setIsLoading(true)
      try {
        const checkouts = await fetchRecentCheckouts(5)
        setRecentCheckouts(checkouts)
      } catch (error) {
        console.error('Error fetching recent checkouts:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadRecentCheckouts()
  }, [])

  useEffect(() => {
    const loadBooks = async () => {
      setIsLoadingBooks(true)
      try {
        const [topData, newData] = await Promise.all([fetchTopBooks(token), fetchNewBooks(token)])

        const formattedTopBooks =
          topData.results?.slice(0, 3).map((book) => ({
            id: book.id,
            title: book.title,
            author: book.author,
            borrow_count: book.borrow_count || 0,
            status: 'top'
          })) || []

        const formattedNewBooks =
          newData.results?.slice(0, 3).map((book) => ({
            id: book.id,
            title: book.title,
            author: book.author,
            date_added: book.date_added,
            status: 'new'
          })) || []

        setTopBooks(formattedTopBooks)
        setNewBooks(formattedNewBooks)
      } catch (error) {
        console.error('Error fetching books:', error)
      } finally {
        setIsLoadingBooks(false)
      }
    }

    if (token) loadBooks()
  }, [token])

  // Add toggle handler
  const handleBookFilterToggle = (filter) => {
    setActiveBookFilter(filter)
  }

  // Add chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top'
      },
      title: {
        display: true,
        text: 'Library Statistics'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          drawBorder: false,
          color: 'rgba(0, 0, 0, 0.1)'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  }

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
          {/* Cards Section */}
          <div className="cards-grid">
            {isLoading
              ? Array(7)
                  .fill(null)
                  .map((_, index) => <CardSkeleton key={index} />)
              : cards.map((card, index) => (
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

          {/* Stats Container */}
          <div className="stats-container">
            <div className="chart">
              {isLoading ? (
                <ChartSkeleton />
              ) : (
                <div className="chart-container" style={{ height: '400px' }}>
                  <Line data={chartData} options={chartOptions} />
                </div>
              )}
            </div>

            <div className="overdue">
              {isLoading ? (
                <TableSkeleton rows={5} />
              ) : (
                <div>
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
              )}
            </div>
          </div>

          {/* Books and Checkouts */}
          <div className="top-books_and_Checkout">
            <div className="recent-checkouts">
              <div className="recent-checkouts-header">
                <h3>Recent Check-out's</h3>
                <div className="view-all">
                  <Link to="/borrowed">View all</Link>
                </div>
              </div>
              {isLoading ? (
                <TableSkeleton rows={5} />
              ) : (
                <table>
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
                    {recentCheckouts.map((checkout) => (
                      <tr key={checkout.id}>
                        <td>{checkout.student_name}</td>
                        <td>{checkout.book_title}</td>
                        <td>{new Date(checkout.date_borrowed).toLocaleDateString()}</td>
                        <td>{new Date(checkout.due_date).toLocaleDateString()}</td>
                        <td>
                          <span className={`status-badge ${checkout.status.toLowerCase()}`}>
                            {checkout.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="top-books">
              <div className="book-filters">
                <button
                  className={`book-filter-btn ${activeBookFilter === 'top' ? 'active' : 'inactive'}`}
                  onClick={() => handleBookFilterToggle('top')}
                >
                  Top Books
                </button>
                <button
                  className={`book-filter-btn ${activeBookFilter === 'new' ? 'active' : 'inactive'}`}
                  onClick={() => handleBookFilterToggle('new')}
                >
                  New Arrivals
                </button>
              </div>
              {isLoadingBooks ? (
                Array(3)
                  .fill(null)
                  .map((_, index) => <BookCardSkeleton key={index} />)
              ) : (
                <div className="books-list">
                  {(activeBookFilter === 'top' ? topBooks : newBooks).map((book) => (
                    <div className="book" key={book.id}>
                      <h4>{book.title}</h4>
                      <p>{book.author}</p>
                      {activeBookFilter === 'top' ? (
                        <span className="status-badge borrowed">
                          {book.borrow_count} times borrowed
                        </span>
                      ) : (
                        <span className="status-badge new">
                          Added {new Date(book.date_added).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  ))}
                  {(activeBookFilter === 'top' ? topBooks : newBooks).length === 0 && (
                    <div className="no-books">No books found</div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
