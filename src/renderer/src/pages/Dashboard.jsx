import { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import { Card } from '../components/ui/card'
import CustomAreaChart from '../components/Dashboard/CustomAreaChart'
import TopBorrowers from '../components/Dashboard/TopBorrowers'
import RecentCheckouts from '../components/Dashboard/RecentCheckouts'
import TopBooks from '../components/Dashboard/TopBooks'
import './Dashboard.css'
import { FaBook, FaBookReader, FaUndo, FaClock, FaUsers, FaMoneyBill } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import {
  fetchDashboardStats,
  fetchTopBooks,
  fetchBorrowedBooksStats,
  fetchReturnedBooksCount,
  fetchActiveUsers,
  fetchMonthlyStudentStats,
  fetchAllBorrowedRecords,
  fetchNewArrivals,
  fetchRecentCheckouts,
  fetchStudents
} from '../Features/api'
import { CardsSkeleton } from '../components/Dashboard/DashboardSkeletons'

function Dashboard() {
  const navigate = useNavigate()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [totalBooks, setTotalBooks] = useState([])
  const [topBorrowers, setTopBorrowers] = useState([])
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: []
  })
  const [recentCheckouts, setRecentCheckouts] = useState([])
  const [activeBookFilter, setActiveBookFilter] = useState('top')
  const [activeChartTab, setActiveChartTab] = useState('all')
  const [topBooks, setTopBooks] = useState([])
  const [newBooks, setNewBooks] = useState([])
  const { token } = useSelector((state) => state.auth)
  const [bookStats, setBookStats] = useState({
    borrowed: 0,
    returned: 0,
    overdue: 0,
    pending: 0,
    pendingFees: 0
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
  const [activeUsers, setActiveUsers] = useState({
    total: 0,
    users: []
  })
  const [chartLoading, setChartLoading] = useState(false)
  const [paidFees, setPaidFees] = useState([])
  const [overdueFees, setOverdueFees] = useState([])
  const [borrowedBooks, setBorrowedBooks] = useState([])
  const [returnBooks, setReturnBooks] = useState([])
  const [monthlyStatsData, setMonthlyStatsData] = useState([])

  const handleSidebarToggle = () => {
    setIsCollapsed(!isCollapsed)
  }

  useEffect(() => {
    const loadTopBorrower = async () => {
      try {
        const response = await fetchStudents(token)

        // filter if borrowed_books_count >= 5 then display in the top borrowers
        const borrowers = (response || [])
          .filter((student) => (student?.borrowed_books_count || 0) >= 5)
          .map((student) => ({
            student_id: student?.id ?? student?.student_id ?? student?.pk ?? student?.id_number,
            student_name: student?.name ?? student?.student_name ?? 'Unknown',
            books_borrowed: student?.borrowed_books_count || 0
          }))
          .filter((b) => b.student_id != null)

        setTopBorrowers(borrowers)
      } catch (error) {
        console.error('Error fetching top borrowers:', error)
        setTopBorrowers([])
      } finally {
        setLoadingStates((prev) => ({ ...prev, borrowers: false }))
      }
    }
    loadTopBorrower()
  }, [token])

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [dashStats, borrowStats, returnedData, monthlyStats] = await Promise.all([
          fetchDashboardStats(token),
          fetchBorrowedBooksStats(token),
          fetchReturnedBooksCount(token),
          fetchMonthlyStudentStats(token)
        ])

        // Use monthly stats data for the chart
        if (monthlyStats && monthlyStats.length > 0) {
          // Store the raw data for PDF export
          setMonthlyStatsData(monthlyStats)

          const labels = monthlyStats.map((stat) => stat.month)
          const processedData = monthlyStats.map((stat) => stat.processed || 0)
          const borrowedData = monthlyStats.map((stat) => stat.borrowed || 0)
          const returnedData = monthlyStats.map((stat) => stat.returned || 0)
          const overdueData = monthlyStats.map((stat) => stat.overdue || 0)

          setChartData({
            labels: labels,
            datasets: [
              {
                label: 'Processed',
                data: processedData,
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.2)',
                fill: true
              },
              {
                label: 'Borrowed',
                data: borrowedData,
                borderColor: 'rgb(10, 11, 100)',
                backgroundColor: 'rgba(10, 11, 100, 0.2)',
                fill: true
              },
              {
                label: 'Returned',
                data: returnedData,
                borderColor: 'rgb(16, 185, 129)',
                backgroundColor: 'rgba(16, 185, 129, 0.2)',
                fill: true
              },
              {
                label: 'Overdue',
                data: overdueData,
                borderColor: 'rgb(239, 68, 68)',
                backgroundColor: 'rgba(239, 68, 68, 0.2)',
                fill: true
              }
            ]
          })
        } else {
          // Fallback to empty chart if no data
          setChartData({
            labels: [],
            datasets: []
          })
        }

        setTotalBooks(dashStats.totalBooks)
        setBookStats({
          ...borrowStats,
          borrowed: borrowStats.borrowed || 0,
          returned: returnedData.returnedCount || 0,
          overdue: borrowStats.overdue || 0
        })
        setReturnedStats({
          returnedCount: returnedData.returnedCount || 0 // Keep original returned count
        })
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setLoadingStates((prev) => ({ ...prev, cards: false, chart: false }))
      }
    }

    const fetchInitialData = async () => {
      if (token) {
        fetchStats()
        const currentDate = new Date()
        fetchStudents(currentDate.getMonth(), currentDate.getFullYear())
        loadBooks()
      }
    }

    const loadBooks = async () => {
      try {
        const [topData, newArrivalsData] = await Promise.all([
          fetchTopBooks(token),
          fetchNewArrivals(token)
        ])

        const formattedTopBooks = topData
          .map((book) => ({
            id: book.book_id,
            title: book.title,
            author: book.author,
            borrow_count: book.times_borrowed
          }))
          .slice(0, 5)

        setTopBooks(formattedTopBooks)
        // newArrivalsData is already the array of books from the API
        setNewBooks(newArrivalsData || [])
      } catch (error) {
        console.error('Error loading books:', error)
        setTopBooks([])
        setNewBooks([])
      } finally {
        setLoadingStates((prev) => ({ ...prev, books: false }))
      }
    }

    fetchInitialData()
  }, [token]) // Add penalties.overdueCount as dependency

  // Add new useEffect for fetching active users
  useEffect(() => {
    const fetchUsers = async () => {
      if (!token) return
      try {
        const userData = await fetchActiveUsers(token)
        setActiveUsers(userData)
      } catch (error) {
        console.error('Error fetching active users:', error)
        setActiveUsers({ total: 0, users: [] })
      }
    }
    fetchUsers()
  }, [token])

  useEffect(() => {
    const loadRecentCheckouts = async () => {
      if (!token) return
      try {
        const checkouts = await fetchRecentCheckouts(token, 5)
        const sortedCheckouts = checkouts.sort(
          (a, b) => new Date(b.borrowed_date) - new Date(a.borrowed_date)
        )
        setRecentCheckouts(sortedCheckouts)
      } catch (error) {
        console.error('Error fetching recent checkouts:', error)
        setRecentCheckouts([])
      } finally {
        setLoadingStates((prev) => ({ ...prev, checkouts: false }))
      }
    }
    loadRecentCheckouts()
  }, [token])

  useEffect(() => {
    const loadPaidFees = async () => {
      try {
        const paidFeeData = await fetchAllBorrowedRecords(token)

        setPaidFees(paidFeeData.amount)
        setOverdueFees(paidFeeData.overdue)
        setBorrowedBooks(paidFeeData.borrowed)
        setReturnBooks(paidFeeData.returned)
      } catch (error) {
        console.error('Error fetching paid fees:', error)
        setPaidFees(0)
      }
    }

    loadPaidFees()
  }, [token])

  const getTotalPaidFees = () => {
    return Number(paidFees || 0).toFixed(2)
  }

  const getTotalOverdueFees = () => {
    return overdueFees.length || 0
  }

  const getTotalBorrowedBooks = () => {
    return borrowedBooks.length || 0
  }

  const getTotalReturnedBooks = () => {
    return returnBooks.length || 0
  }

  // Add toggle handler
  const handleBookFilterToggle = (filter) => {
    setActiveBookFilter(filter)
  }

  const handleChartTabChange = (tab) => {
    setActiveChartTab(tab)
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
      value: `${getTotalBorrowedBooks()}`,
      icon: FaBookReader,
      route: '/borrowed',
      clickable: true
    },
    {
      title: 'Returned Books',
      value: `${getTotalReturnedBooks()}`,
      icon: FaUndo
    },
    {
      title: 'Overdue Books',
      value: `${getTotalOverdueFees()}`,
      icon: FaClock
    },
    {
      title: 'Active Users',
      value: activeUsers.total || '0',
      icon: FaUsers,
      tooltip: 'Total number of active users'
    }, // Updated title
    {
      title: 'Paid Fees',
      value: `₱${getTotalPaidFees()}`,
      icon: FaMoneyBill
    },
    { title: 'Available Books', value: totalBooks - bookStats.borrowed || '0', icon: FaBook }
  ]

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
                <Card
                  key={index}
                  icon={card.icon}
                  title={card.title}
                  value={card.value}
                  clickable={card.clickable}
                  onClick={() => card.clickable && handleCardClick(card.route)}
                />
              ))}
            </div>
          )}
          {/* Add ReportGenerator at the top of the dashboard */}

          {/* Stats Container */}
          <div className="stats-container">
            <CustomAreaChart
              chartData={chartData}
              chartLoading={chartLoading}
              isLoading={loadingStates.chart}
              activeTab={activeChartTab}
              onTabChange={handleChartTabChange}
              monthlyStatsData={monthlyStatsData}
            />

            <TopBorrowers topBorrowers={topBorrowers} isLoading={loadingStates.borrowers} />
          </div>

          {/* Books and Checkouts */}
          <div className="top-books_and_Checkout">
            <RecentCheckouts
              recentCheckouts={recentCheckouts}
              isLoading={loadingStates.checkouts}
            />

            <TopBooks
              activeBookFilter={activeBookFilter}
              onFilterToggle={handleBookFilterToggle}
              loadingStates={loadingStates.books}
              topBooks={topBooks}
              newBooks={newBooks}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
