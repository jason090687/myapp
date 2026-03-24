import React, { useState } from 'react'
import { Document, Page, Text, View, Image, StyleSheet, PDFViewer } from '@react-pdf/renderer'
import logo from '../../assets/logo.png'

// Replace the `styles` object and `MonthlyReportPDF` component in your MonthlyReportExport.jsx

// ─── PDF Styles ───────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  page: {
    paddingTop: 48,
    paddingBottom: 48,
    paddingHorizontal: 48,
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff',
  },

  // ── School header ──
  schoolHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 28,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    borderBottomStyle: 'solid',
  },
  schoolLogo: {
    width: 52,
    height: 52,
  },
  schoolInfo: {
    flex: 1,
  },
  schoolName: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 3,
  },
  schoolAddress: {
    fontSize: 8,
    color: '#6b7280',
    lineHeight: 1.4,
  },

  // ── Report title block ──
  titleBlock: {
    alignItems: 'center',
    marginBottom: 32,
  },
  reportLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: '#6b7280',
    marginBottom: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  generatedDate: {
    fontSize: 10,
    color: '#9ca3af',
    textAlign: 'center',
  },

  // ── Summary cards row ──
  summaryRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 28,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderStyle: 'solid',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  summaryCardAccent: {
    flex: 1,
    backgroundColor: '#111827',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 8,
    fontWeight: 'bold',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: '#6b7280',
    marginBottom: 6,
    textAlign: 'center',
  },
  summaryLabelLight: {
    fontSize: 8,
    fontWeight: 'bold',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: '#9ca3af',
    marginBottom: 6,
    textAlign: 'center',
  },
  summaryValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
  },
  summaryValueLight: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
  },

  // ── Section heading ──
  sectionHeading: {
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: '#6b7280',
    marginBottom: 10,
  },

  // ── Table ──
  table: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderStyle: 'solid',
    borderRadius: 8,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#111827',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 11,
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    borderBottomStyle: 'solid',
  },
  tableRowAlt: {
    flexDirection: 'row',
    paddingVertical: 11,
    paddingHorizontal: 16,
    backgroundColor: '#f9fafb',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    borderBottomStyle: 'solid',
  },
  tableFooter: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f3f4f6',
    borderTopWidth: 2,
    borderTopColor: '#111827',
    borderTopStyle: 'solid',
  },

  // ── Column widths ──
  colMonth: { width: '28%' },
  colNum: { width: '18%' },

  // ── Cell text ──
  headerCell: {
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: '#ffffff',
  },
  headerCellRight: {
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: '#ffffff',
    textAlign: 'center',
  },
  cellMonth: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#111827',
  },
  cellNum: {
    fontSize: 11,
    color: '#374151',
    textAlign: 'center',
  },
  footerCellMonth: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#111827',
  },
  footerCellNum: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
  },

  // ── Footer ──
  pageFooter: {
    marginTop: 36,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    borderTopStyle: 'solid',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 9,
    color: '#9ca3af',
    marginBottom: 3,
    lineHeight: 1.6,
    textAlign: 'center',
  },
  footerDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#d1d5db',
    marginVertical: 8,
  },
})

// Helper function to merge styles (for @react-pdf/renderer compatibility)
const mergeStyles = (...styleList) => {
  return styleList.reduce((acc, style) => ({ ...acc, ...style }), {})
}

// ─── PDF Document Component ───────────────────────────────────────────────────
const MonthlyReportPDF = ({ monthlyStatsData = [] }) => {
  // Calculate totals from data
  const calculateTotals = (data) => {
    return data.reduce(
      (acc, stat) => ({
        processed: acc.processed + (stat.processed || 0),
        borrowed: acc.borrowed + (stat.borrowed || 0),
        returned: acc.returned + (stat.returned || 0),
        overdue: acc.overdue + (stat.overdue || 0),
      }),
      { processed: 0, borrowed: 0, returned: 0, overdue: 0 }
    )
  }

  const data = monthlyStatsData || []
  const totals = calculateTotals(data)
  const generatedDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <PDFViewer style={{ width: '100%', height: '750px', border: 'none' }}>
      <Document>
        <Page size="A4" style={styles.page}>

          {/* School Header */}
          <View style={styles.schoolHeader}>
            <Image src={logo} style={styles.schoolLogo} />
            <View style={styles.schoolInfo}>
              <Text style={styles.schoolName}>Sacred Heart of Jesus Montessori School</Text>
              <Text style={styles.schoolAddress}>
                JR Borja Ext., Across Capistrano Complex, Gusa, Cagayan de Oro, Philippines, 9000
              </Text>
            </View>
          </View>

          {/* Report Title */}
          <View style={styles.titleBlock}>
            <Text style={styles.reportLabel}>Official Document</Text>
            <Text style={styles.title}>Library Monthly Report</Text>
            <Text style={styles.generatedDate}>Generated on {generatedDate}</Text>
          </View>

          {/* Summary Cards */}
          <View style={styles.summaryRow}>
            <View style={styles.summaryCardAccent}>
              <Text style={styles.summaryLabelLight}>Processed</Text>
              <Text style={styles.summaryValueLight}>{totals.processed}</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Borrowed</Text>
              <Text style={styles.summaryValue}>{totals.borrowed}</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Returned</Text>
              <Text style={styles.summaryValue}>{totals.returned}</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Overdue</Text>
              <Text style={styles.summaryValue}>{totals.overdue}</Text>
            </View>
          </View>

          {/* Section label */}
          <Text style={styles.sectionHeading}>Monthly Breakdown</Text>

          {/* Table */}
          <View style={styles.table}>
            {/* Header */}
            <View style={styles.tableHeader}>
              <Text style={mergeStyles(styles.colMonth, styles.headerCell)}>Month</Text>
              <Text style={mergeStyles(styles.colNum, styles.headerCellRight)}>Processed</Text>
              <Text style={mergeStyles(styles.colNum, styles.headerCellRight)}>Borrowed</Text>
              <Text style={mergeStyles(styles.colNum, styles.headerCellRight)}>Returned</Text>
              <Text style={mergeStyles(styles.colNum, styles.headerCellRight)}>Overdue</Text>
            </View>

            {/* Rows */}
            {data.map((stat, index) => (
              <View key={index} style={index % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
                <Text style={mergeStyles(styles.colMonth, styles.cellMonth)}>{stat.month}</Text>
                <Text style={mergeStyles(styles.colNum, styles.cellNum)}>{stat.processed || 0}</Text>
                <Text style={mergeStyles(styles.colNum, styles.cellNum)}>{stat.borrowed || 0}</Text>
                <Text style={mergeStyles(styles.colNum, styles.cellNum)}>{stat.returned || 0}</Text>
                <Text style={mergeStyles(styles.colNum, styles.cellNum)}>{stat.overdue || 0}</Text>
              </View>
            ))}

            {/* Totals row */}
            <View style={styles.tableFooter}>
              <Text style={mergeStyles(styles.colMonth, styles.footerCellMonth)}>TOTAL</Text>
              <Text style={mergeStyles(styles.colNum, styles.footerCellNum)}>{totals.processed}</Text>
              <Text style={mergeStyles(styles.colNum, styles.footerCellNum)}>{totals.borrowed}</Text>
              <Text style={mergeStyles(styles.colNum, styles.footerCellNum)}>{totals.returned}</Text>
              <Text style={mergeStyles(styles.colNum, styles.footerCellNum)}>{totals.overdue}</Text>
            </View>
          </View>

          {/* Page Footer */}
          <View style={styles.pageFooter}>
            <View style={styles.footerDot} />
            <Text style={styles.footerText}>
              This report was automatically generated by the Library Management System.
            </Text>
            <Text style={styles.footerText}>
              For questions or concerns, please contact the library administration.
            </Text>
          </View>

        </Page>
      </Document>
    </PDFViewer>
  )
}

// ─── Modal Styles ─────────────────────────────────────────────────────────────
const modalStyles = {
  backdrop: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    width: '90%',
    maxWidth: '1000px',
    height: '90vh',
    display: 'flex',
    flexDirection: 'column',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px',
    borderBottom: '1px solid #e5e7eb',
    backgroundColor: '#f9fafb',
  },
  modalTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#111827',
  },
  closeButton: {
    padding: '8px 12px',
    backgroundColor: '#f3f4f6',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
    transition: 'background-color 0.2s',
  },
  modalContent: {
    flex: 1,
    overflow: 'auto',
  },
  pdfViewerWrapper: {
    width: '100%',
    height: '100%',
  },
}

// ─── PDF Viewer Modal Component ──────────────────────────────────────────────
const PDFViewerModal = ({ isOpen, onClose, monthlyStatsData }) => {
  if (!isOpen) return null

  return (
    <div style={modalStyles.backdrop} onClick={onClose}>
      <div
        style={modalStyles.modalContainer}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={modalStyles.modalHeader}>
          <h2 style={modalStyles.modalTitle}>Library Monthly Report</h2>
          <button
            style={modalStyles.closeButton}
            onClick={onClose}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#e5e7eb'
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#f3f4f6'
            }}
          >
            Close
          </button>
        </div>
        <div style={modalStyles.modalContent}>
          <div style={modalStyles.pdfViewerWrapper}>
            <MonthlyReportPDF monthlyStatsData={monthlyStatsData} />
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main Export Button Component ───────────────────────────────────────── ────
const MonthlyReportExport = ({ monthlyStatsData = [] }) => {
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        style={{
          padding: '8px 16px',
          backgroundColor: '#3b82f6',
          color: '#ffffff',
          border: 'none',
          borderRadius: '4px',
          fontWeight: '500',
          cursor: 'pointer',
          fontSize: '14px',
          transition: 'background-color 0.2s',
        }}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = '#2563eb'
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = '#3b82f6'
        }}
      >
        Export PDF
      </button>

      <PDFViewerModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        monthlyStatsData={monthlyStatsData}
      />
    </>
  )
}

export default MonthlyReportExport