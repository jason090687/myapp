import { useState, useEffect, useMemo } from 'react'
import Sidebar from '../components/Sidebar'
import { Card } from '../components/ui/card'
import CustomAreaChart from '../components/Dashboard/CustomAreaChart'
import TopBorrowers from '../components/Dashboard/TopBorrowers'
import RecentCheckouts from '../components/Dashboard/RecentCheckouts'
import TopBooks from '../components/Dashboard/TopBooks'
import './Dashboard.css'
import { FaBook, FaBookReader, FaUndo, FaClock, FaUsers, FaMoneyBill } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import {
  useDashboardStats,
  useTopBooks,
  useBorrowedBooksStats,
  useReturnedBooksCount,
  useActiveUsers,
  useMonthlyStudentStats,
  useAllBorrowedRecords,
  useNewArrivals,
  useRecentCheckouts,
  useStudentsWithBorrowCount
} from '../hooks'
import { CardsSkeleton } from '../components/Dashboard/DashboardSkeletons'

function Dashboard() {
  const navigate = useNavigate()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: []
  })
  const [activeBookFilter, setActiveBookFilter] = useState('top')
  const [activeChartTab, setActiveChartTab] = useState('all')
  const [monthlyStatsData, setMonthlyStatsData] = useState([])

  // TanStack Query hooks for data fetching
  const { data: dashboardStats, isLoading: isStatsLoading } = useDashboardStats()
  const { data: topBooksData, isLoading: isTopBooksLoading } = useTopBooks()
  const { data: newBooksData, isLoading: isNewBooksLoading } = useNewArrivals()
  const { data: borrowedStats, isLoading: isBorrowedStatsLoading } = useBorrowedBooksStats()
  const { data: returnedCountData, isLoading: isReturnedLoading } = useReturnedBooksCount()
  const { data: activeUsersData, isLoading: isActiveUsersLoading } = useActiveUsers()
  const { data: monthlyStats, isLoading: isMonthlyStatsLoading } = useMonthlyStudentStats()
  const { data: allBorrowedRecords, isLoading: isAllBorrowedLoading } = useAllBorrowedRecords()
  const { data: recentCheckoutsData, isLoading: isRecentCheckoutsLoading } = useRecentCheckouts(5)
  const { data: topBorrowersData, isLoading: isBorrowersLoading } = useStudentsWithBorrowCount()

  const handleSidebarToggle = () => {
    setIsCollapsed(!isCollapsed)
  }

  // Compute top borrowers from students with borrow count
  const topBorrowers = useMemo(() => {
    if (!topBorrowersData) return []
    return topBorrowersData
      .filter((student) => (student?.borrowed_books_count || 0) >= 5)
      .map((student) => ({
        student_id: student?.id ?? student?.student_id ?? student?.pk ?? student?.id_number,
        student_name:
          student?.name ??
          student?.student_name ??
          `${student?.first_name} ${student?.last_name}` ??
          'Unknown',
        books_borrowed: student?.borrowed_books_count || 0
      }))
      .filter((b) => b.student_id != null)
  }, [topBorrowersData])

  // Process chart data from monthly stats
  useEffect(() => {
    if (monthlyStats && monthlyStats.length > 0) {
      // Store the raw data for PDF export
      setMonthlyStatsData(monthlyStats)

      const labels = monthlyStats.map((stat) => stat.month)
      const processedData = monthlyStats.map((stat) => stat.processed || 0)
      const borrowedData = monthlyStats.map((stat) => stat.borrowed || 0)
      const returnedDataChart = monthlyStats.map((stat) => stat.returned || 0)
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
            data: returnedDataChart,
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
  }, [monthlyStats])

  // Format top books data
  const topBooks = useMemo(() => {
    if (!topBooksData) return []
    return topBooksData
      .map((book) => ({
        id: book.book_id,
        title: book.title,
        author: book.author,
        borrow_count: book.times_borrowed
      }))
      .slice(0, 5)
  }, [topBooksData])

  // New books from API
  const newBooks = newBooksData?.results || newBooksData || []

  // Active users from hook
  const activeUsers = activeUsersData || { total: 0, users: [] }

  // Recent checkouts from hook
  const recentCheckouts = useMemo(() => {
    if (!recentCheckoutsData) return []
    return [...recentCheckoutsData].sort(
      (a, b) => new Date(b.borrowed_date) - new Date(a.borrowed_date)
    )
  }, [recentCheckoutsData])

  // Fee data from all borrowed records
  const getTotalPaidFees = () => {
    if (!allBorrowedRecords) return '0.00'
    return Number(allBorrowedRecords.amount || 0).toFixed(2)
  }

  const getTotalOverdueFees = () => {
    return allBorrowedRecords?.overdue?.length || 0
  }

  const getTotalBorrowedBooks = () => {
    return allBorrowedRecords?.borrowed?.length || 0
  }

  const getTotalReturnedBooks = () => {
    return allBorrowedRecords?.returned?.length || 0
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

  // Compute total books from dashboard stats
  const totalBooks = dashboardStats?.totalBooks || 0
  const borrowedCount = borrowedStats?.borrowed || 0

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
    },
    {
      title: 'Paid Fees',
      value: `₱${getTotalPaidFees()}`,
      icon: FaMoneyBill
    },
    { title: 'Available Books', value: totalBooks - borrowedCount || '0', icon: FaBook }
  ]

  return (
    <div className="app-wrapper">
      <Sidebar isCollapsed={isCollapsed} onToggle={handleSidebarToggle} />
      <div className={`dashboard-container ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="dashboard-content">
          {/* Cards Section */}
          {isStatsLoading || isBorrowedStatsLoading || isReturnedLoading ? (
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
              chartLoading={isMonthlyStatsLoading}
              isLoading={isMonthlyStatsLoading}
              activeTab={activeChartTab}
              onTabChange={handleChartTabChange}
              monthlyStatsData={monthlyStatsData}
            />

            <TopBorrowers topBorrowers={topBorrowers} isLoading={isBorrowersLoading} />


          </div>

          {/* Books and Checkouts */}
          <div className="top-books_and_Checkout">
            <RecentCheckouts
              recentCheckouts={recentCheckouts}
              isLoading={isRecentCheckoutsLoading}
            />

            <TopBooks
              activeBookFilter={activeBookFilter}
              onFilterToggle={handleBookFilterToggle}
              loadingStates={isTopBooksLoading || isNewBooksLoading}
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
