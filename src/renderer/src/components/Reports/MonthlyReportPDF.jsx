import React from "react";
import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
    Font,
} from "@react-pdf/renderer";

// ── Fonts (built-in, no network fetch) ───────────────────────────────────────
Font.registerHyphenationCallback((word) => [word]);

// ── Helpers ───────────────────────────────────────────────────────────────────
const str = (val, fallback = "—") => {
    if (val === null || val === undefined) return fallback;
    const s = String(val).trim();
    return s === "" ? fallback : s;
};

const safeAction = (log) => str(log?.action, "").toLowerCase();

const fmtDateTime = (ts) => {
    if (!ts) return "—";
    const d = new Date(ts);
    if (isNaN(d)) return "—";
    return d.toLocaleString("en-PH", {
        year: "numeric", month: "2-digit", day: "2-digit",
        hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true,
    });
};

const fmtDate = (ts) => {
    if (!ts) return "—";
    const d = new Date(ts);
    if (isNaN(d)) return str(ts);
    return d.toLocaleDateString("en-PH", {
        year: "numeric", month: "2-digit", day: "2-digit",
    });
};

const shortId = (id) => {
    if (id === null || id === undefined) return "—";
    const s = String(id);
    return s.includes("-") ? s.split("-").pop() : s;
};

const groupByDate = (data) =>
    data.reduce((acc, log) => {
        const d = log.created_at ? new Date(log.created_at) : null;
        const date =
            d && !isNaN(d)
                ? d.toLocaleDateString("en-PH", { month: "long", day: "numeric", year: "numeric" })
                : "Unknown Date";
        (acc[date] = acc[date] || []).push(log);
        return acc;
    }, {});

// Sanitize a raw log so every field is a safe primitive
const sanitize = (log) => ({
    ...log,
    id: log.id != null ? String(log.id) : "",
    type: str(log.type, ""),
    action: str(log.action, ""),
    name: str(log.name, "—"),
    isbn: str(log.isbn, ""),
    created_at: log.created_at ?? null,
    due_date: log.due_date ?? null,
});

// ── Styles ────────────────────────────────────────────────────────────────────
const C = {
    black: "#111827",
    dark: "#374151",
    mid: "#6b7280",
    light: "#9ca3af",
    border: "#e5e7eb",
    stripe: "#f3f4f6",
    white: "#ffffff",
};

const s = StyleSheet.create({
    page: { fontFamily: "Helvetica", fontSize: 9, color: C.dark, backgroundColor: C.white, paddingTop: 28, paddingBottom: 36, paddingHorizontal: 32 },
    header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 8 },
    headerLeft: { flex: 1 },
    title: { fontFamily: "Helvetica-Bold", fontSize: 22, color: C.black, marginBottom: 2 },
    subtitle: { fontSize: 7, color: C.mid },
    headerRight: { flexDirection: "row", alignItems: "flex-end", gap: 18 },
    metaItem: { alignItems: "flex-end", gap: 2 },
    metaLabel: { fontFamily: "Helvetica-Bold", fontSize: 6, color: C.light, textTransform: "uppercase" },
    metaValue: { fontFamily: "Helvetica-Bold", fontSize: 7.5, color: C.dark },
    metaTotal: { fontFamily: "Helvetica-Bold", fontSize: 11, color: C.black },
    headerRule: { height: 2, backgroundColor: C.black, marginBottom: 12 },

    section: { marginBottom: 16 },
    sectionTitle: { fontFamily: "Helvetica-Bold", fontSize: 9.5, color: C.black, marginBottom: 4 },
    sectionRule: { height: 1, backgroundColor: C.border, marginBottom: 3 },
    dateGroup: { marginTop: 7 },
    dateLabel: { fontFamily: "Helvetica-Bold", fontSize: 6.5, color: C.mid, textTransform: "uppercase", marginBottom: 4 },

    table: { width: "100%" },
    thead: { flexDirection: "row", backgroundColor: C.stripe, borderTopWidth: 1, borderBottomWidth: 1, borderColor: C.border, paddingVertical: 4, paddingHorizontal: 6 },
    th: { fontFamily: "Helvetica-Bold", fontSize: 6, color: C.mid, textTransform: "uppercase" },
    row: { flexDirection: "row", borderBottomWidth: 1, borderColor: C.stripe, paddingVertical: 5, paddingHorizontal: 6 },
    td: { fontSize: 7.5, color: C.dark },

    colId: { width: "11%" },
    colDt: { width: "22%" },
    colName: { flex: 1 },
    colIsbn: { width: "19%" },
    colDue: { width: "15%" },
    colAct: { width: "18%" },
    colType: { width: "14%" },

    tdId: { fontFamily: "Courier", fontSize: 7, color: C.light },
    tdDt: { fontSize: 7, color: C.mid },
    tdBold: { fontFamily: "Helvetica-Bold", color: C.black },
    tdMono: { fontFamily: "Courier", fontSize: 7, color: C.mid },
    tdFaint: { fontSize: 7, color: C.light },

    empty: { fontSize: 8, color: C.light, textAlign: "center", paddingVertical: 28 },
    footer: { position: "absolute", bottom: 14, left: 32, right: 32, flexDirection: "row", justifyContent: "space-between", borderTopWidth: 1, borderColor: C.border, paddingTop: 5 },
    footerText: { fontSize: 6, color: C.light },
});

// ── Row wrapper ───────────────────────────────────────────────────────────────
const TR = ({ children }) => <View style={s.row}>{children}</View>;

// ── Tables ────────────────────────────────────────────────────────────────────
const BooksAddedTable = ({ rows }) => (
    <View style={s.table}>
        <View style={s.thead}>
            <Text style={[s.th, s.colId]}>ID</Text>
            <Text style={[s.th, s.colDt]}>Date / Time</Text>
            <Text style={[s.th, s.colName]}>Title</Text>
            <Text style={[s.th, s.colIsbn]}>ISBN</Text>
            <Text style={[s.th, s.colAct]}>Status</Text>
        </View>
        {rows.map((log) => (
            <TR key={log.id}>
                <Text style={[s.td, s.tdId, s.colId]}>{"#" + shortId(log.id)}</Text>
                <Text style={[s.td, s.tdDt, s.colDt]}>{fmtDateTime(log.created_at)}</Text>
                <Text style={[s.td, s.tdBold, s.colName]}>{str(log.name)}</Text>
                <Text style={[s.td, s.tdMono, s.colIsbn]}>{str(log.isbn, "—")}</Text>
                <Text style={[s.td, s.colAct]}>{str(log.action)}</Text>
            </TR>
        ))}
    </View>
);

const BooksBorrowedTable = ({ rows }) => (
    <View style={s.table}>
        <View style={s.thead}>
            <Text style={[s.th, s.colId]}>ID</Text>
            <Text style={[s.th, s.colDt]}>Date / Time</Text>
            <Text style={[s.th, s.colName]}>Borrower</Text>
            <Text style={[s.th, s.colDue]}>Due Date</Text>
            <Text style={[s.th, s.colAct]}>Status</Text>
        </View>
        {rows.map((log) => (
            <TR key={log.id}>
                <Text style={[s.td, s.tdId, s.colId]}>{"#" + shortId(log.id)}</Text>
                <Text style={[s.td, s.tdDt, s.colDt]}>{fmtDateTime(log.created_at)}</Text>
                <Text style={[s.td, s.tdBold, s.colName]}>{str(log.name)}</Text>
                <Text style={[s.td, s.tdFaint, s.colDue]}>{log.due_date ? fmtDate(log.due_date) : "No due date"}</Text>
                <Text style={[s.td, s.colAct]}>{str(log.action)}</Text>
            </TR>
        ))}
    </View>
);

const BooksReturnedTable = ({ rows }) => (
    <View style={s.table}>
        <View style={s.thead}>
            <Text style={[s.th, s.colId]}>ID</Text>
            <Text style={[s.th, s.colDt]}>Date / Time</Text>
            <Text style={[s.th, s.colName]}>Borrower</Text>
            <Text style={[s.th, s.colAct]}>Status</Text>
        </View>
        {rows.map((log) => (
            <TR key={log.id}>
                <Text style={[s.td, s.tdId, s.colId]}>{"#" + shortId(log.id)}</Text>
                <Text style={[s.td, s.tdDt, s.colDt]}>{fmtDateTime(log.created_at)}</Text>
                <Text style={[s.td, s.tdBold, s.colName]}>{str(log.name)}</Text>
                <Text style={[s.td, s.colAct]}>{str(log.action)}</Text>
            </TR>
        ))}
    </View>
);

const OtherLogsTable = ({ rows }) => (
    <View style={s.table}>
        <View style={s.thead}>
            <Text style={[s.th, s.colId]}>ID</Text>
            <Text style={[s.th, s.colDt]}>Date / Time</Text>
            <Text style={[s.th, s.colName]}>Name</Text>
            <Text style={[s.th, s.colAct]}>Action</Text>
            <Text style={[s.th, s.colType]}>Type</Text>
        </View>
        {rows.map((log) => (
            <TR key={log.id}>
                <Text style={[s.td, s.tdId, s.colId]}>{"#" + shortId(log.id)}</Text>
                <Text style={[s.td, s.tdDt, s.colDt]}>{fmtDateTime(log.created_at)}</Text>
                <Text style={[s.td, s.tdBold, s.colName]}>{str(log.name)}</Text>
                <Text style={[s.td, s.colAct]}>{str(log.action)}</Text>
                <Text style={[s.td, s.colType]}>{str(log.type)}</Text>
            </TR>
        ))}
    </View>
);

// ── Section ───────────────────────────────────────────────────────────────────
// IMPORTANT: react-pdf cannot handle `null` returned from a component used as
// a JSX child. Instead of returning null, render an empty fragment.
// All conditional rendering uses ternaries that always return a View/Text.
const Section = ({ title, data, TableComponent }) => {
    if (!data || data.length === 0) {
        // Return empty View — never return null from a react-pdf component
        return <View />;
    }
    const grouped = groupByDate(data);
    return (
        <View style={s.section}>
            <Text style={s.sectionTitle}>{title}</Text>
            <View style={s.sectionRule} />
            {Object.entries(grouped).map(([date, rows]) => (
                <View key={date} style={s.dateGroup}>
                    <Text style={s.dateLabel}>{date}</Text>
                    <TableComponent rows={rows} />
                </View>
            ))}
        </View>
    );
};

// ── Document ──────────────────────────────────────────────────────────────────
const MonthlyReportPDF = ({ logs = [] }) => {
    const safe = (Array.isArray(logs) ? logs : []).map(sanitize);

    const addedBooks = safe.filter((l) => l.type === "book" && safeAction(l).includes("created"));
    const borrowedBooks = safe.filter((l) => safeAction(l).includes("borrowed"));
    const returnedBooks = safe.filter((l) => safeAction(l).includes("returned"));
    const otherLogs = safe.filter(
        (l) => !addedBooks.includes(l) && !borrowedBooks.includes(l) && !returnedBooks.includes(l)
    );

    const now = new Date();
    const period = now.toLocaleDateString("en-PH", { month: "long", year: "numeric" });
    const generated = now.toLocaleString("en-PH", {
        month: "short", day: "2-digit", year: "numeric",
        hour: "2-digit", minute: "2-digit", hour12: true,
    });

    return (
        <Document
            title={"Monthly Report - " + period}
            author="Library Management System"
            subject="Transaction Summary"
        >
            <Page size="A4" style={s.page}>

                {/* Header */}
                <View style={s.header}>
                    <View style={s.headerLeft}>
                        <Text style={s.title}>Monthly Report</Text>
                        <Text style={s.subtitle}>{"Library Management System  Transaction Summary"}</Text>
                    </View>
                    <View style={s.headerRight}>
                        <View style={s.metaItem}>
                            <Text style={s.metaLabel}>{"Generated"}</Text>
                            <Text style={s.metaValue}>{generated}</Text>
                        </View>
                        <View style={s.metaItem}>
                            <Text style={s.metaLabel}>{"Period"}</Text>
                            <Text style={s.metaValue}>{period}</Text>
                        </View>
                        <View style={s.metaItem}>
                            <Text style={s.metaLabel}>{"Total Records"}</Text>
                            <Text style={[s.metaValue, s.metaTotal]}>{String(safe.length)}</Text>
                        </View>
                    </View>
                </View>

                <View style={s.headerRule} />

                {/* Sections — always rendered, show empty View when no data */}
                <Section title="Books Added" data={addedBooks} TableComponent={BooksAddedTable} />
                <Section title="Books Borrowed" data={borrowedBooks} TableComponent={BooksBorrowedTable} />
                <Section title="Books Returned" data={returnedBooks} TableComponent={BooksReturnedTable} />
                <Section title="Other Transactions" data={otherLogs} TableComponent={OtherLogsTable} />

                {/* Empty state — ternary instead of && to avoid rendering `false` */}
                {safe.length === 0
                    ? <Text style={s.empty}>{"No transactions found for this period."}</Text>
                    : <View />
                }

                {/* Footer */}
                <View style={s.footer} fixed>
                    <Text style={s.footerText}>{"Library Management System - Confidential"}</Text>
                    <Text style={s.footerText}>{period + " Report"}</Text>
                </View>

            </Page>
        </Document>
    );
};

export default MonthlyReportPDF;