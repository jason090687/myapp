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
  const [borrowData, setBorrowData] = useState([])
  const { token } = useSelector((state) => state.auth)

  // Add months array if not already defined
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

  // Fetch borrow data when month/year changes
  useEffect(() => {
    const fetchBorrowData = async () => {
      try {
        const response = await axios.get(
          'http://countmein.pythonanywhere.com/api/v1/borrow/list/',
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        )
        setBorrowData(response.data.results)
      } catch (error) {
        console.error('Error fetching borrow data:', error)
      }
    }

    fetchBorrowData()
  }, [token])

  const organizeDataByWeeks = (data) => {
    const weeklyData = {
      borrowed: Array(4).fill(0),
      returned: Array(4).fill(0)
    }

    data.forEach((item) => {
      const borrowDate = new Date(item.borrowed_date)
      // Check if the date matches selected month and year
      if (borrowDate.getMonth() === selectedMonth && borrowDate.getFullYear() === selectedYear) {
        const weekIndex = Math.min(Math.floor((borrowDate.getDate() - 1) / 7), 3)
        weeklyData.borrowed[weekIndex]++
      }

      // Check returned date if it exists
      if (item.returned_date) {
        const returnDate = new Date(item.returned_date)
        if (returnDate.getMonth() === selectedMonth && returnDate.getFullYear() === selectedYear) {
          const weekIndex = Math.min(Math.floor((returnDate.getDate() - 1) / 7), 3)
          weeklyData.returned[weekIndex]++
        }
      }
    })

    return weeklyData
  }

  const generatePDF = async () => {
    setIsGenerating(true)
    try {
      // Fetch data specifically for the selected month and year
      const response = await axios.get('http://countmein.pythonanywhere.com/api/v1/borrow/list/', {
        headers: { Authorization: `Bearer ${token}` }
      })

      const pdfDoc = await PDFDocument.create()
      const page = pdfDoc.addPage([800, 1000])
      const { height } = page.getSize()
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

      // Process the data
      const weeklyStats = organizeDataByWeeks(response.data.results)

      // Draw title
      page.drawText(`Library Transactions Report - ${months[selectedMonth]} ${selectedYear}`, {
        x: 50,
        y: height - 50,
        size: 24,
        font: boldFont,
        color: rgb(0, 0, 0.8)
      })

      // Draw table headers
      const startY = height - 150
      const headers = [
        { text: 'Week', x: 50 },
        { text: 'Borrowed', x: 200 },
        { text: 'Returned', x: 350 },
        { text: 'Net Change', x: 500 }
      ]

      headers.forEach((header) => {
        page.drawText(header.text, {
          x: header.x,
          y: startY,
          size: 14,
          font: boldFont
        })
      })

      // Draw weekly data
      const rowHeight = 40
      weeklyStats.borrowed.forEach((borrowed, index) => {
        const returned = weeklyStats.returned[index]
        const y = startY - (index + 1) * rowHeight

        // Week number
        page.drawText(`Week ${index + 1}`, {
          x: 50,
          y,
          size: 12,
          font
        })

        // Borrowed count
        page.drawText(borrowed.toString(), {
          x: 200,
          y,
          size: 12,
          font
        })

        // Returned count
        page.drawText(returned.toString(), {
          x: 350,
          y,
          size: 12,
          font
        })

        // Net change
        const netChange = borrowed - returned
        page.drawText(netChange.toString(), {
          x: 500,
          y,
          size: 12,
          font,
          color: netChange >= 0 ? rgb(0.2, 0.6, 0.2) : rgb(0.8, 0.2, 0.2)
        })
      })

      // Calculate and draw totals
      const totalY = startY - 5 * rowHeight
      const totalBorrowed = weeklyStats.borrowed.reduce((a, b) => a + b, 0)
      const totalReturned = weeklyStats.returned.reduce((a, b) => a + b, 0)

      page.drawText('Monthly Totals', {
        x: 50,
        y: totalY,
        size: 14,
        font: boldFont
      })

      page.drawText(totalBorrowed.toString(), {
        x: 200,
        y: totalY,
        size: 14,
        font: boldFont
      })

      page.drawText(totalReturned.toString(), {
        x: 350,
        y: totalY,
        size: 14,
        font: boldFont
      })

      const netTotal = totalBorrowed - totalReturned
      page.drawText(netTotal.toString(), {
        x: 500,
        y: totalY,
        size: 14,
        font: boldFont,
        color: netTotal >= 0 ? rgb(0.2, 0.6, 0.2) : rgb(0.8, 0.2, 0.2)
      })

      // Save and download PDF
      const pdfBytes = await pdfDoc.save()
      const blob = new Blob([pdfBytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `library-report-${months[selectedMonth]}-${selectedYear}.pdf`
      document.body.appendChild(link) // Add link to document
      link.click()
      document.body.removeChild(link) // Clean up
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Failed to generate report. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  // ... rest of the component remains the same ...
}

export default ReportGenerator
