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
import { Link, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import {
  fetchDashboardStats,
  fetchAllStudentsWithBorrowCount,
  fetchRecentCheckouts,
  fetchTopBooks,
  fetchBorrowedBooksStats,
  fetchMarcBooks,
  fetchTotalPenalties,
  fetchReturnedBooksCount
} from '../Features/api'
import {
  CardsSkeleton,
  ChartSkeleton,
  TableSkeleton,
  BooksSkeleton
} from '../components/Dashboard/DashboardSkeletons'
import ReportGenerator from '../components/Dashboard/ReportGenerator'

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

function Dashboard() {
  const navigate = useNavigate()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [totalBooks, setTotalBooks] = useState('Loading...')
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
  const [bookStats, setBookStats] = useState({
    borrowed: 0,
    returned: 0,
    overdue: 0,
    pending: 0,
    pendingFees: 0
  })
  const [penalties, setPenalties] = useState({
    totalPenalties: 0,
    overdueCount: 0
  })
  const [returnedStats, setReturnedStats] = useState({
    returnedCount: 0
  })
  const [loadingStates, setLoadingStates] = useState({
    cards: true,
    chart: true,
    borrowers: true,
    checkouts: true,
    books: true
  })

  // Helper to check if any section is still loading
  const isAnyLoading = Object.values(loadingStates).some((state) => state)

  const handleSidebarToggle = () => {
    setIsCollapsed(!isCollapsed)
  }

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString()

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [dashStats, borrowStats, returnedData] = await Promise.all([
          fetchDashboardStats(),
          fetchBorrowedBooksStats(),
          fetchReturnedBooksCount(token)
        ])

        setChartData({
          labels: ['Total Books', 'Borrowed', 'Returned', 'Overdue'],
          datasets: [
            {
              label: 'Library Statistics',
              data: [
                dashStats.totalBooks || 0,
                borrowStats.borrowed || 0,
                returnedData.returnedCount || 0,
                penalties.overdueCount || 0
              ],
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

        setTotalBooks(dashStats.totalBooks)
        setBookStats(borrowStats)
        setReturnedBooks(returnedResponse.returned_books_count)
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setLoadingStates((prev) => ({ ...prev, cards: false, chart: false }))
      }
    }

    const fetchStudents = async () => {
      try {
        const students = await fetchAllStudentsWithBorrowCount()
        setTopBorrowers(students)
      } catch (error) {
        console.error('Error fetching students:', error)
      } finally {
        setLoadingStates((prev) => ({ ...prev, borrowers: false }))
      }
    }

    const loadRecentCheckouts = async () => {
      try {
        const checkouts = await fetchRecentCheckouts(5)
        // Sort checkouts by borrowed_date in descending order (newest first)
        const sortedCheckouts = checkouts.sort(
          (a, b) => new Date(b.borrowed_date) - new Date(a.borrowed_date)
        )
        setRecentCheckouts(sortedCheckouts)
      } catch (error) {
        console.error('Error fetching recent checkouts:', error)
      } finally {
        setLoadingStates((prev) => ({ ...prev, checkouts: false }))
      }
    }

    const loadBooks = async () => {
      try {
        const [topData, marcData] = await Promise.all([fetchTopBooks(token), fetchMarcBooks(token)])

        // topData is now directly the array of top books
        const formattedTopBooks = topData
          .map((book) => ({
            id: book.book_id,
            title: book.title,
            author: book.author,
            borrow_count: book.times_borrowed
          }))
          .slice(0, 5)

        setTopBooks(formattedTopBooks)
        setNewBooks(marcData.results)
      } catch (error) {
        console.error('Error loading books:', error)
        setTopBooks([])
        setNewBooks([])
      } finally {
        setLoadingStates((prev) => ({ ...prev, books: false }))
      }
    }

    if (token) {
      fetchStats()
      fetchStudents()
      loadRecentCheckouts()
      loadBooks()
    }
  }, [token, penalties.overdueCount]) // Add penalties.overdueCount as dependency

  // Add new useEffect for fetching penalties
  useEffect(() => {
    const fetchPenalties = async () => {
      if (!token) return
      try {
        const penaltiesData = await fetchTotalPenalties(token)
        setPenalties({
          totalPenalties: penaltiesData.totalPenalties,
          overdueCount: penaltiesData.overdueCount
        })
      } catch (error) {
        console.error('Error fetching penalties:', error)
      }
    }
    fetchPenalties()
  }, [token])

  // Add new useEffect for fetching returned books count
  useEffect(() => {
    const fetchReturnedCount = async () => {
      if (!token) return
      try {
        const returnedData = await fetchReturnedBooksCount(token)
        setReturnedStats(returnedData)
      } catch (error) {
        console.error('Error fetching returned books count:', error)
      }
    }
    fetchReturnedCount()
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

  const handleCardClick = (route) => {
    navigate(route)
  }

  const cards = [
    {
      title: 'Total Books',
      value: totalBooks,
      icon: FaBook,
      route: '/books',
      clickable: true
    },
    {
      title: 'Borrowed Books',
      value: bookStats.borrowed || '0',
      icon: FaBookReader,
      route: '/borrowed',
      clickable: true
    },
    {
      title: 'Returned Books',
      value: returnedStats.returnedCount || '0',
      icon: FaUndo
    },
    {
      title: 'Overdue Books',
      value: penalties.overdueCount || '0', // Updated to use API count
      icon: FaClock
    },
    { title: 'Active Users', value: topBorrowers.length || '0', icon: FaUsers }, // Updated title
    {
      title: 'Pending Fees',
      value: `₱${Math.round(penalties.totalPenalties || 0).toLocaleString()}`,
      icon: FaMoneyBill
    },
    // Add an empty card if needed to maintain grid layout
    { title: 'Available Books', value: totalBooks - bookStats.borrowed || '0', icon: FaBook }
  ]

  // Add this helper function inside the Dashboard component
  const getDaysAgoText = (daysAgo) => {
    if (daysAgo === 0) return 'Added today'
    if (daysAgo === 1) return 'Added yesterday'
    return `Added ${daysAgo} days ago`
  }

  return (
    <div className="app-wrapper">
      <Sidebar isCollapsed={isCollapsed} onToggle={handleSidebarToggle} />
      <div className={`dashboard-container ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="dashboard-content">
          {/* Cards Section */}
          {loadingStates.cards ? (
            <CardsSkeleton />
          ) : (
            <div className="cards-grid">
              {cards.map((card, index) => (
                <div
                  className={`card ${card.clickable ? 'clickable' : ''}`}
                  key={index}
                  onClick={() => card.clickable && handleCardClick(card.route)}
                  style={{ cursor: card.clickable ? 'pointer' : 'default' }}
                >
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
          )}
          {/* Add ReportGenerator at the top of the dashboard */}
          <ReportGenerator
            borrowData={recentCheckouts}
            returnData={returnedStats}
            overdueData={penalties}
          />

          {/* Stats Container */}
          <div className="stats-container">
            <div className="chart">
              {loadingStates.chart ? (
                <ChartSkeleton />
              ) : (
                <div className="chart-container" style={{ height: '400px' }}>
                  <Line data={chartData} options={chartOptions} />
                </div>
              )}
            </div>

            <div className="overdue">
              {loadingStates.borrowers ? (
                <TableSkeleton rows={5} columns={4} />
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
              {loadingStates.checkouts ? (
                <TableSkeleton rows={5} columns={4} />
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
                        <td>{formatDate(checkout.borrowed_date)}</td>
                        <td>{formatDate(checkout.due_date)}</td>
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
              {loadingStates.books ? (
                <BooksSkeleton count={3} />
              ) : (
                <div className="books-list">
                  {activeBookFilter === 'new' ? (
                    newBooks.length > 0 ? (
                      newBooks.map((book) => (
                        <div className="book-title-card" key={book.id}>
                          <span className="new-badge">NEW</span>
                          <h4>{book.title}</h4>
                          <p className="book-author">{book.author}</p>
                          {book.callNumber && (
                            <small className="call-number">Call Number: {book.callNumber}</small>
                          )}
                          <small className="days-ago">{getDaysAgoText(book.daysAgo)}</small>
                        </div>
                      ))
                    ) : (
                      <div className="no-books">No new books in the last 5 days</div>
                    )
                  ) : (
                    topBooks.map((book) => (
                      <div className="book" key={book.id}>
                        <h4>{book.title}</h4>
                        <p className="book-author">by {book.author || 'Unknown Author'}</p>
                        <div className="borrow-count">
                          <FaBookReader className="borrow-icon" />
                          <span>{book.borrow_count} Borrows</span>
                        </div>
                      </div>
                    ))
                  )}
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
