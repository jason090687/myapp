import { useState, useEffect } from 'react'

export const useBookSearch = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchTerm])

  const handleSearch = (value) => {
    setSearchTerm(value)
  }

  return {
    searchTerm,
    debouncedSearchTerm,
    handleSearch
  }
}
