import React, { useRef, useState } from "react";
import "./MonthlyReport.css";

const MonthlyReport = ({ isOpen, onClose, logs = [] }) => {
    const contentRef = useRef(null);
    const [downloading, setDownloading] = useState(false);

    if (!isOpen) return null;

    const addedBooks = logs.filter(
        (log) => log.type === "book" && log.action.toLowerCase().includes("created")
    );
    const borrowedBooks = logs.filter((log) =>
        log.action.toLowerCase().includes("borrowed")
    );
    const returnedBooks = logs.filter((log) =>
        log.action.toLowerCase().includes("returned")
    );

    const groupByDate = (data) =>
        data.reduce((acc, log) => {
            const date = new Date(log.created_at).toLocaleDateString("en-PH", {
                month: "long", day: "numeric", year: "numeric",
            });
            if (!acc[date]) acc[date] = [];
            acc[date].push(log);
            return acc;
        }, {});

    const formatDateTime = (ts) =>
        ts
            ? new Date(ts).toLocaleString("en-PH", {
                year: "numeric", month: "2-digit", day: "2-digit",
                hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true,
            })
            : "—";

    const formatDate = (ts) => {
        if (!ts) return "—";
        const d = new Date(ts);
        return isNaN(d) ? String(ts) : d.toLocaleDateString("en-PH", {
            year: "numeric", month: "2-digit", day: "2-digit",
        });
    };

    const shortId = (id) =>
        typeof id === "string" ? id.split("-").pop() : id;

    const now = new Date();
    const period = now.toLocaleDateString("en-PH", { month: "long", year: "numeric" });
    const generated = now.toLocaleString("en-PH", {
        month: "short", day: "2-digit", year: "numeric",
        hour: "2-digit", minute: "2-digit", hour12: true,
    });
    const total = addedBooks.length + borrowedBooks.length + returnedBooks.length;

    // ── Download as PDF ────────────────────────────────────────────────────────
    const handleDownloadPDF = async () => {
        setDownloading(true);
        try {
            const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
                import("html2canvas"),
                import("jspdf"),
            ]);

            const element = contentRef.current;

            // Hide buttons during capture
            const actions = element.querySelector(".mr-header-actions");
            if (actions) actions.style.visibility = "hidden";

            // Temporarily expand to full height for capture
            const prevMaxHeight = element.style.maxHeight;
            const prevOverflow = element.style.overflow;
            element.style.maxHeight = "none";
            element.style.overflow = "visible";

            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                backgroundColor: "#ffffff",
                logging: false,
            });

            // Restore
            element.style.maxHeight = prevMaxHeight;
            element.style.overflow = prevOverflow;
            if (actions) actions.style.visibility = "visible";

            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
            const pageW = pdf.internal.pageSize.getWidth();
            const pageH = pdf.internal.pageSize.getHeight();
            const margin = 10;
            const usableW = pageW - margin * 2;
            const imgH = (canvas.height * usableW) / canvas.width;

            let yOffset = 0;
            while (yOffset < imgH) {
                if (yOffset > 0) pdf.addPage();
                pdf.addImage(imgData, "PNG", margin, margin - yOffset, usableW, imgH);
                yOffset += pageH - margin * 2;
            }

            pdf.save(`Monthly_Report_${period.replace(" ", "_")}.pdf`);
        } catch (err) {
            console.error("PDF generation failed:", err);
            alert("Failed to generate PDF. Please try again.");
        } finally {
            setDownloading(false);
        }
    };

    // ── Section renderers ──────────────────────────────────────────────────────
    const renderBooksAdded = (title, data) => {
        if (!data.length) return null;
        const grouped = groupByDate(data);
        return (
            <div className="mr-section">
                <h3 className="mr-section-title">{title}</h3>
                <div className="mr-section-rule" />
                {Object.entries(grouped).map(([date, rows]) => (
                    <div key={date} className="mr-date-group">
                        <p className="mr-date-label">{date}</p>
                        <table className="mr-table">
                            <thead>
                                <tr>
                                    <th>ID</th><th>Date &amp; Time</th><th>Name</th><th>ISBN</th><th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((log) => (
                                    <tr key={log.id}>
                                        <td className="mr-id">#{shortId(log.id)}</td>
                                        <td className="mr-dt">{formatDateTime(log.created_at)}</td>
                                        <td className="mr-name">{log.name}</td>
                                        <td className="mr-isbn">{log.isbn || "—"}</td>
                                        <td>{log.action}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ))}
            </div>
        );
    };

    const renderBooksBorrowed = (title, data) => {
        if (!data.length) return null;
        const grouped = groupByDate(data);
        return (
            <div className="mr-section">
                <h3 className="mr-section-title">{title}</h3>
                <div className="mr-section-rule" />
                {Object.entries(grouped).map(([date, rows]) => (
                    <div key={date} className="mr-date-group">
                        <p className="mr-date-label">{date}</p>
                        <table className="mr-table">
                            <thead>
                                <tr>
                                    <th>ID</th><th>Date &amp; Time</th><th>Name</th><th>Due Date</th><th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((log) => (
                                    <tr key={log.id}>
                                        <td className="mr-id">#{shortId(log.id)}</td>
                                        <td className="mr-dt">{formatDateTime(log.created_at)}</td>
                                        <td className="mr-name">{log.name}</td>
                                        <td className="mr-due">
                                            {log.due_date
                                                ? formatDate(log.due_date)
                                                : <span className="mr-no-data">No due date</span>}
                                        </td>
                                        <td>{log.action}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ))}
            </div>
        );
    };

    const renderBooksReturned = (title, data) => {
        if (!data.length) return null;
        const grouped = groupByDate(data);
        return (
            <div className="mr-section">
                <h3 className="mr-section-title">{title}</h3>
                <div className="mr-section-rule" />
                {Object.entries(grouped).map(([date, rows]) => (
                    <div key={date} className="mr-date-group">
                        <p className="mr-date-label">{date}</p>
                        <table className="mr-table">
                            <thead>
                                <tr>
                                    <th>ID</th><th>Date &amp; Time</th><th>Name</th><th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((log) => (
                                    <tr key={log.id}>
                                        <td className="mr-id">#{shortId(log.id)}</td>
                                        <td className="mr-dt">{formatDateTime(log.created_at)}</td>
                                        <td className="mr-name">{log.name}</td>
                                        <td>{log.action}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="mr-overlay">
            <div className="mr-modal" ref={contentRef}>

                {/* Header */}
                <div className="mr-header">
                    <div className="mr-header-left">
                        <h2 className="mr-title">Monthly Report</h2>
                        <p className="mr-subtitle">Library Management System · Transaction Summary</p>
                    </div>
                    <div className="mr-header-right">
                        <div className="mr-meta-item">
                            <span className="mr-meta-label">GENERATED</span>
                            <span className="mr-meta-value">{generated}</span>
                        </div>
                        <div className="mr-meta-item">
                            <span className="mr-meta-label">PERIOD</span>
                            <span className="mr-meta-value">{period}</span>
                        </div>
                        <div className="mr-meta-item">
                            <span className="mr-meta-label">TOTAL RECORDS</span>
                            <span className="mr-meta-value mr-meta-total">{total}</span>
                        </div>
                    </div>
                    <div className="mr-header-actions">
                        <button
                            className="mr-download-btn"
                            onClick={handleDownloadPDF}
                            disabled={downloading}
                            title="Download as PDF"
                        >
                            {downloading ? (
                                <span className="mr-spinner" />
                            ) : (
                                <>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                        <polyline points="7 10 12 15 17 10" />
                                        <line x1="12" y1="15" x2="12" y2="3" />
                                    </svg>
                                    PDF
                                </>
                            )}
                        </button>
                        <button className="mr-close" onClick={onClose} aria-label="Close">✕</button>
                    </div>
                </div>

                <div className="mr-header-rule" />

                {/* Body */}
                <div className="mr-body">
                    {renderBooksAdded("Books Added", addedBooks)}
                    {renderBooksBorrowed("Books Borrowed", borrowedBooks)}
                    {renderBooksReturned("Books Returned", returnedBooks)}
                    {total === 0 && (
                        <p className="mr-empty">No transactions found for this period.</p>
                    )}
                </div>

                {/* Footer */}
                <div className="mr-footer">
                    <span>Library Management System — Confidential</span>
                    <span>{period} Report</span>
                </div>

            </div>
        </div>
    );
};

export default MonthlyReport;