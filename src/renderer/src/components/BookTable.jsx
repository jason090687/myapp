import { useEffect, useState, useCallback } from 'react'
// ...existing imports...

const BookTable = () => {
  // ...existing state...
  const [refreshKey, setRefreshKey] = useState(0)

  // Create memoized refresh function
  const handleRefresh = useCallback(() => {
    setRefreshKey((prev) => prev + 1)
  }, [])

  // Update useEffect to depend on refreshKey
  useEffect(() => {
    const loadBooks = async () => {
      try {
        const data = await fetchBooks(token, currentPage, searchQuery)
        setBooks(data.results)
        setTotalPages(Math.ceil(data.count / itemsPerPage))
        setTotalItems(data.count)
      } catch (error) {
        console.error('Error loading books:', error)
      }
    }

    loadBooks()
  }, [currentPage, searchQuery, refreshKey]) // Add refreshKey as dependency

  const handleAddBook = async (bookData) => {
    try {
      const result = await addNewBook(token, bookData)
      handleRefresh() // Refresh immediately after adding
      return result
    } catch (error) {
      console.error('Error adding book:', error)
      throw error
    }
  }

  return (
    <div>
      <AddBookModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddBook}
        currentUser={currentUser}
        onRefresh={handleRefresh}
      />
    </div>
  )
}

export default BookTable
