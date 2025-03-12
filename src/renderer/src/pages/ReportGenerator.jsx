import React, { useState, useEffect } from 'react'
import { FaFileDownload, FaCalendar } from 'react-icons/fa'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import { useSelector } from 'react-redux'
import axios from 'axios'
import '../components/Dashboard/ReportGenerator.css'

const ReportGenerator = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState(null)

  // Get token from Redux store
  const token = useSelector((state) => state.auth.token)

  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ]

  const fetchAllBorrowedData = async () => {
    try {
      let allData = []
      let nextPage = 'http://countmein.pythonanywhere.com/api/v1/borrow/list/'

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }

      while (nextPage) {
        const response = await axios.get(nextPage, config)
        if (response.data?.results) {
          allData = [...allData, ...response.data.results]
          nextPage = response.data.next
        } else {
          break
        }
      }

      return allData
    } catch (error) {
      setError('Failed to fetch data: ' + error.message)
      console.error('Error fetching data:', error)
      return []
    }
  }

  const calculateWeekNumber = (date) => {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1)
    return Math.ceil((date.getDate() + firstDay.getDay()) / 7)
  }

  const organizeDataByWeeks = (data) => {
    const weeklyData = {
      borrowed: Array(5).fill(0), // Using 5 weeks to account for longer months
      returned: Array(5).fill(0),
      overdue: Array(5).fill(0)
    }

    const currentDate = new Date()

    data.forEach((item) => {
      const borrowDate = new Date(item.borrowed_date)

      if (borrowDate.getMonth() === selectedMonth && borrowDate.getFullYear() === selectedYear) {
        const weekNum = calculateWeekNumber(borrowDate) - 1
        if (weekNum >= 0 && weekNum < 5) {
          weeklyData.borrowed[weekNum]++
        }

        // Check if item is overdue
        if (!item.is_returned && borrowDate < currentDate) {
          weeklyData.overdue[weekNum]++
        }
      }

      if (item.returned_date) {
        const returnDate = new Date(item.returned_date)
        if (returnDate.getMonth() === selectedMonth && returnDate.getFullYear() === selectedYear) {
          const weekNum = calculateWeekNumber(returnDate) - 1
          if (weekNum >= 0 && weekNum < 5) {
            weeklyData.returned[weekNum]++
          }
        }
      }
    })

    return weeklyData
  }

  const generatePDF = async () => {
    setIsGenerating(true)
    setError(null)

    try {
      const allBorrowedData = await fetchAllBorrowedData()
      const weeklyStats = organizeDataByWeeks(allBorrowedData)

      const pdfDoc = await PDFDocument.create()
      const page = pdfDoc.addPage([800, 1000])
      const { height } = page.getSize()

      // ... rest of PDF generation code remains the same ...
      // ...existing code...

      const pdfBytes = await pdfDoc.save()
      const blob = new Blob([pdfBytes], { type: 'application/pdf' })

      if (window.electron?.ipcRenderer) {
        const buffer = await blob.arrayBuffer()
        const fileName = `library-report-${months[selectedMonth]}-${selectedYear}.pdf`
        window.electron.ipcRenderer.send('save-pdf', {
          buffer: Array.from(new Uint8Array(buffer)),
          fileName
        })
      } else {
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `library-report-${months[selectedMonth]}-${selectedYear}.pdf`
        link.click()
        URL.revokeObjectURL(url)
      }
    } catch (error) {
      setError('Failed to generate report: ' + error.message)
      console.error('Error generating PDF:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="report-generator">
      {error && <div className="error-message">{error}</div>}
      <div className="report-controls">
        <div className="date-selector">
          <FaCalendar />
          <select value={selectedMonth} onChange={(e) => setSelectedMonth(Number(e.target.value))}>
            {months.map((month, index) => (
              <option key={index} value={index}>
                {month}
              </option>
            ))}
          </select>
          <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))}>
            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
        <button className="generate-report-btn" onClick={generatePDF} disabled={isGenerating}>
          <FaFileDownload />
          {isGenerating ? 'Generating...' : 'Generate Report'}
        </button>
      </div>
    </div>
  )
}

export default ReportGenerator
