import { useState, useCallback } from 'react'
import { fetchBooks, deleteBook } from '../../../Features/api'
import { toast } from 'react-toastify'

export const useBooks = (token) => {
  const [books, setBooks] = useState([])
  const [allBooks, setAllBooks] = useState([])
  const [sortedBooks, setSortedBooks] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isFetchingAll, setIsFetchingAll] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 0,
    totalItems: 0
  })
  const [sortConfig, setSortConfig] = useState({ column: '', direction: '' })
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, bookId: null, bookTitle: '' })

  const fetchBooksData = useCallback(
    async (page = 1, search = '') => {
      setIsLoading(true)
      try {
        const data = await fetchBooks(token, page, search)
        setBooks(data.results)
        setPagination({
          currentPage: page,
          totalPages: Math.ceil(data.count / 10),
          totalItems: data.count
        })
      } catch (error) {
        toast.error('Failed to fetch books')
        console.error('Error fetching books:', error)
      } finally {
        setIsLoading(false)
      }
    },
    [token]
  )

  const handlePageChange = (newPage) => {
    fetchBooksData(newPage)
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

  const handleDeleteBook = async (id, bookTitle) => {
    // Open confirmation modal
    setDeleteConfirm({ isOpen: true, bookId: id, bookTitle: bookTitle || 'this book' })
  }

  const confirmDelete = async () => {
    const { bookId } = deleteConfirm
    setIsDeleting(true)

    try {
      await deleteBook(token, bookId)
      window.showToast('Success', 'Book deleted successfully!', 'success', 4000)

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
      window.showToast('Error', 'Failed to delete book', 'error', 4000)
    } finally {
      setIsDeleting(false)
      setDeleteConfirm({ isOpen: false, bookId: null, bookTitle: '' })
    }
  }

  const cancelDelete = () => {
    setDeleteConfirm({ isOpen: false, bookId: null, bookTitle: '' })
  }

  const handleSort = (column) => {
    const direction =
      sortConfig.column === column && sortConfig.direction === 'asc' ? 'desc' : 'asc'
    setSortConfig({ column, direction })

    const sortedBooks = [...books].sort((a, b) => {
      if (a[column] < b[column]) return direction === 'asc' ? -1 : 1
      if (a[column] > b[column]) return direction === 'asc' ? 1 : -1
      return 0
    })

    setBooks(sortedBooks)
  }

  return {
    books,
    allBooks,
    sortedBooks,
    isLoading,
    isFetchingAll,
    pagination,
    sortConfig,
    deleteConfirm,
    isDeleting,
    fetchBooksData,
    fetchAllBooks,
    handleDeleteBook,
    confirmDelete,
    cancelDelete,
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
