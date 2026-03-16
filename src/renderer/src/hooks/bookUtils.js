export const sortData = (data, column, direction) => {
  return [...data].sort((a, b) => {
    let aValue = a[column]
    let bValue = b[column]

    // Handle null/undefined values
    if (!aValue && aValue !== 0) aValue = ''
    if (!bValue && bValue !== 0) bValue = ''

    // Convert to lowercase for string comparison
    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase()
      bValue = bValue.toLowerCase()
    }

    if (aValue < bValue) return direction === 'asc' ? -1 : 1
    if (aValue > bValue) return direction === 'asc' ? 1 : -1
    return 0
  })
}

export const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toISOString().split('T')[0]
}
