import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar"
import {
    BookOpen,
    Trash2,
    UserPlus,
    Monitor,
    RefreshCcw,
    Calendar,
    Search
} from "lucide-react";
import './TransactionLog.css'
import { useBooks } from "../hooks";

const statusMap = {
    SUCCESS: "success",
    FLAGGED: "flagged",
    PENDING: "pending",
};

const actionIcons = {
    "Book Checkout": <BookOpen size={18} />,
    "Item Decommissioned": <Trash2 size={18} />,
    "Member Registration": <UserPlus size={18} />,
    "Schema Update": <Monitor size={18} />,
    "DB Synchronization": <RefreshCcw size={18} />,
};

const initialLogs = [
    {
        id: 1,
        timestamp: "Oct 24, 2024, 14:32",
        action: "Book Checkout",
        user: "Dr. Elias Thorne",
        memberId: "Member #9921",
        status: "SUCCESS",
        reference: "ISBN-92842",
        initials: "ET",
        avatarColor: "#4a6fa5",
    },
    {
        id: 2,
        timestamp: "Oct 24, 2024, 13:15",
        action: "Item Decommissioned",
        user: "System Admin",
        memberId: "Internal Auth",
        status: "FLAGGED",
        reference: "ARC-99120",
        initials: "SA",
        avatarColor: "#6b7c93",
    },
    {
        id: 3,
        timestamp: "Oct 24, 2024, 11:45",
        action: "Member Registration",
        user: "Mira Santiago",
        memberId: "Member #10042",
        status: "SUCCESS",
        reference: "REG-88219",
        initials: "MS",
        avatarColor: "#5a8a6e",
    },
    {
        id: 4,
        timestamp: "Oct 24, 2024, 10:20",
        action: "Schema Update",
        user: "Kernel Process",
        memberId: "Automated Task",
        status: "PENDING",
        reference: "SYS-VOL-4",
        initials: "SYS",
        avatarColor: "#8a7a9e",
    },
    {
        id: 5,
        timestamp: "Oct 23, 2024, 23:58",
        action: "DB Synchronization",
        user: "Nightly Service",
        memberId: "CRON Job",
        status: "SUCCESS",
        reference: "CRON-SYNC",
        initials: "NS",
        avatarColor: "#7a8a6e",
    },
];

const isNewBook = (createdAt, days = 7) => {
    const createdDate = new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now - createdDate);
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    return diffDays <= days;
};

export default function TransactionLog() {
    const [currentPage, setCurrentPage] = useState(1);
    const [isCollapsed, setIsCollapsed] = useState(false)
    const [actionFilter, setActionFilter] = useState("All Actions");
    const [memberIdFilter, setMemberIdFilter] = useState("");
    const [onlyNewBooks, setOnlyNewBooks] = useState(false);
    const [dateRange, setDateRange] = useState({
        start: "2024-10-20",
        end: "2024-10-27",
    })

    const { data: books, isLoading, error } = useBooks(
        currentPage,
        memberIdFilter,
        actionFilter === "All Actions" ? "" : actionFilter
    );


    const logs = books?.results || [];

    // console.log(logs)

    const itemsPerPage = 3;

    const handleSidebarToggle = () => {
        setIsCollapsed(!isCollapsed)
    }

    // Filter logs by date range and "only new books" checkbox
    const filteredLogs = logs.filter((log) => {
        const logDate = new Date(log.created_at);

        const startDate = new Date(dateRange.start);
        startDate.setHours(0, 0, 0, 0);

        const endDate = new Date(dateRange.end);
        endDate.setHours(23, 59, 59, 999);

        const inDateRange = logDate >= startDate && logDate <= endDate;

        const isNew = onlyNewBooks ? isNewBook(log.created_at) : true;

        return inDateRange && isNew;
    });

    // Pagination
    const totalPages = Math.ceil(filteredLogs.length / itemsPerPage) || 1;
    const paginatedLogs = filteredLogs.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    useEffect(() => {
        setCurrentPage(1);
    }, [memberIdFilter, actionFilter, dateRange, onlyNewBooks]);

    console.log(paginatedLogs)

    return (
        <div className="app-wrapper">
            <Sidebar isCollapsed={isCollapsed} onToggle={handleSidebarToggle} />
            <div className={`log-container ${isCollapsed ? 'collapsed' : ''}`}>
                <div className="log-content">
                    <div className="log-wrapper">
                        {/* Filter Bar */}
                        <div className="log-filter-bar">
                            <div className="log-filter-group">
                                <span className="log-filter-label">Date Range</span>
                                <div className="log-filter-input-wrapper">
                                    <input className="log-filter-input" type="date" value={dateRange.start} onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })} />
                                    <span> - </span>
                                    <input className="log-filter-input" type="date" value={dateRange.end} onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })} />
                                </div>
                            </div>

                            <div className="log-filter-group">
                                <span className="log-filter-label">Member ID / Name</span>
                                <div className="log-filter-input-wrapper">
                                    <Search size={14} />
                                    <input className="log-filter-search" placeholder="Enter ID..." value={memberIdFilter} onChange={(e) => setMemberIdFilter(e.target.value)} />
                                </div>
                            </div>
                            <div className="log-filter-group">
                                <label style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                    <input
                                        type="checkbox"
                                        checked={onlyNewBooks}
                                        onChange={(e) => setOnlyNewBooks(e.target.checked)}
                                    />
                                    Only show new books
                                </label>
                            </div>

                            <div className="log-filter-group">
                                <span className="log-filter-label">Action Type</span>
                                <div className="log-filter-select-wrapper">
                                    <select className="log-filter-select" value={actionFilter} onChange={(e) => setActionFilter(e.target.value)}>
                                        <option>All Actions</option>
                                        <option>Book Checkout</option>
                                        <option>Item Decommissioned</option>
                                        <option>Member Registration</option>
                                        <option>Schema Update</option>
                                        <option>DB Synchronization</option>
                                    </select>
                                    <span className="log-select-arrow">
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>
                                    </span>
                                </div>
                            </div>

                            <button className="log-apply-btn">Apply Filters</button>
                        </div>

                        {/* Main Card */}
                        <div className="log-card">
                            <div className="log-card-header">
                                <div>
                                    <h2 className="log-title">Log Entries</h2>
                                    <p className="log-subtitle">
                                        Showing {logs.length} / {books?.count || 0} books | Added in range: {filteredLogs}
                                    </p>
                                </div>
                                <div className="log-header-actions">
                                    <button className="log-download-btn">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
                                        </svg>
                                        Download CSV
                                    </button>
                                    <button className="log-print-btn">Print Ledger</button>
                                </div>
                            </div>

                            <div className="log-table-header">
                                <span className="log-table-header-cell">Timestamp</span>
                                <span className="log-table-header-cell">Action</span>
                                <span className="log-table-header-cell">User / Member</span>
                                <span className="log-table-header-cell">Status</span>
                                <span className="log-table-header-cell align-right">Reference</span>
                            </div>

                            {paginatedLogs.map((log) => (
                                <div key={log.id} className="log-table-row">
                                    <div>
                                        <span className={`log-status-timestamp ${isNewBook(log.created_at) ? "success" : "pending"}`}>
                                            {isNewBook(log.created_at) ? "New" : ""}
                                        </span>
                                    </div>

                                    <div className="log-action-cell">
                                        <span className="log-action-icon">
                                            <BookOpen size={18} />
                                        </span>
                                        {log.subject}
                                    </div>

                                    <div className="log-user-cell">
                                        <div className="log-avatar">
                                            {log.author?.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="log-user-name">{log.title}</div>
                                            <div className="log-member-id">{log.author}</div>
                                        </div>
                                    </div>

                                    <div>
                                        <span className="log-status-badge success">
                                            {log.copies} copies
                                        </span>
                                    </div>

                                    <div className="log-reference">
                                        {log.accession_number}
                                    </div>
                                </div>
                            ))}

                            <div className="log-footer">
                                <span className="log-page-info">Page {currentPage} of {totalPages}</span>
                                <div className="log-pagination">
                                    <button className="log-page-btn" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6" /></svg>
                                    </button>
                                    {[...Array(totalPages)].map((_, n) => (
                                        <button key={n} className={`log-page-btn${currentPage === n ? " active" : ""}`} onClick={() => setCurrentPage(n + 1)}>{n + 1}</button>
                                    ))}
                                    <button className="log-page-btn" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}