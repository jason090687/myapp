import { isOverdue } from './dateUtils'

export const sortBorrowedBooks = (books) => {
  return books.sort((a, b) => {
    // First, sort by return status (not returned first)
    if (a.return_status === 'Not Returned' && b.return_status !== 'Not Returned') return -1
    if (a.return_status !== 'Not Returned' && b.return_status === 'Not Returned') return 1

    // Then sort by due date for not returned books
    if (a.return_status === 'Not Returned' && b.return_status === 'Not Returned') {
      return new Date(a.due_date) - new Date(b.due_date)
    }

    // For returned books, sort by return date (most recent last)
    return new Date(b.returned_date || 0) - new Date(a.returned_date || 0)
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
