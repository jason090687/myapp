import { useEffect, useState } from 'react'
import {
  FaSearch,
  FaPlus,
  FaChevronLeft,
  FaChevronRight,
  FaSortUp,
  FaSortDown
} from 'react-icons/fa'
import Sidebar from '../components/Sidebar'
import './Books.css'
import { fetchBooks, addNewBook, deleteBook } from '../Features/api'
import { useSelector } from 'react-redux'
import AddBookModal from '../components/AddBookModal'
import EditBookModal from '../components/EditBookModal'
import { Bounce, toast } from 'react-toastify'

function Books() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [isLoading, setLoading] = useState(false)
  const [books, setBooks] = useState([])
  const [pagination, setPagination] = useState({
    count: 0,
    next: null,
    previous: null,
    currentPage: 1
  })
  const { token, user } = useSelector((state) => state.auth)

  // Initialize both modal states as false
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBook, setEditingBook] = useState(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  const [sortConfig, setSortConfig] = useState({
    column: null,
    direction: null
  }) // Add this new state

  const [allBooks, setAllBooks] = useState([])
  const [isFetchingAll, setIsFetchingAll] = useState(false)
  const [sortedBooks, setSortedBooks] = useState(null) // Add this new state
  const notifySuccess = () =>
    toast.success({
      position: 'top-right',
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: 'light',
      transition: Bounce
    })

  const notifyError = () =>
    toast.error('Failed to borrow book!', {
      position: 'top-right',
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: 'light',
      transition: Bounce
    })

  // Add debounce effect for search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchTerm])

  // Update fetchBooksData to include search term
  const fetchBooksData = async (page = 1) => {
    setLoading(true)
    try {
      const response = await fetchBooks(token, page, debouncedSearchTerm)
      if (response) {
        const booksData = response.results.map((book) => ({
          id: book.id, // Add this line to include the book ID
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
          status: book.status
        }))
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
    } finally {
      setLoading(false)
    }
  }

  // Add function to fetch all pages
  const fetchAllBooks = async () => {
    setIsFetchingAll(true)
    try {
      let allData = []
      let currentPage = 1
      let hasMore = true

      while (hasMore) {
        const response = await fetchBooks(token, currentPage, debouncedSearchTerm)
        if (response && response.results) {
          const booksData = response.results.map((book) => ({
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
            status: book.status
          }))
          allData = [...allData, ...booksData]

          hasMore = response.next !== null
          currentPage++
        } else {
          hasMore = false
        }
      }

      setAllBooks(allData)
      setSortedBooks(null) // Reset sorted data
      setSortConfig({ column: null, direction: null }) // Reset sort config

      // Set initial page view
      setBooks(allData.slice(0, 10))
      setPagination((prev) => ({
        ...prev,
        count: allData.length,
        currentPage: 1
      }))
    } catch (error) {
      console.error('Error fetching all books', error)
    } finally {
      setIsFetchingAll(false)
    }
  }

  // Update the edit button handler
  const handleEditBook = (book) => {
    setEditingBook(null) // Reset first
    setIsEditModalOpen(false) // Reset modal state
    // Short delay to ensure state is cleared before setting new values
    setTimeout(() => {
      setEditingBook(book)
      setIsEditModalOpen(true)
      setIsModalOpen(false)
    }, 0)
  }

  const handleSubmitBook = async (bookData) => {
    try {
      if (editingBook) {
        await updateBook(token, { ...editingBook, ...bookData }) // Update the existing book
      } else {
        await addNewBook(token, bookData) // Add new book
      }
      setIsModalOpen(false)
      setEditingBook(null)
      await fetchBooksData(pagination.currentPage)
      notifySuccess(editingBook ? 'Book updated successfully!' : 'Book added successfully!')
    } catch (error) {
      console.error('Error saving book:', error)
    }
  }

  useEffect(() => {
    fetchAllBooks()
  }, [token])

  // Update search effect
  useEffect(() => {
    fetchAllBooks() // Reset to first page when search term changes
  }, [debouncedSearchTerm])

  const handleSidebarToggle = () => {
    setIsCollapsed(!isCollapsed)
  }

  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
  }

  // Remove the local filtering since we're using API search
  const filteredBooks = books

  // Update the handleAddBook function
  const handleAddBook = () => {
    setIsModalOpen(true)
    setIsEditModalOpen(false) // Close the edit modal if it's open
    setEditingBook(null) // Reset any editing state
  }

  // Update the close handlers to reset all modal states
  const handleCloseModal = () => {
    setIsModalOpen(false)
  }

  const sortData = (data, column, direction) => {
    return [...data].sort((a, b) => {
      let aValue = a[column]
      let bValue = b[column]

      // Convert to lowercase for string comparison
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
      }

      // Handle numeric sorting for year
      if (column === 'year') {
        aValue = Number(aValue) || 0
        bValue = Number(bValue) || 0
      }

      if (aValue < bValue) {
        return direction === 'asc' ? -1 : 1
      }
      if (aValue > bValue) {
        return direction === 'asc' ? 1 : -1
      }
      return 0
    })
  }

  // Modify handleSort to use separate sorted state
  const handleSort = (columnName) => {
    let direction = 'asc'
    if (sortConfig.column === columnName && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ column: columnName, direction })

    // Sort all books
    const sorted = sortData(allBooks, columnName, direction)
    setSortedBooks(sorted)

    // Update current page view with sorted data
    const startIndex = (pagination.currentPage - 1) * 10
    const endIndex = startIndex + 10
    setBooks(sorted.slice(startIndex, endIndex))
  }

  // Modify handlePageChange to use either sorted or unsorted data
  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return

    const startIndex = (newPage - 1) * 10
    const endIndex = startIndex + 10
    const dataToUse = sortedBooks || allBooks
    setBooks(dataToUse.slice(startIndex, endIndex))
    setPagination((prev) => ({
      ...prev,
      currentPage: newPage,
      previous: newPage > 1,
      next: newPage < totalPages
    }))
  }

  // Update totalPages calculation
  const totalPages = Math.ceil((sortedBooks || allBooks).length / 10)

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false)
    setTimeout(() => {
      setEditingBook(null) // Clear the editing book after modal closes
    }, 100)
  }

  const handleEditSubmit = async () => {
    try {
      setIsEditModalOpen(false)
      setEditingBook(null)
      await fetchBooksData(pagination.currentPage) // Refresh the books list
      // Remove the alert since EditBookModal will handle its own success state
    } catch (error) {
      console.error('Error updating book:', error)
      throw error
    }
  }

  const handleDeleteBook = async (bookId) => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      try {
        const result = await deleteBook(token, bookId)
        if (result) {
          // Remove book from local state
          setBooks((prevBooks) => prevBooks.filter((book) => book.id !== bookId))
          // Update pagination count
          setPagination((prev) => ({
            ...prev,
            count: Math.max(0, prev.count - 1)
          }))
          alert('Book deleted successfully!')
        }
      } catch (error) {
        console.error('Error deleting book:', error)
        alert(error.message || 'Failed to delete book')
      }
    }
  }

  return (
    <div className="app-wrapper">
      <Sidebar isCollapsed={isCollapsed} onToggle={handleSidebarToggle} />
      <div className={`books-container ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="books-content">
          {/* Header */}
          <div className="books-header">
            <div className="search-bar">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search books..."
                onChange={handleSearch}
                className="search-input"
              />
            </div>
            <button className="add-book-btn" onClick={handleAddBook}>
              <FaPlus /> Add New Book
            </button>
          </div>

          {/* Table Container */}
          <div className="table-container">
            <div className="books-table-wrapper">
              <table className="books-table">
                <thead>
                  <tr>
                    <th className="col-title sortable" onClick={() => handleSort('title')}>
                      <div className="header-content">
                        TITLE
                        {sortConfig.column === 'title' && (
                          <span className="sort-icon">
                            {sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />}
                          </span>
                        )}
                      </div>
                    </th>
                    <th className="col-author sortable" onClick={() => handleSort('author')}>
                      <div className="header-content">
                        AUTHOR
                        {sortConfig.column === 'author' && (
                          <span className="sort-icon">
                            {sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />}
                          </span>
                        )}
                      </div>
                    </th>
                    <th className="col-series">SERIES TITLE</th>
                    <th className="col-publisher sortable" onClick={() => handleSort('publisher')}>
                      <div className="header-content">
                        PUBLISHER
                        {sortConfig.column === 'publisher' && (
                          <span className="sort-icon">
                            {sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />}
                          </span>
                        )}
                      </div>
                    </th>
                    <th className="col-place">PLACE OF PUBLICATION</th>
                    <th className="col-year sortable" onClick={() => handleSort('year')}>
                      <div className="header-content">
                        YEAR
                        {sortConfig.column === 'year' && (
                          <span className="sort-icon">
                            {sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />}
                          </span>
                        )}
                      </div>
                    </th>
                    <th className="col-edition">EDITION</th>
                    <th className="col-volume">VOLUME</th>
                    <th className="col-physical">PHYSICAL DESCRIPTION</th>
                    <th className="col-isbn">ISBN</th>
                    <th className="col-accession">ACCESSION NUMBER</th>
                    <th className="col-barcode">BARCODE</th>
                    <th className="col-date">DATE RECEIVED</th>
                    <th className="col-subject">SUBJECT</th>
                    <th className="col-processed-date">DATE PROCESSED</th>
                    <th className="col-processor">PROCESSED BY</th>
                    <th className="col-status">STATUS</th>
                    <th className="col-action">ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan="18" className="loading-cell">
                        <div className="table-spinner"></div>
                        <span className="table-loading-text">Loading books...</span>
                      </td>
                    </tr>
                  ) : isFetchingAll ? (
                    <tr>
                      <td colSpan="18" className="loading-cell">
                        <div className="table-spinner"></div>
                        <span className="table-loading-text">Loading all books for sorting...</span>
                      </td>
                    </tr>
                  ) : filteredBooks.length === 0 ? (
                    <tr>
                      <td colSpan="18" style={{ textAlign: 'center', padding: '20px' }}>
                        No books found
                      </td>
                    </tr>
                  ) : (
                    filteredBooks.map((book, index) => (
                      <tr key={index}>
                        <td className="col-title" data-content={book.title}>
                          {book.title}
                        </td>
                        <td className="col-author" data-content={book.author}>
                          {book.author}
                        </td>
                        <td className="col-series" data-content={book.seriesTitle}>
                          {book.seriesTitle}
                        </td>
                        <td className="col-publisher" data-content={book.publisher}>
                          {book.publisher}
                        </td>
                        <td className="col-place" data-content={book.placeOfPublication}>
                          {book.placeOfPublication}
                        </td>
                        <td className="col-year" data-content={book.year}>
                          {book.year}
                        </td>
                        <td className="col-edition" data-content={book.edition}>
                          {book.edition}
                        </td>
                        <td className="col-volume" data-content={book.volume}>
                          {book.volume}
                        </td>
                        <td className="col-physical" data-content={book.physicalDescription}>
                          {book.physicalDescription}
                        </td>
                        <td className="col-isbn" data-content={book.isbn}>
                          {book.isbn}
                        </td>
                        <td className="col-accession" data-content={book.accessionNo}>
                          {book.accessionNo}
                        </td>
                        <td className="col-barcode" data-content={book.barcode}>
                          {book.barcode}
                        </td>
                        <td className="col-date" data-content={book.dateReceived}>
                          {book.dateReceived}
                        </td>
                        <td className="col-subject" data-content={book.subject}>
                          {book.subject}
                        </td>
                        <td className="col-processed-date" data-content={book.dateProcessed}>
                          {book.dateProcessed}
                        </td>
                        <td className="col-processor" data-content={book.processedBy}>
                          {book.processedBy}
                        </td>
                        <td className="col-status">
                          <span className={`status-badge ${book.status.toLowerCase()}`}>
                            {book.status}
                          </span>
                        </td>
                        <td className="col-action">
                          <div className="action-buttons-container">
                            <button
                              className="action-btn edit"
                              onClick={() => handleEditBook(book)}
                            >
                              Edit
                            </button>
                            <button
                              className="action-btn delete"
                              onClick={() => handleDeleteBook(book.id)}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="pagination">
              <button
                className="pagination-btn"
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
              >
                <FaChevronLeft />
              </button>

              <span className="pagination-info">
                Page {pagination.currentPage} of {totalPages}
                <span className="pagination-total">
                  (Total: {(sortedBooks || allBooks).length})
                </span>
              </span>

              <button
                className="pagination-btn"
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage >= totalPages}
              >
                <FaChevronRight />
              </button>
            </div>
          </div>
        </div>
      </div>
      <AddBookModal
        isOpen={isModalOpen} // Simplified condition
        onClose={handleCloseModal}
        onSubmit={handleSubmitBook}
        currentUser={user}
      />
      <EditBookModal
        isOpen={isEditModalOpen && editingBook !== null}
        onClose={handleCloseEditModal}
        onSubmit={handleEditSubmit}
        bookData={editingBook}
        currentUser={user}
      />
    </div>
  )
}

export default Books
