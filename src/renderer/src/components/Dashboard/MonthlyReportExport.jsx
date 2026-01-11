// @refresh reset
import PropTypes from 'prop-types'
import { useState } from 'react'
import { Download, X } from 'lucide-react'
import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer'
import './MonthlyReportExport.css'
import { Button } from '../../components/ui/button'
import { useToaster } from '../Toast/useToaster'

const parseMonthId = (monthId) => {
  if (!monthId) return null
  const match = /^\s*(\d{4})-(\d{1,2})\s*$/.exec(String(monthId))
  if (!match) return null
  const year = Number(match[1])
  const month = Number(match[2])
  if (!Number.isFinite(year) || !Number.isFinite(month) || month < 1 || month > 12) return null
  return { year, month }
}

const normalizeMonthId = (monthId) => {
  const parsed = parseMonthId(monthId)
  if (!parsed) return monthId
  return `${parsed.year}-${String(parsed.month).padStart(2, '0')}`
}

const getMonthRange = (monthId) => {
  const parsed = parseMonthId(monthId)
  if (!parsed) return null
  const start = new Date(parsed.year, parsed.month - 1, 1)
  start.setHours(0, 0, 0, 0)
  const end = new Date(parsed.year, parsed.month, 0)
  end.setHours(23, 59, 59, 999)
  return { start, end }
}

const parseDateInputLocal = (value, mode) => {
  if (!value) return null
  const monthParsed = parseMonthId(value)
  if (monthParsed) {
    if (mode === 'end') {
      const end = new Date(monthParsed.year, monthParsed.month, 0)
      end.setHours(23, 59, 59, 999)
      return end
    }
    const start = new Date(monthParsed.year, monthParsed.month - 1, 1)
    start.setHours(0, 0, 0, 0)
    return start
  }

  const match = /^\s*(\d{4})-(\d{2})-(\d{2})\s*$/.exec(String(value))
  if (!match) {
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? null : date
  }

  const year = Number(match[1])
  const monthIndex = Number(match[2]) - 1
  const day = Number(match[3])
  const date = new Date(year, monthIndex, day)
  if (mode === 'end') date.setHours(23, 59, 59, 999)
  else date.setHours(0, 0, 0, 0)
  return date
}

const getCurrentMonthInputValue = () => {
  const now = new Date()
  const yyyy = now.getFullYear()
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  return `${yyyy}-${mm}`
}

// PDF Styles - Modern shadcn-inspired black and white design
const styles = StyleSheet.create({
  page: {
    padding: 50,
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff'
  },
  header: {
    marginBottom: 40,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
    borderBottomStyle: 'solid',
    alignItems: 'center'
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.5
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 4,
    fontWeight: 'normal'
  },
  table: {
    marginTop: 24,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderStyle: 'solid',
    borderRadius: 8
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#1f2937',
    padding: 14,
    color: '#ffffff'
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
    borderBottomStyle: 'solid',
    padding: 14,
    backgroundColor: '#ffffff'
  },
  tableRowAlt: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
    borderBottomStyle: 'solid',
    padding: 14,
    backgroundColor: '#fafafa'
  },
  tableFooter: {
    flexDirection: 'row',
    backgroundColor: '#fafafa',
    padding: 14,
    borderTopWidth: 2,
    borderTopColor: '#000000',
    borderTopStyle: 'solid'
  },
  columnMonth: {
    width: '25%',
    fontSize: 12,
    fontWeight: 'bold'
  },
  columnNumber: {
    width: '18.75%',
    fontSize: 12,
    textAlign: 'center',
    fontWeight: 'normal'
  },
  headerText: {
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    color: '#ffffff'
  },
  footer: {
    marginTop: 40,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
    borderTopStyle: 'solid',
    textAlign: 'center'
  },
  footerText: {
    fontSize: 10,
    color: '#a3a3a3',
    marginBottom: 4,
    lineHeight: 1.6
  }
})

// PDF Document Component
const MonthlyReportPDF = ({ data, totals, generatedDate }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Library Monthly Report</Text>
        <Text style={styles.subtitle}>Comprehensive Performance Analysis</Text>
        <Text style={styles.subtitle}>Generated on: {generatedDate}</Text>
      </View>

      {/* Table */}
      <View style={styles.table}>
        {/* Table Header */}
        <View style={styles.tableHeader}>
          <Text style={[styles.columnMonth, styles.headerText]}>MONTH</Text>
          <Text style={[styles.columnNumber, styles.headerText]}>PROCESSED</Text>
          <Text style={[styles.columnNumber, styles.headerText]}>BORROWED</Text>
          <Text style={[styles.columnNumber, styles.headerText]}>RETURNED</Text>
          <Text style={[styles.columnNumber, styles.headerText]}>OVERDUE</Text>
        </View>

        {/* Table Body */}
        {data.map((stat, index) => (
          <View key={index} style={index % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
            <Text style={[styles.columnMonth, { color: '#000000' }]}>{stat.month}</Text>
            <Text style={[styles.columnNumber, { color: '#525252' }]}>{stat.processed || 0}</Text>
            <Text style={[styles.columnNumber, { color: '#525252' }]}>{stat.borrowed || 0}</Text>
            <Text style={[styles.columnNumber, { color: '#525252' }]}>{stat.returned || 0}</Text>
            <Text style={[styles.columnNumber, { color: '#525252' }]}>{stat.overdue || 0}</Text>
          </View>
        ))}

        {/* Table Footer */}
        <View style={styles.tableFooter}>
          <Text style={[styles.columnMonth, { color: '#000000', fontWeight: 'bold' }]}>TOTAL</Text>
          <Text style={[styles.columnNumber, { color: '#000000', fontWeight: 'bold' }]}>
            {totals.processed}
          </Text>
          <Text style={[styles.columnNumber, { color: '#000000', fontWeight: 'bold' }]}>
            {totals.borrowed}
          </Text>
          <Text style={[styles.columnNumber, { color: '#000000', fontWeight: 'bold' }]}>
            {totals.returned}
          </Text>
          <Text style={[styles.columnNumber, { color: '#000000', fontWeight: 'bold' }]}>
            {totals.overdue}
          </Text>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          This report was automatically generated by the Library Management System
        </Text>
        <Text style={styles.footerText}>
          For questions or concerns, please contact the library administration
        </Text>
      </View>
    </Page>
  </Document>
)

MonthlyReportPDF.propTypes = {
  data: PropTypes.array.isRequired,
  totals: PropTypes.object.isRequired,
  generatedDate: PropTypes.string.isRequired
}

// Main Export Component
const MonthlyReportExport = ({ monthlyStatsData }) => {
  const [showExportModal, setShowExportModal] = useState(false)
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState(getCurrentMonthInputValue())
  const [inlineError, setInlineError] = useState('')
  const { showToast } = useToaster()

  const closeModal = () => {
    setShowExportModal(false)
    setInlineError('')
  }

  const handleExportPDF = () => {
    if (!monthlyStatsData || monthlyStatsData.length === 0) {
      showToast('Error', 'No data available to export', 'error')
      return
    }
    setInlineError('')
    setShowExportModal(true)
  }

  const generatePDF = async () => {
    if (!monthlyStatsData || monthlyStatsData.length === 0) {
      setInlineError('No data available to export')
      return
    }

    try {
      setInlineError('')
      const currentDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })

      const normalizedData = monthlyStatsData.map((stat) => ({
        ...stat,
        month: normalizeMonthId(stat?.month)
      }))

      // Sort data by month in ascending order
      let sortedData = [...normalizedData].sort((a, b) => {
        const parsedA = parseMonthId(a?.month)
        const parsedB = parseMonthId(b?.month)

        if (parsedA && parsedB) {
          if (parsedA.year !== parsedB.year) return parsedA.year - parsedB.year
          return parsedA.month - parsedB.month
        }

        if (parsedA) return -1
        if (parsedB) return 1

        return String(a?.month ?? '').localeCompare(String(b?.month ?? ''))
      })

      // Filter by date range if specified (include months that overlap the range)
      if (fromDate || toDate) {
        const from = fromDate ? parseDateInputLocal(fromDate, 'start') : null
        const to = toDate ? parseDateInputLocal(toDate, 'end') : null

        sortedData = sortedData.filter((stat) => {
          const monthRange = getMonthRange(stat?.month)
          if (!monthRange) return true

          if (from && monthRange.end < from) return false
          if (to && monthRange.start > to) return false
          return true
        })
      }

      if (sortedData.length === 0) {
        setInlineError('No data available for the selected date range')
        return
      }

      // Calculate totals
      const totals = sortedData.reduce(
        (acc, stat) => ({
          processed: acc.processed + (stat.processed || 0),
          borrowed: acc.borrowed + (stat.borrowed || 0),
          returned: acc.returned + (stat.returned || 0),
          overdue: acc.overdue + (stat.overdue || 0)
        }),
        { processed: 0, borrowed: 0, returned: 0, overdue: 0 }
      )

      // Generate PDF
      const blob = await pdf(
        <MonthlyReportPDF data={sortedData} totals={totals} generatedDate={currentDate} />
      ).toBlob()

      // Create blob URL and open in new window for preview
      const url = URL.createObjectURL(blob)
      window.open(url, '_blank')

      // Clean up the URL after a delay to allow the preview to load
      setTimeout(() => {
        URL.revokeObjectURL(url)
      }, 100)

      // Close modal
      setShowExportModal(false)
      setInlineError('')
      setFromDate('')
      setToDate(getCurrentMonthInputValue())
    } catch (error) {
      console.error('Error generating PDF:', error)
      showToast('Error', 'Failed to generate PDF. Please try again.', 'error')
    }
  }

  return (
    <>
      {/* Export Button */}
      <Button variant="primary" onClick={handleExportPDF}>
        <Download size={16} />
        Export PDF
      </Button>

      {/* Export Modal */}
      {showExportModal && (
        <div className="export-modal-overlay" onClick={closeModal}>
          <div className="export-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="export-modal-header">
              <h3>Export Monthly Report</h3>
              <Button variant="ghost" onClick={closeModal}>
                <X size={20} />
              </Button>
            </div>
            <div className="export-modal-body">
              <p className="export-modal-description">
                Select a date range to filter the report. To Date defaults to the current month.
              </p>

              {inlineError ? <div className="export-modal-inline-error">{inlineError}</div> : null}
              <div className="date-filters">
                <div className="date-filter-group">
                  <label htmlFor="fromDate">From Date</label>
                  <input
                    type="month"
                    id="fromDate"
                    value={fromDate}
                    onChange={(e) => {
                      setFromDate(e.target.value)
                      setInlineError('')
                    }}
                    className="date-input"
                  />
                </div>
                <div className="date-filter-group">
                  <label htmlFor="toDate">To Date</label>
                  <input
                    type="month"
                    id="toDate"
                    value={toDate}
                    onChange={(e) => {
                      setToDate(e.target.value)
                      setInlineError('')
                    }}
                    className="date-input"
                  />
                </div>
              </div>
            </div>
            <div className="export-modal-footer">
              <Button variant="secondary" onClick={closeModal}>
                Cancel
              </Button>
              <Button variant="primary" onClick={generatePDF}>
                <Download size={16} />
                Export PDF
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

MonthlyReportExport.propTypes = {
  monthlyStatsData: PropTypes.array
}

export default MonthlyReportExport
