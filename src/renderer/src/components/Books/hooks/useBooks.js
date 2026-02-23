import { useState, useCallback, useEffect } from 'react'
import { fetchBooks, deleteBook, fetchUserDetails } from '../../../Features/api'
import { toast } from 'react-toastify'
import { useActivity } from '../../../context/ActivityContext'

export const useBooks = (token) => {
  const { addActivity } = useActivity()
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
  const [userDetails, setUserDetails] = useState({})

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

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetchUserDetails(token)
        setUserDetails(response)
      } catch (error) {
        console.error('Error fetching user details:', error)
      }
    }
    fetchUser()
  }, [token])

  const handlePageChange = (newPage) => {
    fetchBooksData(newPage)
  }

  const handleDeleteBook = async (id, bookTitle) => {
    // Open confirmation modal
    setDeleteConfirm({ isOpen: true, bookId: id, bookTitle: bookTitle || 'this book' })
  }

  const confirmDelete = async () => {
    const { bookId, bookTitle } = deleteConfirm
    setIsDeleting(true)

    try {
      const userId = userDetails?.id
      const cancelData = {
        cancelledBy: parseInt(userId) || null,
        cancelledAt: new Date().toISOString()
      }

      console.log('Delete request - bookId:', bookId, 'cancelData:', cancelData)
      await deleteBook(token, bookId, cancelData)
      window.showToast('Success', 'Book deleted successfully!', 'success', 4000)

      // Log activity
      addActivity({
        type: 'book_deleted',
        description: `Cancelled "${bookTitle}"`
      })

      // // If we're on a page with only one item, go to previous page
      // if (books.length === 1 && pagination.currentPage > 1) {
      //   await fetchBooksData(pagination.currentPage - 1)
      // } else {
      //   // Otherwise just refresh current page
      //   await fetchBooksData(pagination.currentPage)
      // }

      const currentPage = pagination.currentPage
      const data = await fetchBooks(token, currentPage)

      // If page is now empty and not first page → move back one page
      if (data.results.length === 0 && currentPage > 1) {
        await fetchBooksData(currentPage - 1)
      } else {
        setBooks(data.results)
        setPagination({
          currentPage,
          totalPages: Math.ceil(data.count / 10),
          totalItems: data.count
        })
      }

      // Also update the full book list if it exists
      if (allBooks.length > 0) {
        await fetchBooksData()
      }
    } catch (error) {
      console.error('Error cancelling book:', error.message)
      console.error('Error details:', error.response?.data)
      window.showToast('Error', 'Failed to cancel book', 'error', 4000)
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
    // fetchAllBooks,
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
