import { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import { Card } from '../components/ui/card'
import DashboardChart from '../components/Dashboard/DashboardChart'
import TopBorrowers from '../components/Dashboard/TopBorrowers'
import RecentCheckouts from '../components/Dashboard/RecentCheckouts'
import TopBooks from '../components/Dashboard/TopBooks'
import './Dashboard.css'
import {
  FaBook,
  FaBookReader,
  FaUndo,
  FaClock,
  FaExclamationTriangle,
  FaUsers,
  FaMoneyBill,
  FaFileDownload
} from 'react-icons/fa'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement // Add this
} from 'chart.js'
import { Bar } from 'react-chartjs-2'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import {
  fetchDashboardStats,
  fetchAllStudentsWithBorrowCount,
  fetchRecentCheckouts,
  fetchTopBooks,
  fetchBorrowedBooksStats,
  fetchNewArrivals, // Add this
  fetchTotalPenalties,
  fetchReturnedBooksCount,
  fetchActiveUsers,
  fetchMonthlyReport,
  fetchMonthlyStudentStats,
  fetchAllStudentsForSearch,
  fetchAllBooks,
  fetchBorrowedBooks,
  fetchAllBorrowedRecords
} from '../Features/api'
import {
  CardsSkeleton,
  ChartSkeleton,
  TableSkeleton,
  BooksSkeleton
} from '../components/Dashboard/DashboardSkeletons'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import MonthSelector from '../components/Dashboard/MonthSelector'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import TopBorrowerMonthSelector from '../components/Dashboard/TopBorrowerMonthSelector'

// Register all required components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement, // Add this
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
)

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
  const [studentMap, setStudentMap] = useState({})
  const [bookMap, setBookMap] = useState({})
  // const [isLoading, setIsLoading] = useState(true) // Add this line
  const [activeBookFilter, setActiveBookFilter] = useState('top') // Add this
  const [topBooks, setTopBooks] = useState([]) // Add this
  const [newBooks, setNewBooks] = useState([]) // Add this
  // const [isLoadingBooks, setIsLoadingBooks] = useState(true) // Add this
  const { token } = useSelector((state) => state.auth) // Add this line
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
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [chartLoading, setChartLoading] = useState(false)
  const [selectedBorrowerMonth, setSelectedBorrowerMonth] = useState(new Date())
  const [penalties, setPenalties] = useState({
    totalPenalties: 0,
    overdueCount: 0
  })
  const [paidFees, setPaidFees] = useState([])
  const [overdueFees, setOverdueFees] = useState([])

  // Helper to check if any section is still loading
  // const isAnyLoading = Object.values(loadingStates).some((state) => state)

  const handleSidebarToggle = () => {
    setIsCollapsed(!isCollapsed)
  }

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString()

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
        const [dashStats, monthlyData, borrowStats, returnedData] = await Promise.all([
          fetchDashboardStats(token),
          fetchMonthlyReport(token),
          fetchBorrowedBooksStats(token),
          fetchReturnedBooksCount(token)
        ])

        // Get current month's data for chart only
        const currentDate = new Date()
        const currentMonthData = monthlyData.find((data) => {
          const [year, month] = data.month.split('-')
          return (
            parseInt(month) === currentDate.getMonth() + 1 &&
            parseInt(year) === currentDate.getFullYear()
          )
        }) || { processed: 0, borrowed: 0, returned: 0, overdue: 0 }

        setChartData({
          labels: ['Processed', 'Borrowed', 'Returned', 'Overdue'],
          datasets: [
            {
              label: `Library Statistics - ${currentDate.toLocaleString('default', { month: 'long' })} ${currentDate.getFullYear()}`,
              data: [
                currentMonthData.processed || 0,
                currentMonthData.borrowed || 0,
                currentMonthData.returned || 0,
                currentMonthData.overdue || 0
              ],
              backgroundColor: [
                'rgba(53, 162, 235, 0.8)', // Blue for Processed
                'rgba(255, 159, 64, 0.8)', // Orange for Borrowed
                'rgba(75, 192, 192, 0.8)', // Green for Returned
                'rgba(255, 99, 132, 0.8)' // Red for Overdue
              ],
              borderColor: [
                'rgb(53, 162, 235)', // Blue border
                'rgb(255, 159, 64)', // Orange border
                'rgb(75, 192, 192)', // Green border
                'rgb(255, 99, 132)' // Red border
              ],
              borderWidth: 1,
              borderRadius: 6
            }
          ]
        })

        setTotalBooks(dashStats.totalBooks)
        setBookStats({
          ...borrowStats,
          borrowed: borrowStats.borrowed || 0,
          returned: returnedData.returnedCount || 0, // Use original returned count
          overdue: penalties.overdueCount || 0 // Use original overdue count
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

  // Fetch student and book mappings
  useEffect(() => {
    if (!token) return

    const fetchMappings = async () => {
      try {
        const [studentsData, booksData, checkouts] = await Promise.all([
          fetchAllStudentsForSearch(token),
          fetchAllBooks(token, ''),
          fetchRecentCheckouts(token, 5)
        ])

        const studentMapping = {}
        studentsData.forEach((student) => {
          studentMapping[student.id] = student.name || 'Unknown'
        })
        setStudentMap(studentMapping)

        const bookMapping = {}
        booksData.results.forEach((book) => {
          bookMapping[book.id] = book.title || 'Unknown'
        })
        setBookMap(bookMapping)

        const sortedCheckouts = checkouts.sort(
          (a, b) => new Date(b.borrowed_date) - new Date(a.borrowed_date)
        )
        setRecentCheckouts(sortedCheckouts)
      } catch (error) {
        console.error('Error fetching mappings:', error)
      } finally {
        setLoadingStates((prev) => ({ ...prev, checkouts: false }))
      }
    }

    fetchMappings()
  }, [token])

  useEffect(() => {
    const loadPaidFees = async () => {
      try {
        const paidFeeData = await fetchAllBorrowedRecords(token)

        setPaidFees(paidFeeData.amount)
        setOverdueFees(paidFeeData.overdue)
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

  // Add toggle handler
  const handleBookFilterToggle = (filter) => {
    setActiveBookFilter(filter)
  }

  // Update chart options to have a single plugins object
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false // Hide the legend
      },
      title: {
        display: true // Hide the title
      },
      tooltip: {
        enabled: false,
        mode: 'index',
        intersect: false,
        titleFont: {
          size: 16
        },
        bodyFont: {
          size: 14
        },
        padding: 12
      },
      datalabels: {
        anchor: 'end',
        align: 'top',
        formatter: (value) => value,
        font: {
          size: 14,
          weight: 'bold'
        },
        padding: 6,
        color: '#333'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          drawBorder: false,
          color: 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          font: {
            size: 14,
            weight: 'bold'
          },
          padding: 8
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 14,
            weight: 'bold'
          },
          padding: 8
        }
      }
    }
  }

  const handleCardClick = (route) => {
    navigate(route)
  }

  const handleMonthChange = async (month, year) => {
    setSelectedDate(new Date(year, month))
    setChartLoading(true)
    try {
      const monthlyData = await fetchMonthlyReport(token)
      const selectedMonthData = monthlyData.find((data) => {
        const [dataYear, dataMonth] = data.month.split('-')
        return parseInt(dataMonth) === month + 1 && parseInt(dataYear) === year
      }) || { processed: 0, borrowed: 0, returned: 0, overdue: 0 }

      const monthString = new Date(year, month).toLocaleString('default', { month: 'long' })

      setChartData({
        labels: ['Processed', 'Borrowed', 'Returned', 'Overdue'],
        datasets: [
          {
            label: `Library Statistics - ${monthString} ${year}`,
            data: [
              selectedMonthData.processed || 0,
              selectedMonthData.borrowed || 0,
              selectedMonthData.returned || 0,
              selectedMonthData.overdue || 0
            ],
            backgroundColor: [
              'rgba(53, 162, 235, 0.8)', // Blue for Processed
              'rgba(255, 159, 64, 0.8)', // Orange for Borrowed
              'rgba(75, 192, 192, 0.8)', // Green for Returned
              'rgba(255, 99, 132, 0.8)' // Red for Overdue
            ],
            borderColor: [
              'rgb(53, 162, 235)', // Blue border
              'rgb(255, 159, 64)', // Orange border
              'rgb(75, 192, 192)', // Green border
              'rgb(255, 99, 132)' // Red border
            ],
            borderWidth: 1,
            borderRadius: 6
          }
        ]
      })
    } catch (error) {
      console.error('Error fetching monthly report:', error)
    } finally {
      setChartLoading(false)
    }
  }

  const generatePDF = async () => {
    try {
      // Create high resolution canvas
      const canvas = document.createElement('canvas')
      const scale = 3 // Increase resolution by 3x
      canvas.width = 1000 // Larger base width for better quality
      canvas.height = 1000
      const ctx = canvas.getContext('2d')

      // Scale the context for higher resolution
      ctx.scale(scale, scale)

      const pdfChart = new ChartJS(ctx, {
        type: 'bar',
        data: chartData,
        options: {
          ...chartOptions,
          animation: false,
          responsive: false,
          devicePixelRatio: scale // Ensure chart renders at high resolution
        }
      })

      const chartImage = canvas.toDataURL('image/png', 1.0) // Maximum quality
      pdfChart.destroy()

      // Create PDF with landscape orientation
      const pdfDoc = await PDFDocument.create()
      const page = pdfDoc.addPage([1000, 800]) // Landscape dimensions
      const { height, width } = page.getSize()
      const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman)

      // Add centered title
      const title = `Monthly Library Report - ${selectedDate.toLocaleString('default', { month: 'long' })} ${selectedDate.getFullYear()}`
      const fontSize = 24
      const titleWidth = timesRomanFont.widthOfTextAtSize(title, fontSize)
      const titleX = (width - titleWidth) / 2 // Center horizontally

      page.drawText(title, {
        x: titleX,
        y: height - 50,
        size: fontSize,
        font: timesRomanFont,
        color: rgb(0.1, 0.1, 0.4)
      })

      // Add chart on the left side
      const pngImage = await pdfDoc.embedPng(chartImage)
      const pngDims = pngImage.scale(0.8)
      page.drawImage(pngImage, {
        x: 50,
        y: height - 450,
        width: width / 2 - 75, // Half width minus padding
        height: 350
      })

      // Helper function to draw table cell
      const drawTableCell = (text, x, y, width, isHeader = false) => {
        page.drawRectangle({
          x,
          y: y - 25,
          width,
          height: 25,
          borderWidth: 1,
          borderColor: rgb(0.8, 0.8, 0.8),
          color: isHeader ? rgb(0.95, 0.95, 0.95) : rgb(1, 1, 1, 0)
        })

        const safeText = text ? text.toString().slice(0, 40) : ''
        page.drawText(safeText, {
          x: x + 10,
          y: y - 18,
          size: isHeader ? 12 : 11,
          font: timesRomanFont,
          color: rgb(0, 0, 0)
        })
      }

      // Draw tables on the right side
      const tableStartX = width / 2 + 25
      const columnWidth = (width / 2 - 75) / 2
      let currentY = height - 100

      // Draw Top Borrowers table
      page.drawText('Top Borrowers', {
        x: tableStartX,
        y: currentY,
        size: 16,
        font: timesRomanFont,
        color: rgb(0.2, 0.2, 0.2)
      })

      currentY -= 40
      drawTableCell('Name', tableStartX, currentY, columnWidth, true)
      drawTableCell('Books Borrowed', tableStartX + columnWidth, currentY, columnWidth, true)

      topBorrowers.slice(0, 5).forEach((borrower) => {
        currentY -= 25
        drawTableCell(borrower.student_name || 'N/A', tableStartX, currentY, columnWidth)
        drawTableCell(
          borrower.books_borrowed || '0',
          tableStartX + columnWidth,
          currentY,
          columnWidth
        )
      })

      // Add spacing
      currentY -= 50

      // Draw Most Borrowed Books table
      page.drawText('Most Borrowed Books', {
        x: tableStartX,
        y: currentY,
        size: 16,
        font: timesRomanFont,
        color: rgb(0.2, 0.2, 0.2)
      })

      currentY -= 40
      drawTableCell('Title', tableStartX, currentY, columnWidth, true)
      drawTableCell('Borrows', tableStartX + columnWidth, currentY, columnWidth, true)

      topBooks.slice(0, 5).forEach((book) => {
        currentY -= 25
        drawTableCell(book.title || 'N/A', tableStartX, currentY, columnWidth)
        drawTableCell(book.borrow_count || '0', tableStartX + columnWidth, currentY, columnWidth)
      })

      // Add footer
      page.drawText(`Generated on: ${new Date().toLocaleDateString()}`, {
        x: 50,
        y: 30,
        size: 10,
        font: timesRomanFont,
        color: rgb(0.5, 0.5, 0.5)
      })

      // Save and download (existing code)
      const pdfBytes = await pdfDoc.save()
      const blob = new Blob([pdfBytes], { type: 'application/pdf' })

      if (window.electron?.ipcRenderer) {
        const buffer = await blob.arrayBuffer()
        window.electron.ipcRenderer.send('save-pdf', {
          buffer: Array.from(new Uint8Array(buffer)),
          fileName: `library-report-${selectedDate.toLocaleString('default', { month: 'long' })}-${selectedDate.getFullYear()}.pdf`
        })
      } else {
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `library-report-${selectedDate.toLocaleString('default', { month: 'long' })}-${selectedDate.getFullYear()}.pdf`
        link.click()
        URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Error generating PDF:', error)
    }
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
      value: `${getTotalOverdueFees()}`, // Updated to use API count
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
<<<<<<< HEAD
      value: `₱${Math.round(penalties.totalPenalties || 0).toLocaleString()}`,
=======
      value: `₱${getTotalPaidFees()}`,
>>>>>>> refs/remotes/origin/main
      icon: FaMoneyBill
    },
    // Add an empty card if needed to maintain grid layout
    { title: 'Available Books', value: totalBooks - bookStats.borrowed || '0', icon: FaBook }
  ]

  // Add this helper function inside the Dashboard component
  // const getDaysAgoText = (daysAgo) => {
  //   if (daysAgo === 0) return 'Added today'
  //   if (daysAgo === 1) return 'Added yesterday'
  //   return `Added ${daysAgo} days ago`
  // }

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
            <DashboardChart
              chartData={chartData}
              chartOptions={chartOptions}
              chartLoading={chartLoading}
              selectedDate={selectedDate}
              onMonthChange={handleMonthChange}
              onGeneratePDF={generatePDF}
              isLoading={loadingStates.chart}
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
              studentMap={studentMap}
              bookMap={bookMap}
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
