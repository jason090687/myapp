import React, { useState } from 'react'
import './styles/MonthlyReportExport.css'
import { Button } from '../ui/button';
import logo from '../../assets/logo.png'

// const circulationData = [
//   { period: "Week 1 (Oct 01 - Oct 07)", volume: 382, pct: "26.3%" },
//   { period: "Week 2 (Oct 08 - Oct 14)", volume: 270, pct: "18.6%" },
//   { period: "Week 3 (Oct 15 - Oct 21)", volume: 428, pct: "29.5%" },
//   { period: "Week 4 (Oct 22 - Oct 31)", volume: 370, pct: "25.6%" },
// ];

// const acquisitions = [
//   { title: "The Silent Archive", author: "E. L. Thorne", classification: "Philosophy", count: 142 },
//   { title: "Quantum Epistemology", author: "Dr. Aris Vond", classification: "Science", count: 98 },
//   { title: "Midnight in Alexandria", author: "Sarah J. Miller", classification: "History", count: 85 },
//   { title: "Digital Forensics 101", author: "Marcus Reed", classification: "Tech", count: 72 },
// ];

function MonthlyReportExport({
  reportId,
  generatedDate,
  reportingPeriod,
  metrics = [],
  circulationData = [],
  acquisitions = [],
  organization = "Sacred Heart of Jesus Montessori School" }) {
  const [printed, setPrinted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const today = new Date()
  const defaultDate = today.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  const defautlReportId = `CUR-${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`

  const handlePrint = () => {
    setPrinted(true);
    setTimeout(() => { window.print(); setPrinted(false); }, 100);
  };

  return (
    <>
      <div className='app-shell'>

        {/* Document page */}
        <div className='modal-scroll'>
          <div className="page-wrapper">
            <div className="doc">

              {/* Doc header */}
              <div className="doc-header">
                <div className="doc-header-left">Internal Archive Access</div>
                <div className="doc-header-right">
                  <span className="confidential-label">Confidential</span>
                  Report ID: {reportId || defautlReportId}<br />
                  Generated: {generatedDate || defaultDate}
                </div>
              </div>

              {/* Title */}
              <div className="title-block">
                <h1 className="report-title">Monthly Performance Report</h1>
                <p className="report-period">Reporting Period: {reportingPeriod}</p>
              </div>

              <hr className="rule" />

              {/* I. Executive Metrics */}
              <div className="section-heading">
                <span>I.</span> Executive Book Summary
              </div>
              <div className="metrics-grid">
                {metrics.map((m, i) => (
                  <div className='metric-cell' key={i}>
                    <div className='metric-label'>{m.label}</div>
                    <div className={`metric-value ${m.isAlert ? 'red' : ''}`}>{m.value}</div>
                    <div className='metric-sub'>{m.sub}</div>
                  </div>
                ))}
              </div>

              <hr className="rule-thin" />

              {/* II. Weekly Circulation */}
              <div className="section-heading">
                <span>II.</span> Weekly Circulation Trends
              </div>
              <p className="body-text">
                The following table outlines the distribution of archival access requests
                across the four-week reporting window of October 2023.
              </p>
              <table className="circ-table">
                <thead>
                  <tr>
                    <th>Reporting Period</th>
                    <th>Volume</th>
                    <th>% of Total</th>
                  </tr>
                </thead>
                <tbody>
                  {circulationData.map((row, i) => (
                    <tr key={i}>
                      <td>{row.period}</td>
                      <td style={{ textAlign: "right" }}>{row.volume}</td>
                      <td style={{ textAlign: "right" }}>{row.pct}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td>Total Monthly Volume</td>
                    <td>1,450</td>
                    <td>100%</td>
                  </tr>
                </tfoot>
              </table>

              <hr className="rule-thin" />

              {/* III. Acquisitions */}
              <div className="section-heading">
                <span>III.</span> Notable Popular Acquisitions
              </div>
              <p className="body-text">
                High-demand items identified for the current reporting period. These titles
                have maintained the highest circulation frequency.
              </p>
              <table className="acq-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Author</th>
                    <th>Classification</th>
                    <th style={{ textAlign: "right" }}>Circ. Count</th>
                  </tr>
                </thead>
                <tbody>
                  {acquisitions.map((item, i) => (
                    <tr key={i}>
                      <td className="col-title">{item.title}</td>
                      <td className="col-author">{item.author}</td>
                      <td className="col-class">{item.classification}</td>
                      <td className="col-count">{item.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Footer */}
              <div className="doc-footer">
                <p className="footer-disclaimer">
                  This report is intended for internal administrative use only. Information
                  contained herein regarding member activity and archive access is subject to
                  institutional privacy policies. Dissemination of this report to unauthorized
                  personnel is strictly prohibited. For inquiries regarding data discrepancies,
                  please contact the System Administrator.
                </p>
                <div className="footer-bar">
                  <div>
                    © 2026 {organization}
                  </div>
                  <div style={{ textAlign: "right" }}>
                    Page 1 of 12<br />
                    Ref: {reportId || defautlReportId}
                  </div>
                </div>
              </div>

            </div>
            <div className="page-badge">Page 1 / 12</div>
          </div>
        </div>
      </div>
    </>
  );
}

export default MonthlyReportExport