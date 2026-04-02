import { useState, useEffect } from "react";
import { pdf, PDFViewer } from "@react-pdf/renderer";
import MonthlyReportPDF from "./MonthlyReportPDF";
import { Button } from "../ui/button";

// ── Styles ────────────────────────────────────────────────────────────────────
const overlay = {
    position: "fixed", inset: 0,
    background: "rgba(0,0,0,0.55)",
    backdropFilter: "blur(4px)",
    WebkitBackdropFilter: "blur(4px)",
    display: "flex", alignItems: "center", justifyContent: "center",
    zIndex: 9999, padding: "1.25rem",
};
const modal = {
    background: "#fff", borderRadius: "6px",
    boxShadow: "0 16px 64px rgba(0,0,0,0.25)",
    display: "flex", flexDirection: "column",
    width: "min(900px, 95vw)", height: "90vh", overflow: "hidden",
};
const modalHeader = {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "0.75rem 1.25rem", borderBottom: "1px solid #e5e7eb",
    background: "#f9fafb", gap: "0.75rem", flexShrink: 0,
};
const loadingPane = {
    flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
    flexDirection: "column", gap: "0.75rem", color: "#9ca3af",
    fontSize: "0.8rem", fontFamily: "inherit",
};
const btnBase = {
    display: "inline-flex", alignItems: "center", gap: "0.35rem",
    padding: "0.35rem 0.9rem", border: "none", borderRadius: "4px",
    fontFamily: "inherit", fontSize: "0.75rem", fontWeight: 600,
    cursor: "pointer", whiteSpace: "nowrap",
};
const btnGhost = { ...btnBase, background: "transparent", color: "#6b7280", border: "1px solid #e5e7eb" };
// const btnClose = { ...btnBase, background: "transparent", color: "#6b7280", border: "1px solid #e5e7eb", padding: "0.35rem 0.6rem" };

const DownloadIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
);

const Spinner = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="2" strokeLinecap="round">
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
        <path d="M12 2a10 10 0 0 1 10 10" style={{ animation: "spin 0.8s linear infinite", transformOrigin: "center" }} stroke="#6b7280" />
    </svg>
);

export function MonthlyReportTrigger({ logs = [] }) {
    const [isOpen, setIsOpen] = useState(false);
    const [viewerReady, setViewerReady] = useState(false);
    const [downloading, setDownloading] = useState(false);

    const period = new Date().toLocaleDateString("en-PH", {
        month: "long", year: "numeric",
    });

    // Defer PDFViewer mount until after the modal is in the DOM.
    // Without this, react-pdf tries to render into a null container and crashes.
    useEffect(() => {
        if (!isOpen) {
            setViewerReady(false);
            return;
        }
        const id = setTimeout(() => setViewerReady(true), 80);
        return () => clearTimeout(id);
    }, [isOpen]);

    const handleOpen = () => {
        if (!logs || logs.length === 0) {
            alert("No transaction logs to preview.");
            return;
        }
        setIsOpen(true);
    };

    const handleClose = () => setIsOpen(false);

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) handleClose();
    };

    const handleDownload = async () => {
        if (downloading) return;
        setDownloading(true);
        try {
            const blob = await pdf(<MonthlyReportPDF logs={logs} />).toBlob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `Monthly_Report_${period.replace(" ", "_")}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error("PDF download failed:", err);
            alert("Failed to download. Please try again.");
        } finally {
            setDownloading(false);
        }
    };

    return (
        <>
            <Button variant='secondary' style={btnGhost} onClick={handleOpen}>
                Preview Report
            </Button>

            {isOpen && (
                <div style={overlay} onClick={handleOverlayClick}>
                    <div style={modal}>

                        {/* Header */}
                        <div style={modalHeader}>
                            <span style={{ fontFamily: "inherit", fontSize: "0.85rem", fontWeight: 600, color: "#111827" }}>
                                Monthly Report — {period}
                            </span>
                            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                                <Button
                                    variant='primary'
                                    // style={{ opacity: downloading ? 0.65 : 1, cursor: downloading ? "not-allowed" : "pointer" }}
                                    onClick={handleDownload}
                                    disabled={downloading}
                                >
                                    <DownloadIcon />
                                    {downloading ? "Downloading…" : "Download PDF"}
                                </Button>
                                <Button variant='secondary' onClick={handleClose} aria-label="Close">
                                    ✕
                                </Button>
                            </div>
                        </div>

                        {/* Viewer — only mounted after delay so react-pdf has a valid DOM root */}
                        {viewerReady ? (
                            <PDFViewer
                                width="100%"
                                height="100%"
                                showToolbar={false}
                                style={{ border: "none", flex: 1 }}
                            >
                                <MonthlyReportPDF logs={logs} />
                            </PDFViewer>
                        ) : (
                            <div style={loadingPane}>
                                <Spinner />
                                <span>Preparing preview…</span>
                            </div>
                        )}

                    </div>
                </div>
            )}
        </>
    );
}

export default MonthlyReportTrigger;