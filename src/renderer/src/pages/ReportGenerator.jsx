import React, { useState, useEffect } from 'react'
import { FaFileDownload, FaCalendar } from 'react-icons/fa'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import { useSelector } from 'react-redux'
import axios from 'axios'
import { Chart } from 'chart.js/auto'
import '../components/Dashboard/ReportGenerator.css'

const ReportGenerator = ({ chartData }) => {
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
      const canvas = document.createElement('canvas')
      canvas.width = 800
      canvas.height = 400
      const ctx = canvas.getContext('2d')

      new Chart(ctx, {
        type: 'bar',
        data: {
          ...chartData,
          datasets: [
            {
              ...chartData.datasets[0],
              borderRadius: 6,
              backgroundColor: [
                'rgba(53, 162, 235, 0.8)',
                'rgba(255, 159, 64, 0.8)',
                'rgba(75, 192, 192, 0.8)',
                'rgba(255, 99, 132, 0.8)'
              ],
              borderColor: [
                'rgb(53, 162, 235)',
                'rgb(255, 159, 64)',
                'rgb(75, 192, 192)',
                'rgb(255, 99, 132)'
              ],
              borderWidth: 1
            }
          ]
        },
        options: {
          responsive: false,
          animation: false,
          plugins: {
            legend: {
              position: 'top'
            },
            title: {
              display: true,
              text: `Library Statistics - ${months[selectedMonth]} ${selectedYear}`
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
      })

      // Convert chart to image
      const chartImage = canvas.toDataURL('image/png')

      // Create PDF
      const pdfDoc = await PDFDocument.create()
      const page = pdfDoc.addPage([800, 1000])
      const { height } = page.getSize()
      const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman)

      // Add title
      page.drawText(`Monthly Library Report - ${months[selectedMonth]} ${selectedYear}`, {
        x: 50,
        y: height - 50,
        size: 24,
        font: timesRomanFont
      })

      // Add chart image
      const pngImage = await pdfDoc.embedPng(chartImage)
      const pngDims = pngImage.scale(0.8) // Scale down the image a bit
      page.drawImage(pngImage, {
        x: 50,
        y: height - 450, // Position below title
        width: pngDims.width,
        height: pngDims.height
      })

      // Add statistics below the chart
      const monthlyStats = {
        processed: chartData.datasets[0].data[0] || 0,
        borrowed: chartData.datasets[0].data[1] || 0,
        returned: chartData.datasets[0].data[2] || 0,
        overdue: chartData.datasets[0].data[3] || 0
      }

      const stats = [
        { label: 'Processed Books', value: monthlyStats.processed },
        { label: 'Borrowed Books', value: monthlyStats.borrowed },
        { label: 'Returned Books', value: monthlyStats.returned },
        { label: 'Overdue Books', value: monthlyStats.overdue }
      ]

      stats.forEach((stat, index) => {
        page.drawText(`${stat.label}: ${stat.value}`, {
          x: 50,
          y: height - 500 - index * 30, // Position below chart
          size: 14,
          font: timesRomanFont
        })
      })

      // Save and download
      const pdfBytes = await pdfDoc.save()
      const blob = new Blob([pdfBytes], { type: 'application/pdf' })

      if (window.electron?.ipcRenderer) {
        const buffer = await blob.arrayBuffer()
        window.electron.ipcRenderer.send('save-pdf', {
          buffer: Array.from(new Uint8Array(buffer)),
          fileName: `library-report-${months[selectedMonth]}-${selectedYear}.pdf`
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
