import { useState, useEffect, useCallback, useRef } from 'react'

export const useBorrowedSearch = (onSearch) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const searchTimeout = useRef(null)

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current)
      }
    }
  }, [])

  const handleSearch = useCallback((term) => {
    setSearchTerm(term)
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current)
    }
    searchTimeout.current = setTimeout(() => {
      setDebouncedSearchTerm(term)
    }, 500)
  }, [])

  useEffect(() => {
    if (onSearch && debouncedSearchTerm !== undefined) {
      onSearch(debouncedSearchTerm)
    }
  }, [debouncedSearchTerm, onSearch])

  return { searchTerm, handleSearch }
}
