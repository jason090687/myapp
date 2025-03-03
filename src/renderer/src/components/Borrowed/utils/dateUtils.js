export const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toISOString().split('T')[0]
}

export const isOverdue = (dueDate) => {
  if (!dueDate) return false
  try {
    const today = new Date()
    const due = new Date(dueDate)
    return !isNaN(due.getTime()) && due < today
  } catch {
    return false
  }
}
