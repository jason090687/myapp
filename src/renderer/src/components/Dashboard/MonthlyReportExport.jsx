import React, { useState } from 'react'
import logo from '../../assets/logo.png'
import './MonthlyReportExport.css'

// ─── Icons ───────────────────────────────────────────────
const IconDownload = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
)

const IconClose = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

const IconPrint = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 6 2 18 2 18 9" />
    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
    <rect x="6" y="14" width="12" height="8" />
  </svg>
)

const IconFileText = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
)

// ─── Helpers ─────────────────────────────────────────────
const calculateTotals = (data) =>
  data.reduce(
    (acc, s) => ({
      processed: acc.processed + (s.processed || 0),
      borrowed: acc.borrowed + (s.borrowed || 0),
      returned: acc.returned + (s.returned || 0),
      overdue: acc.overdue + (s.overdue || 0),
    }),
    { processed: 0, borrowed: 0, returned: 0, overdue: 0 }
  )

const overdueBadgeClass = (n) => {
  if (!n) return 'overdue-badge overdue-badge--none'
  if (n < 5) return 'overdue-badge overdue-badge--low'
  return 'overdue-badge overdue-badge--high'
}

// ─── Report Document ──────────────────────────────────────
const ReportDocument = ({ monthlyStatsData = [] }) => {
  const totals = calculateTotals(monthlyStatsData)
  const generatedDate = new Date().toLocaleDateString('en-PH', {
    year: 'numeric', month: 'long', day: 'numeric'
  })

  return (
    <div id="print-area" className="report">

      {/* HEADER */}
      <header className="report-header">
        <img src={logo} alt="School logo" className="report-logo" />
        <div>
          <div className="report-school-name">
            Sacred Heart of Jesus Montessori School
          </div>
          <div className="report-school-sub">Cagayan de Oro, Philippines</div>
        </div>
      </header>

      {/* TITLE */}
      <div className="report-title-block">
        <h2 className="report-title">Library Monthly Report</h2>
        <div className="report-divider" />
        <p className="report-subtitle">Generated on {generatedDate}</p>
      </div>

      {/* STAT CARDS */}
      <div className="report-stats">
        <div className="stat-card stat-card--primary">
          <div className="stat-label">Processed</div>
          <div className="stat-value">{totals.processed}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Borrowed</div>
          <div className="stat-value">{totals.borrowed}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Returned</div>
          <div className="stat-value">{totals.returned}</div>
        </div>
        <div className="stat-card stat-card--danger">
          <div className="stat-label">Overdue</div>
          <div className="stat-value">{totals.overdue}</div>
        </div>
      </div>

      {/* TABLE */}
      <div className="report-table-wrap">
        <table className="report-table">
          <thead>
            <tr>
              <th>Month</th>
              <th>Processed</th>
              <th>Borrowed</th>
              <th>Returned</th>
              <th>Overdue</th>
            </tr>
          </thead>
          <tbody>
            {monthlyStatsData.map((d, i) => (
              <tr key={i}>
                <td>{d.month}</td>
                <td>{d.processed ?? '—'}</td>
                <td>{d.borrowed ?? '—'}</td>
                <td>{d.returned ?? '—'}</td>
                <td>
                  <span className={overdueBadgeClass(d.overdue)}>
                    {d.overdue ?? 0}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td>Total</td>
              <td>{totals.processed}</td>
              <td>{totals.borrowed}</td>
              <td>{totals.returned}</td>
              <td>{totals.overdue}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* FOOTER */}
      <footer className="report-footer">
        <span className="report-footer-note">
          This report is system-generated and does not require a signature.
        </span>
        <span className="report-footer-stamp">Library Management System</span>
      </footer>

    </div>
  )
}

// ─── Modal ────────────────────────────────────────────────
const PDFModal = ({ isOpen, onClose, monthlyStatsData }) => {
  if (!isOpen) return null

  const handlePrint = () => {
    const content = document.getElementById('print-area').innerHTML
    const win = window.open('', '', 'width=960,height=720')
    win.document.write(`
      <html>
        <head>
          <title>Library Monthly Report</title>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap" rel="stylesheet" />
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { font-family: 'DM Sans', Arial, sans-serif; padding: 48px; color: #0f0e0d; }
            h2  { font-family: 'DM Serif Display', serif; font-size: 26px; }
            .report-header { display:flex; align-items:center; gap:16px; margin-bottom:32px; padding-bottom:20px; border-bottom:2px solid #0f0e0d; }
            .report-logo   { width:52px; }
            .report-school-name { font-family:'DM Serif Display',serif; font-size:17px; }
            .report-school-sub  { font-size:12px; color:#5a5752; margin-top:3px; }
            .report-title-block { text-align:center; margin-bottom:32px; }
            .report-subtitle    { font-size:11px; color:#5a5752; margin-top:6px; letter-spacing:.06em; text-transform:uppercase; }
            .report-stats { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; margin-bottom:32px; }
            .stat-card    { border:1px solid #ddd8ce; border-radius:10px; padding:16px 12px; text-align:center; }
            .stat-card--primary { background:#0f0e0d; color:#faf8f4; }
            .stat-label { font-size:10px; text-transform:uppercase; letter-spacing:.08em; color:#5a5752; margin-bottom:8px; font-weight:600; }
            .stat-card--primary .stat-label { color:rgba(255,255,255,.55); }
            .stat-value { font-family:'DM Serif Display',serif; font-size:28px; }
            .stat-card--danger .stat-value { color:#b94040; }
            table  { width:100%; border-collapse:collapse; font-size:13px; }
            thead th { background:#0f0e0d; color:#faf8f4; padding:11px 14px; text-align:left; font-size:10px; letter-spacing:.08em; text-transform:uppercase; }
            thead th:not(:first-child) { text-align:center; }
            tbody tr { border-bottom:1px solid #ddd8ce; }
            tbody tr:nth-child(even) { background:#f2ede4; }
            tbody td { padding:10px 14px; }
            tbody td:not(:first-child) { text-align:center; }
            tfoot tr { border-top:2px solid #0f0e0d; }
            tfoot td { padding:11px 14px; font-weight:700; }
            tfoot td:not(:first-child) { text-align:center; }
            .report-footer { display:flex; justify-content:space-between; margin-top:32px; padding-top:16px; border-top:1px solid #ddd8ce; font-size:11px; color:#5a5752; }
            .overdue-badge { display:inline-flex; align-items:center; justify-content:center; min-width:30px; padding:2px 8px; border-radius:99px; font-size:12px; font-weight:600; }
            .overdue-badge--none { background:#e8f5e9; color:#2e7d32; }
            .overdue-badge--low  { background:#fff3e0; color:#e65100; }
            .overdue-badge--high { background:#fce4e4; color:#b94040; }
          </style>
        </head>
        <body>${content}</body>
      </html>
    `)
    win.document.close()
    win.focus()
    win.print()
    win.close()
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-shell">

        {/* Top bar */}
        <div className="modal-topbar">
          <span className="modal-topbar-title">
            <IconFileText /> &nbsp;Report Preview
          </span>
          <div className="modal-actions">
            <button className="modal-btn modal-btn--primary" onClick={handlePrint}>
              <IconDownload /> Download / Print PDF
            </button>
            <button className="modal-btn modal-btn--ghost" onClick={onClose}>
              <IconClose /> Close
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="modal-body">
          <ReportDocument monthlyStatsData={monthlyStatsData} />
        </div>

      </div>
    </div>
  )
}

// ─── Main Export ──────────────────────────────────────────
const MonthlyReportExport = ({ monthlyStatsData = [] }) => {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button className="export-btn" onClick={() => setOpen(true)}>
        <IconPrint /> Export Report
      </button>

      <PDFModal
        isOpen={open}
        onClose={() => setOpen(false)}
        monthlyStatsData={monthlyStatsData}
      />
    </>
  )
}

export default MonthlyReportExport