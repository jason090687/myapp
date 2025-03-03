import { isOverdue } from './dateUtils'

export const sortBorrowedBooks = (books) => {
  if (!Array.isArray(books)) return []

  return [...books].sort((a, b) => {
    // First sort by return status
    if (a.is_returned !== b.is_returned) {
      return a.is_returned ? 1 : -1 // Unreturned books come first
    }

    // For unreturned books, sort by borrowed date (newest first)
    if (!a.is_returned && !b.is_returned) {
      // Convert dates to timestamps for comparison
      const dateA = new Date(a.borrowed_date).getTime()
      const dateB = new Date(b.borrowed_date).getTime()
      return dateB - dateA
    }

    // For returned books, sort by return date (newest first)
    return (
      new Date(b.returned_date || b.borrowed_date) - new Date(a.returned_date || a.borrowed_date)
    )
  })
}

export const getRowClassName = (item) => {
  if (!item || typeof item !== 'object') return ''

  let className = item.is_returned ? 'disabled-row' : ''
  if (!item.is_returned && isOverdue(item.due_date)) {
    className += ' overdue'
  }
  return className
}

export const getStatusBadgeClass = (item) => {
  if (!item || typeof item !== 'object') return 'borrowed'

  if (item.is_returned) return 'returned'
  if (item.paid && isOverdue(item.due_date)) return 'paid-overdue'
  return isOverdue(item.due_date) ? 'overdue' : 'borrowed'
}

export const getStatusText = (item) => {
  if (!item || typeof item !== 'object') return 'BORROWED'

  if (item.is_returned) return 'RETURNED'
  if (item.paid && isOverdue(item.due_date)) return 'PAID'
  return isOverdue(item.due_date) ? 'DUE' : 'BORROWED'
}
