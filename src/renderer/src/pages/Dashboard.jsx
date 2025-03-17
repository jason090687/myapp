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
  fetchMarcBooks,
  fetchTotalPenalties,
  fetchReturnedBooksCount,
  fetchActiveUsers,
  fetchMonthlyReport
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
  const [activeUsers, setActiveUsers] = useState({
    total: 0,
    users: []
  })
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [chartLoading, setChartLoading] = useState(false)

  // Helper to check if any section is still loading
  const isAnyLoading = Object.values(loadingStates).some((state) => state)

  const handleSidebarToggle = () => {
    setIsCollapsed(!isCollapsed)
  }

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString()

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [dashStats, monthlyData, borrowStats, returnedData] = await Promise.all([
          fetchDashboardStats(),
          fetchMonthlyReport(token),
          fetchBorrowedBooksStats(),
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
                'rgba(53, 162, 235, 0.8)',   // Blue for Processed
                'rgba(255, 159, 64, 0.8)',   // Orange for Borrowed
                'rgba(75, 192, 192, 0.8)',   // Green for Returned
                'rgba(255, 99, 132, 0.8)'    // Red for Overdue
              ],
              borderColor: [
                'rgb(53, 162, 235)',         // Blue border
                'rgb(255, 159, 64)',         // Orange border
                'rgb(75, 192, 192)',         // Green border
                'rgb(255, 99, 132)'          // Red border
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
        enabled: true,
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
              'rgba(53, 162, 235, 0.8)',   // Blue for Processed
              'rgba(255, 159, 64, 0.8)',   // Orange for Borrowed
              'rgba(75, 192, 192, 0.8)',   // Green for Returned
              'rgba(255, 99, 132, 0.8)'    // Red for Overdue
            ],
            borderColor: [
              'rgb(53, 162, 235)',         // Blue border
              'rgb(255, 159, 64)',         // Orange border
              'rgb(75, 192, 192)',         // Green border
              'rgb(255, 99, 132)'          // Red border
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
          devicePixelRatio: scale, // Ensure chart renders at high resolution
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

        page.drawText(text.toString().slice(0, 40), {
          // Limit text length
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
        drawTableCell(borrower.name, tableStartX, currentY, columnWidth)
        drawTableCell(
          borrower.borrowed_books_count,
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
        drawTableCell(book.title, tableStartX, currentY, columnWidth)
        drawTableCell(book.borrow_count, tableStartX + columnWidth, currentY, columnWidth)
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
    {
      title: 'Active Users',
      value: activeUsers.total || '0',
      icon: FaUsers,
      tooltip: 'Total number of active users'
    }, // Updated title
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

          {/* Stats Container */}
          <div className="stats-container">
            <div className="chart">
              {loadingStates.chart ? (
                <ChartSkeleton />
              ) : (
                <>
                  <div className="chart-header">
                    <MonthSelector
                      currentMonth={selectedDate.getMonth()}
                      currentYear={selectedDate.getFullYear()}
                      onMonthChange={handleMonthChange}
                    />
                    <button
                      className="generate-report-btn"
                      onClick={generatePDF}
                      disabled={chartLoading}
                    >
                      <FaFileDownload />
                      Generate Report
                    </button>
                  </div>
                  <div className="chart-container" style={{ height: '400px' }}>
                    {chartLoading ? (
                      <div className="chart-loading-overlay">
                        <div className="loading-spinner"></div>
                        <p>Loading data...</p>
                      </div>
                    ) : (
                      <Bar data={chartData} options={chartOptions} plugins={[ChartDataLabels]} />
                    )}
                  </div>
                </>
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
