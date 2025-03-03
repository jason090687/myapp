export const sortData = (data, column, direction) => {
  return [...data].sort((a, b) => {
    let aValue = a[column]
    let bValue = b[column]

    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase()
      bValue = bValue.toLowerCase()
    }

    if (column === 'year') {
      aValue = Number(aValue) || 0
      bValue = Number(bValue) || 0
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
