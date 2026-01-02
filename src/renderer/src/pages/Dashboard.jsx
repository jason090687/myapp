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
  fetchRecentCheckouts
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
  const [selectedBorrowerMonth, setSelectedBorrowerMonth] = useState(new Date())
  const [penalties, setPenalties] = useState({
    totalPenalties: 0,
    overdueCount: 0
  })
  const [paidFees, setPaidFees] = useState([])
  const [overdueFees, setOverdueFees] = useState([])
  const [borrowedBooks, setBorrowedBooks] = useState([])
  const [returnBooks, setReturnBooks] = useState([])

  const handleSidebarToggle = () => {
    setIsCollapsed(!isCollapsed)
  }

  // Move fetchStudents outside useEffect and make it a component method
  const fetchStudents = async (month, year) => {
    try {
      const date = new Date(year, month)
      const monthString = date.toLocaleString('default', {
        month: 'long',
        year: 'numeric'
      })

      const stats = await fetchMonthlyStudentStats(token)
      const monthlyStats = stats.find((stat) => stat.month === monthString)

      if (monthlyStats) {
        setTopBorrowers(
          monthlyStats.students.map((student) => ({
            student_id: student.student_id,
            student_name: student.student_name,
            books_borrowed: student.books_borrowed
          }))
        )
      } else {
        setTopBorrowers([])
      }
    } catch (error) {
      console.error('Error fetching students:', error)
      setTopBorrowers([])
    } finally {
      setLoadingStates((prev) => ({ ...prev, borrowers: false }))
    }
  }

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [dashStats, borrowStats, returnedData] = await Promise.all([
          fetchDashboardStats(token),
          fetchBorrowedBooksStats(token),
          fetchReturnedBooksCount(token)
        ])

        // Create simple chart data with current stats
        const currentDate = new Date()
        const processedDate = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          1
        ).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        const borrowedDate = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          7
        ).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        const returnDate = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          14
        ).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        const dueDate = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          21
        ).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

        setChartData({
          labels: [processedDate, borrowedDate, returnDate, dueDate],
          datasets: [
            {
              label: 'Processed',
              data: [dashStats?.total_books || 0, null, null, null],
              borderColor: 'rgb(59, 130, 246)',
              backgroundColor: 'rgba(59, 130, 246, 0.2)',
              fill: true
            },
            {
              label: 'Borrowed',
              data: [null, borrowStats.borrowed || 0, null, null],
              borderColor: 'rgb(10, 11, 100)',
              backgroundColor: 'rgba(10, 11, 100, 0.2)',
              fill: true
            },
            {
              label: 'Returned',
              data: [null, null, returnedData.returnedCount || 0, null],
              borderColor: 'rgb(16, 185, 129)',
              backgroundColor: 'rgba(16, 185, 129, 0.2)',
              fill: true
            },
            {
              label: 'Overdue',
              data: [null, null, null, borrowStats.overdue || 0],
              borderColor: 'rgb(239, 68, 68)',
              backgroundColor: 'rgba(239, 68, 68, 0.2)',
              fill: true
            }
          ]
        })

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

  const handleBorrowerMonthChange = (month, year) => {
    setSelectedBorrowerMonth(new Date(year, month))
    fetchStudents(month, year) // Now this will work because fetchStudents is in scope
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
            />

            <TopBorrowers
              topBorrowers={topBorrowers}
              selectedBorrowerMonth={selectedBorrowerMonth}
              onMonthChange={handleBorrowerMonthChange}
              isLoading={loadingStates.borrowers}
            />
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
