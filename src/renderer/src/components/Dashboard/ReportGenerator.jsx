import React, { useState, useEffect } from 'react'
import { FaFileDownload, FaCalendar } from 'react-icons/fa'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import { useSelector } from 'react-redux'
import axios from 'axios'
import './ReportGenerator.css'

const ReportGenerator = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [isGenerating, setIsGenerating] = useState(false)

  const { token } = useSelector((state) => state.auth.token)

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

      while (nextPage) {
        const response = await axios.get(nextPage, {
          headers: { Authorization: `Bearer ${token}` }
        })
        allData = [...allData, ...response.data.results]
        nextPage = response.data.next
      }

      return allData
    } catch (error) {
      console.error('Error fetching all borrowed data:', error)
      return []
    }
  }

  const organizeDataByWeeks = (data) => {
    const weeklyData = {
      borrowed: Array(4).fill(0),
      returned: Array(4).fill(0)
    }

    data.forEach((item) => {
      const borrowDate = new Date(item.borrowed_date)
      // Convert to local timezone
      const localBorrowDate = new Date(
        borrowDate.getTime() - borrowDate.getTimezoneOffset() * 60000
      )

      if (
        localBorrowDate.getMonth() === selectedMonth &&
        localBorrowDate.getFullYear() === selectedYear
      ) {
        const weekIndex = Math.min(Math.floor((localBorrowDate.getDate() - 1) / 7), 3)

        if (!item.is_returned) {
          weeklyData.borrowed[weekIndex]++
        }
      }

      // Check returned books
      if (item.returned_date) {
        const returnDate = new Date(item.returned_date)
        const localReturnDate = new Date(
          returnDate.getTime() - returnDate.getTimezoneOffset() * 60000
        )

        if (
          localReturnDate.getMonth() === selectedMonth &&
          localReturnDate.getFullYear() === selectedYear
        ) {
          const weekIndex = Math.min(Math.floor((localReturnDate.getDate() - 1) / 7), 3)
          weeklyData.returned[weekIndex]++
        }
      }
    })

    return weeklyData
  }

  const generatePDF = async () => {
    setIsGenerating(true)
    try {
      const allBorrowedData = await fetchAllBorrowedData()
      const weeklyStats = organizeDataByWeeks(allBorrowedData)

      const pdfDoc = await PDFDocument.create()
      const page = pdfDoc.addPage([800, 1000])
      const { height } = page.getSize()
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

      // Title
      page.drawText(`Library Statistics Report - ${months[selectedMonth]} ${selectedYear}`, {
        x: 50,
        y: height - 50,
        size: 20,
        color: rgb(0, 0, 0.7)
      })

      // Weekly Statistics
      const borrowedWeeks = weeklyStats.borrowed
      const returnedWeeks = weeklyStats.returned
      const overdueWeeks = [0, 0, 0, 0] // Placeholder for overdue data

      // Draw weekly statistics table
      const startY = height - 100
      const rowHeight = 30

      // Headers
      page.drawText('Period', { x: 50, y: startY, size: 12 })
      page.drawText('Borrowed', { x: 200, y: startY, size: 12 })
      page.drawText('Returned', { x: 300, y: startY, size: 12 })
      page.drawText('Overdue', { x: 400, y: startY, size: 12 })

      // Weekly data
      for (let i = 0; i < 4; i++) {
        const y = startY - (i + 1) * rowHeight
        page.drawText(`Week ${i + 1}`, { x: 50, y, size: 12 })
        page.drawText(borrowedWeeks[i].toString(), { x: 200, y, size: 12 })
        page.drawText(returnedWeeks[i].toString(), { x: 300, y, size: 12 })
        page.drawText(overdueWeeks[i].toString(), { x: 400, y, size: 12 })
      }

      // Monthly totals
      const totalY = startY - 5 * rowHeight
      const totals = {
        borrowed: borrowedWeeks.reduce((a, b) => a + b, 0),
        returned: returnedWeeks.reduce((a, b) => a + b, 0),
        overdue: overdueWeeks.reduce((a, b) => a + b, 0)
      }

      page.drawText('Monthly Total', { x: 50, y: totalY, size: 12, color: rgb(0, 0, 0.8) })
      page.drawText(totals.borrowed.toString(), { x: 200, y: totalY, size: 12 })
      page.drawText(totals.returned.toString(), { x: 300, y: totalY, size: 12 })
      page.drawText(totals.overdue.toString(), { x: 400, y: totalY, size: 12 })

      // Save PDF - Modified for Electron
      const pdfBytes = await pdfDoc.save()
      const blob = new Blob([pdfBytes], { type: 'application/pdf' })

      // Use window.electron.ipcRenderer if available (Electron environment)
      if (window.Electron?.ipcRenderer) {
        const buffer = await blob.arrayBuffer()
        const fileName = `library-report-${months[selectedMonth]}-${selectedYear}.pdf`

        // Send to main process for saving
        window.Electron.ipcRenderer.send('save-pdf', {
          buffer: Array.from(new Uint8Array(buffer)),
          fileName
        })
      } else {
        // Fallback for browser environment
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `library-report-${months[selectedMonth]}-${selectedYear}.pdf`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Failed to generate report. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="report-generator">
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
