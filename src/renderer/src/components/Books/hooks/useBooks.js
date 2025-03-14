import { useState, useEffect } from 'react'
import { fetchBooks, deleteBook } from '../../../Features/api'
import { toast } from 'react-toastify'
import { sortData } from '../utils/bookUtils'

export const useBooks = (token) => {
  const [books, setBooks] = useState([])
  const [allBooks, setAllBooks] = useState([])
  const [sortedBooks, setSortedBooks] = useState(null)
  const [isLoading, setLoading] = useState(false)
  const [isFetchingAll, setIsFetchingAll] = useState(false)
  const [pagination, setPagination] = useState({
    count: 0,
    next: null,
    previous: null,
    currentPage: 1
  })
  const [sortConfig, setSortConfig] = useState({
    column: null,
    direction: null
  })

  const fetchBooksData = async (page = 1, searchTerm = '') => {
    setLoading(true)
    try {
      const response = await fetchBooks(token, page, searchTerm)
      if (response) {
        const booksData = response.results.map(mapBookData)
        setBooks(booksData)
        setPagination({
          count: response.count,
          next: response.next,
          previous: response.previous,
          currentPage: page
        })
      }
    } catch (error) {
      console.error('Error fetching books', error)
      toast.error('Failed to fetch books. Please try again.', {
        position: 'top-right',
        autoClose: 3000
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = async (newPage) => {
    if (newPage < 1 || newPage > Math.ceil((sortedBooks || allBooks).length / 10)) return

    setLoading(true)
    try {
      // If we have sorted data, use it for pagination
      if (sortedBooks) {
        const startIndex = (newPage - 1) * 10
        const endIndex = startIndex + 10
        setBooks(sortedBooks.slice(startIndex, endIndex))
      } else {
        // Otherwise, fetch new page from server
        const startIndex = (newPage - 1) * 10
        const endIndex = startIndex + 10
        setBooks(allBooks.slice(startIndex, endIndex))
      }

      setPagination((prev) => ({
        ...prev,
        currentPage: newPage,
        previous: newPage > 1,
        next: newPage < Math.ceil((sortedBooks || allBooks).length / 10)
      }))
    } catch (error) {
      console.error('Error changing page:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAllBooks = async (searchTerm = '') => {
    setIsFetchingAll(true)
    try {
      let allData = []
      let currentPage = 1
      let hasMore = true

      while (hasMore) {
        const response = await fetchBooks(token, currentPage, searchTerm)
        if (response && response.results) {
          const booksData = response.results.map(mapBookData)
          allData = [...allData, ...booksData]
          hasMore = response.next !== null
          currentPage++
        } else {
          hasMore = false
        }
      }

      setAllBooks(allData)
      setSortedBooks(null)
      setSortConfig({ column: null, direction: null })

      // Set initial page view
      setBooks(allData.slice(0, 10))
      setPagination({
        count: allData.length,
        next: allData.length > 10,
        previous: false,
        currentPage: 1
      })
      // Removed success toast notification
    } catch (error) {
      console.error('Error fetching all books:', error)
      toast.error('Failed to load all books. Please try again.', {
        position: 'top-right',
        autoClose: 3000
      })
    } finally {
      setIsFetchingAll(false)
    }
  }

  const handleDeleteBook = async (id) => {
    try {
      await deleteBook(token, id)
      toast.success('Book deleted successfully')

      // Refetch the current page data to fill the gap
      await fetchBooksData(pagination.currentPage)

      // If we're on a page with only one item, go to previous page
      if (books.length === 1 && pagination.currentPage > 1) {
        await fetchBooksData(pagination.currentPage - 1)
      } else {
        // Otherwise just refresh current page
        await fetchBooksData(pagination.currentPage)
      }

      // Also update the full book list if it exists
      if (allBooks.length > 0) {
        await fetchAllBooks()
      }
    } catch (error) {
      console.error('Error deleting book:', error)
      toast.error('Failed to delete book')
    }
  }

  const handleSort = (column) => {
    setLoading(true)
    try {
      const direction =
        sortConfig.column === column && sortConfig.direction === 'asc' ? 'desc' : 'asc'
      const sorted = sortData(allBooks, column, direction)
      setSortedBooks(sorted)
      setSortConfig({ column, direction })

      // Update current page view with sorted data
      const startIndex = (pagination.currentPage - 1) * 10
      const endIndex = startIndex + 10
      setBooks(sorted.slice(startIndex, endIndex))

      setPagination((prev) => ({
        ...prev,
        count: sorted.length,
        next: endIndex < sorted.length,
        previous: startIndex > 0
      }))
    } catch (error) {
      console.error('Error sorting books:', error)
      toast.error('Failed to sort books')
    } finally {
      setLoading(false)
    }
  }

  return {
    books,
    allBooks,
    sortedBooks,
    isLoading,
    isFetchingAll,
    pagination,
    sortConfig,
    fetchBooksData,
    fetchAllBooks,
    handleDeleteBook,
    setBooks,
    setSortedBooks,
    setPagination,
    setSortConfig,
    handlePageChange,
    handleSort,
    totalPages: Math.ceil((sortedBooks || allBooks).length / 10)
  }
}

const mapBookData = (book) => ({
  id: book.id,
  title: book.title,
  author: book.author,
  seriesTitle: book.series_title,
  publisher: book.publisher,
  placeOfPublication: book.place_of_publication,
  year: book.year,
  edition: book.edition,
  volume: book.volume,
  physicalDescription: book.physical_description,
  isbn: book.isbn,
  accessionNo: book.accession_number,
  call_number: book.call_number,
  barcode: book.barcode,
  dateReceived: book.date_received,
  subject: book.subject,
  dateProcessed: book.date_processed,
  processedBy: book.name,
  status: book.status,
  copies: book.copies,
  copy_number: book.copy_number || '1 of ' + (book.copies || 1)
})
