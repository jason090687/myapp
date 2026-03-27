import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import {
    BookOpen,
    Users,
    User,
    UserPlus,
    Pencil,
    Trash2,
    RotateCcw,
    LibraryBig,
    Search,
    AlertCircle
} from "lucide-react";
import "./TransactionLog.css";
import { useBooks, useBorrowedBooks, useEmployees, useStudents, useUsers } from "../hooks";
import { Button } from "../components/ui/button";


export default function TransactionLog() {
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('')
    const [searchInput, setSearchInput] = useState("");
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [actionFilter, setActionFilter] = useState("All");
    const [dateRange, setDateRange] = useState({
        start: "2026-01-01",
        end: "2026-12-31",
    });
    const [appliedDateRange, setAppliedDateRange] = useState({
        start: "2026-01-01",
        end: "2026-12-31",
    });



    const { data: books, isLoading: booksLoading, error: booksError } = useBooks(1, searchTerm)
    const { data: borrowedBooks, isLoading: borrowedBooksLoading, error: borrowedBooksError } = useBorrowedBooks(1, searchTerm)
    const { data: students, isLoading: studentsLoading, error: userError } = useStudents(1, searchTerm)
    const { data: staff, isLoading: staffLoading, error: staffError } = useEmployees(1, searchTerm)
    const { data: users, isLoading: usersLoading, error: usersError } = useUsers(searchTerm, 1)

    const isDataLoading = booksLoading || borrowedBooksLoading || studentsLoading || staffLoading || usersLoading;
    const isError = booksError || borrowedBooksError || userError || staffError || usersError;

    const itemsPerPage = 10

    const handleSidebarToggle = () => {
        setIsCollapsed(!isCollapsed);
    };

    const renderLogIcon = (log) => {
        const action = String(log.action || "").toLowerCase();
        const type = String(log.type || "").toLowerCase();

        if (action.includes("deleted")) {
            return <Trash2 size={18} />;
        }

        if (action.includes("edited")) {
            return <Pencil size={18} />;
        }

        if (action.includes("returned")) {
            return <RotateCcw size={18} />;
        }

        if (action.includes("borrowed")) {
            return <BookOpen size={18} />;
        }

        if (action.includes("overdue")) {
            return <AlertCircle size={18} />;
        }

        if (type === "student") {
            return <UserPlus size={18} />;
        }

        if (type === "staff" || type === "employee") {
            return <User size={18} />;
        }

        if (type === "user") {
            return <Users size={18} />;
        }

        if (type === "book") {
            return <LibraryBig size={18} />;
        }

        return <BookOpen size={18} />;
    };

    const getIconClass = (log) => {
        const action = String(log.action || "").toLowerCase();

        if (action.includes("deleted")) return "log-action-icon delete";
        if (action.includes("edited")) return "log-action-icon edit";
        if (action.includes("returned")) return "log-action-icon return";
        if (action.includes("borrowed")) return "log-action-icon borrow";

        return "log-action-icon";
    };

    const getTransactionAction = (item, entityName) => {
        if (item?.cancelled === true || item?.cancelled === 1) {
            return `${entityName} Deleted`;
        }

        if (
            item?.updated_at &&
            item?.created_at &&
            new Date(item.updated_at).getTime() !== new Date(item.created_at).getTime()
        ) {
            return `${entityName} Edited`;
        }

        return `${entityName} Created`;
    };

    const getTransactionDate = (item) => {
        if (item?.cancelled === true || item?.cancelled === 1) {
            return item.cancelled_at || item.updated_at || item.created_at;
        }

        if (
            item?.updated_at &&
            item?.created_at &&
            new Date(item.updated_at).getTime() !== new Date(item.created_at).getTime()
        ) {
            return item.updated_at;
        }

        return item.created_at;
    };

    const getProcessedBy = (item) => {
        return (
            item?.cancelled_by ||
            item?.updated_by ||
            item?.created_by ||
            item?.processed_by ||
            null
        );
    };

    const allLogs = [
        ...(books?.results || []).map((item) => ({
            id: `book-${item.id}`,
            type: "book",
            created_at: getTransactionDate(item),
            action: getTransactionAction(item, "Book"),
            name: item.title || "Untitled Book",
            description: item.author || "-",
            status:
                item.cancelled === true || item.cancelled === 1
                    ? "Deleted"
                    : item.status || "Available",
            reference: item.accession_number || item.barcode || item.id,
            processed_by: getProcessedBy(item),
            raw: item,
        })),

        ...(borrowedBooks?.results || []).map((item) => ({
            id: `borrow-${item.id}`,
            type: "borrow",
            created_at:
                item.borrowed_date ||
                item.returned_date ||
                item.updated_at ||
                item.created_at,
            action:
                item.cancelled === true || item.cancelled === 1
                    ? "Borrow Deleted"
                    : item.updated_at &&
                        item.created_at &&
                        new Date(item.updated_at).getTime() !== new Date(item.created_at).getTime()
                        ? "Borrow Edited"
                        : item.is_returned
                            ? "Book Returned"
                            : item.due_date && new Date(item.due_date) < new Date()
                                ? "Book Overdue"
                                : "Book Borrowed",
            name:
                item.student_name ||
                item.employee_name ||
                item.borrower_name ||
                item.student?.name ||
                item.employee?.name ||
                "Borrower",
            description:
                item.book_title ||
                item.book?.title ||
                "Book",
            status:
                item.cancelled === true || item.cancelled === 1
                    ? "Deleted"
                    : item.status || (item.is_returned ? "Returned"
                        : item.due_date && new Date(item.due_date) < new Date()
                            ? "Overdue"
                            : item.status || "Borrowed"),
            reference: item.id,
            processed_by:
                item.cancelled_by ||
                item.updated_by ||
                item.created_by ||
                null,
            raw: item,
        })),

        ...(students?.results || []).map((item) => ({
            id: `student-${item.id}`,
            type: "student",
            created_at: getTransactionDate(item),
            action: getTransactionAction(item, "Student"),
            name: item.name || "Unnamed Student",
            description: item.id_number || "-",
            status:
                item.cancelled === true || item.cancelled === 1
                    ? "Deleted"
                    : item.active
                        ? "Active"
                        : "Inactive",
            reference: item.rfid_number || item.id,
            processed_by: getProcessedBy(item),
            raw: item,
        })),

        ...(staff?.results || []).map((item) => ({
            id: `staff-${item.id}`,
            type: "staff",
            created_at: getTransactionDate(item),
            action: getTransactionAction(item, "Staff"),
            name: item.name || "Unnamed Staff",
            description: item.id_number || "-",
            status:
                item.cancelled === true || item.cancelled === 1
                    ? "Deleted"
                    : item.active
                        ? "Active"
                        : "Inactive",
            reference: item.rfid_number || item.id,
            processed_by: getProcessedBy(item),
            raw: item,
        })),

        ...((users?.results || users || []).map((item) => ({
            id: `user-${item.id}`,
            type: "user",
            created_at:
                item.date_joined ||
                getTransactionDate(item),
            action:
                item.cancelled === true || item.cancelled === 1
                    ? "User Deleted"
                    : item.updated_at &&
                        item.created_at &&
                        new Date(item.updated_at).getTime() !== new Date(item.created_at).getTime()
                        ? "User Edited"
                        : "User Created",
            name: item.username || item.email || "Unnamed User",
            description: item.first_name || item.last_name || "-",
            status:
                item.cancelled === true || item.cancelled === 1
                    ? "Deleted"
                    : item.is_active
                        ? "Active"
                        : "Inactive",
            reference: item.id,
            processed_by: getProcessedBy(item),
            raw: item,
        }))),
    ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    const filteredLogs = allLogs.filter((log) => {
        if (!log.created_at) return false;

        const keyword = searchTerm.toLowerCase();

        const matchesSearch =
            !keyword ||
            String(log.name || "").toLowerCase().includes(keyword) ||
            String(log.description || "").toLowerCase().includes(keyword) ||
            String(log.reference || "").toLowerCase().includes(keyword) ||
            String(log.action || "").toLowerCase().includes(keyword);

        const matchesAction =
            actionFilter === "All" ||
            (actionFilter === "Created" && log.action.toLowerCase().includes("created")) ||
            (actionFilter === "Edited" && log.action.toLowerCase().includes("edited")) ||
            (actionFilter === "Deleted" && log.action.toLowerCase().includes("deleted")) ||
            (actionFilter === "Borrowed" && log.action.toLowerCase().includes("borrowed")) ||
            (actionFilter === "Returned" && log.action.toLowerCase().includes("returned")) ||
            (actionFilter === "Overdue" && log.action.toLowerCase().includes("overdue"));

        const logDate = new Date(log.created_at);

        const startDate = appliedDateRange.start
            ? new Date(`${appliedDateRange.start}T00:00:00`)
            : null;

        const endDate = appliedDateRange.end
            ? new Date(`${appliedDateRange.end}T23:59:59.999`)
            : null;

        const matchesDate =
            (!startDate || logDate >= startDate) &&
            (!endDate || logDate <= endDate);

        return matchesSearch && matchesAction && matchesDate;
    });

    const totalPages = Math.max(1, Math.ceil(filteredLogs.length / itemsPerPage));
    const paginatedLogs = filteredLogs.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    )

    const formatDateTime = (value) => {
        if (!value) return "-";

        return new Date(value).toLocaleString("en-PH", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true,
        });
    };

    const escapeCSV = (value) => {
        if (value === null || value === undefined) return '""';
        const stringValue = String(value).replace(/"/g, '""');
        return `"${stringValue}"`;
    };

    const handleDownloadCSV = () => {
        if (!filteredLogs.length) {
            alert("No transaction logs to export.");
            return;
        }

        const headers = [
            "Timestamp",
            "Action",
            "Name",
            "Description",
            "Status",
            "Reference",
            "Type",
        ];

        const rows = filteredLogs.map((log) => [
            formatDateTime(log.created_at),
            log.action || "",
            log.name || "",
            log.description || "",
            log.status || "",
            log.reference || "",
            log.type || "",
        ]);

        const csvContent = [
            headers.map(escapeCSV).join(","),
            ...rows.map((row) => row.map(escapeCSV).join(",")),
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.setAttribute(
            "download",
            `transaction_logs_${new Date().toISOString().slice(0, 10)}.csv`
        );
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(url);
    };

    const handlePrintLedger = async () => {
        if (!filteredLogs.length) {
            alert("No transaction logs to print.");
            return;
        }

        try {
            const html = buildLedgerHTML();
            const result = await window.api.invoke('print-ledger', html);

            if (!result?.success) {
                alert(result?.message || "Failed to print ledger.");
            }
        } catch (error) {
            console.error("Print error:", error);
            alert("Failed to print ledger.");
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            setSearchTerm(searchInput);
            setCurrentPage(1);
        }, 300);

        return () => clearTimeout(timer);
    }, [searchInput]);


    return (
        <div className="app-wrapper">
            <Sidebar isCollapsed={isCollapsed} onToggle={handleSidebarToggle} />

            <div className={`log-container ${isCollapsed ? "collapsed" : ""}`}>
                <div className="log-content">
                    <div className="log-wrapper">
                        <div className="log-filter-bar">
                            <div className="log-filter-group">
                                <span className="log-filter-label">Date Range</span>
                                <div className="log-filter-input-wrapper">
                                    <input
                                        className="log-filter-input"
                                        type="date"
                                        value={dateRange.start}
                                        onChange={(e) =>
                                            setDateRange({ ...dateRange, start: e.target.value })
                                        }
                                    />
                                    <span> - </span>
                                    <input
                                        className="log-filter-input"
                                        type="date"
                                        value={dateRange.end}
                                        onChange={(e) =>
                                            setDateRange({ ...dateRange, end: e.target.value })
                                        }
                                    />
                                </div>
                            </div>

                            <div className="log-filter-group">
                                <span className="log-filter-label">Member ID / Name</span>
                                <div className="log-filter-input-wrapper">
                                    <Search size={14} />
                                    <input
                                        className="log-filter-search"
                                        placeholder="Search student, borrow, staff, books..."
                                        value={searchInput}
                                        onChange={(e) => {
                                            setSearchInput(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="log-filter-group">
                                <span className="log-filter-label">Action Type</span>
                                <div className="log-filter-select-wrapper">
                                    <select
                                        className="log-filter-select"
                                        value={actionFilter}
                                        onChange={(e) => {
                                            setActionFilter(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                    >
                                        <option value="All">All</option>
                                        <option value="Created">Created</option>
                                        <option value="Edited">Edited</option>
                                        <option value="Deleted">Deleted</option>
                                        <option value="Borrowed">Borrowed</option>
                                        <option value="Returned">Returned</option>
                                        <option value="Overdue">Overdue</option>
                                    </select>
                                    <span className="log-select-arrow">
                                        <svg
                                            width="12"
                                            height="12"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2.5"
                                        >
                                            <polyline points="6 9 12 15 18 9" />
                                        </svg>
                                    </span>
                                </div>
                            </div>

                            <Button
                                variant='primary'
                                className="log-apply-btn"
                                onClick={() => {
                                    setAppliedDateRange(dateRange);
                                    setCurrentPage(1);
                                }}
                            >
                                Apply Filters
                            </Button>
                        </div>

                        <div className="log-card">
                            <div className="log-card-header">
                                <div>
                                    <h2 className="log-title">Log Entries</h2>
                                    <p className="log-subtitle">
                                        Showing {paginatedLogs.length} of {filteredLogs.length} transactions
                                    </p>
                                </div>

                                <div className="log-header-actions">
                                    <Button variant='primary' className="log-download-btn" onClick={handleDownloadCSV}>
                                        <svg
                                            width="14"
                                            height="14"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2.5"
                                        >
                                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                            <polyline points="7 10 12 15 17 10" />
                                            <line x1="12" y1="15" x2="12" y2="3" />
                                        </svg>
                                        Download CSV
                                    </Button>
                                    {/* <Button variant='secondary' className="log-print-btn" onClick={handlePrintLedger}>Print Ledger</Button> */}
                                </div>
                            </div>

                            <div className="log-table-header">
                                <span className="log-table-header-cell">Timestamp</span>
                                <span className="log-table-header-cell">Action</span>
                                <span className="log-table-header-cell">Name / Book / Member/ Borrow</span>
                                <span className="log-table-header-cell">Status</span>
                                <span className="log-table-header-cell align-right">Reference</span>
                            </div>

                            {isDataLoading ? (
                                <div className="log-table-loading">
                                    {Array.from({ length: 5 }).map((_, index) => (
                                        <div key={index} className="log-table-row log-skeleton-row">
                                            <div>
                                                <div className="skeleton skeleton-timestamp" />
                                            </div>

                                            <div className="log-action-cell">
                                                <div className="skeleton skeleton-icon" />
                                                <div className="skeleton skeleton-text-md" />
                                            </div>

                                            <div className="log-user-cell">
                                                <div className="skeleton skeleton-avatar" />
                                                <div>
                                                    <div className="skeleton skeleton-text-sm" />
                                                    <div className="skeleton skeleton-text-xs" />
                                                </div>
                                            </div>

                                            <div>
                                                <div className="skeleton skeleton-badge" />
                                            </div>

                                            <div>
                                                <div className="skeleton skeleton-text-sm" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : isError ? (
                                <div className="log-table-error">
                                    <div className="log-error-icon">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="12" cy="12" r="10" />
                                            <line x1="12" y1="8" x2="12" y2="12" />
                                            <line x1="12" y1="16" x2="12.01" y2="16" />
                                        </svg>
                                    </div>
                                    <p className="log-error-title">Failed to load logs</p>
                                    <p className="log-error-message">{isError}</p>
                                    <button className="log-error-retry" onClick={paginatedLogs}>
                                        Try again
                                    </button>
                                </div>
                            )
                                : (paginatedLogs.map((log) => (
                                    <div key={log.id} className="log-table-row">
                                        <div>
                                            <span className="log-timestamp">
                                                {log.created_at
                                                    ? new Date(log.created_at).toLocaleString("en-PH", {
                                                        year: "numeric",
                                                        month: "2-digit",
                                                        day: "2-digit",
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                        second: "2-digit",
                                                        hour12: true,
                                                    })
                                                    : "-"}
                                            </span>
                                        </div>

                                        <div className="log-action-cell">
                                            <span className={getIconClass(log)}>
                                                {renderLogIcon(log)}
                                            </span>
                                            {log.action || "No action"}
                                        </div>

                                        <div className="log-user-cell">
                                            {/* <div className="log-avatar">
                                                {(log.name?.charAt(0) || "?").toUpperCase()}
                                            </div> */}
                                            <div>
                                                <div className="log-user-name">{log.name || "Unnamed"}</div>
                                                <div className="log-member-id">{log.description || "-"}</div>
                                            </div>
                                        </div>

                                        <div>
                                            <span className="log-status-badge success">
                                                {log.status || "-"}
                                            </span>
                                        </div>

                                        <div className="log-reference">
                                            {log.reference || "-"}
                                        </div>
                                    </div>
                                )))}

                            <div className="log-footer">
                                <span className="log-page-info">
                                    Page {currentPage} of {totalPages}
                                </span>

                                <div className="log-pagination">
                                    <button
                                        className="log-page-btn"
                                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                    >
                                        <svg
                                            width="14"
                                            height="14"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2.5"
                                        >
                                            <polyline points="15 18 9 12 15 6" />
                                        </svg>
                                    </button>

                                    {[...Array(totalPages)].map((_, n) => (
                                        <button
                                            key={n}
                                            className={`log-page-btn${currentPage === n + 1 ? " active" : ""}`}
                                            onClick={() => setCurrentPage(n + 1)}
                                        >
                                            {n + 1}
                                        </button>
                                    ))}

                                    <button
                                        className="log-page-btn"
                                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                    >
                                        <svg
                                            width="14"
                                            height="14"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2.5"
                                        >
                                            <polyline points="9 18 15 12 9 6" />
                                        </svg>
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