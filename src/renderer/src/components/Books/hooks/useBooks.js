import { useState, useEffect } from 'react'
import { fetchBooks, deleteBook } from '../../../Features/api'
import { toast } from 'react-toastify'

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
      toast.success('Successfully loaded all books', {
        position: 'top-right',
        autoClose: 2000
      })
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

  const handleDeleteBook = async (bookId) => {
    // Create a custom toast for confirmation
    const confirmToastId = toast(
      <div className="delete-confirmation">
        <p>Are you sure you want to delete this book?</p>
        <div className="delete-actions">
          <button
            onClick={() => {
              executeDelete(bookId)
              toast.dismiss(confirmToastId)
            }}
            className="confirm-delete"
          >
            Delete
          </button>
          <button onClick={() => toast.dismiss(confirmToastId)} className="cancel-delete">
            Cancel
          </button>
        </div>
      </div>,
      {
        position: 'top-center',
        autoClose: false,
        closeOnClick: false,
        draggable: false,
        closeButton: false,
        className: 'delete-toast'
      }
    )
  }

  const executeDelete = async (bookId) => {
    try {
      await deleteBook(token, bookId)
      setBooks((prevBooks) => prevBooks.filter((book) => book.id !== bookId))
      setAllBooks((prevBooks) => prevBooks.filter((book) => book.id !== bookId))
      setPagination((prev) => ({
        ...prev,
        count: Math.max(0, prev.count - 1)
      }))
      toast.success('Book deleted successfully', {
        position: 'top-right',
        autoClose: 2000
      })
      return true
    } catch (error) {
      console.error('Error deleting book:', error)
      toast.error('Failed to delete book. Please try again.', {
        position: 'top-right',
        autoClose: 3000
      })
      return false
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
  barcode: book.barcode,
  dateReceived: book.date_received,
  subject: book.subject,
  dateProcessed: book.date_processed,
  processedBy: book.name,
  status: book.status,
  copies: book.copies || 1,
  copy_number: book.copy_number || '1 of ' + (book.copies || 1)
})
