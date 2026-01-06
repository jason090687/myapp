import { useEffect, useState, useCallback } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import BooksHeader from '../components/Books/components/BooksHeader'
import BooksTable from '../components/Books/components/BooksTable'
import BookGrid from '../components/Books/components/BookGrid'
import { useBooks } from '../components/Books/hooks/useBooks'
import { useBookModals } from '../components/Books/hooks/useBookModals'
import { useBookSearch } from '../components/Books/hooks/useBookSearch'
import './Books.css'
import BookDetailsModal from '../components/Books/components/BookDetailsModal'
import ConfirmDeleteModal from '../components/Books/components/ConfirmDeleteModal'
import ErrorBoundary from '../components/ErrorBoundary'
import ToastContainer from '../components/Toast/ToastContainer'

function Books() {
  const navigate = useNavigate()
  const [isCollapsed, setIsCollapsed] = useState(window.innerWidth <= 768)
  const { token } = useSelector((state) => state.auth)

  const {
    books,
    isLoading,
    pagination,
    fetchBooksData,
    handleDeleteBook,
    handlePageChange,
    deleteConfirm,
    isDeleting,
    confirmDelete,
    cancelDelete
  } = useBooks(token)

  const { debouncedSearchTerm, handleSearch } = useBookSearch()

  const { handleAddBook, handleEditBook } = useBookModals()

  const handleExportToCSV = useCallback(() => {
    // Filter out cancelled books
    const booksToExport = books.filter((book) => !book.cancelled)

    if (booksToExport.length === 0) {
      return
    }

    // Define CSV headers
    const headers = [
      'Title',
      'Author',
      'ISBN',
      'Publisher',
      'Year',
      'Category',
      'Status',
      'Copies',
      'Available',
      'Date Received',
      'Accession Number'
    ]

    // Convert books data to CSV rows
    const csvRows = [
      headers.join(','),
      ...booksToExport.map((book) =>
        [
          `"${(book.title || '').replace(/"/g, '""')}"`,
          `"${(book.author || '').replace(/"/g, '""')}"`,
          `"${book.isbn || ''}"`,
          `"${(book.publisher || '').replace(/"/g, '""')}"`,
          book.year || '',
          `"${(book.category || '').replace(/"/g, '""')}"`,
          `"${book.status || ''}"`,
          book.copies || 0,
          book.available_copies || 0,
          book.date_received || '',
          `"${book.accession_number || ''}"`
        ].join(',')
      )
    ]

    // Create CSV content
    const csvContent = csvRows.join('\n')

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)

    link.setAttribute('href', url)
    link.setAttribute('download', `books_export_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }, [books])

  const handleGridDelete = useCallback(
    (book) => {
      handleDeleteBook(book.id, book.title)
    },
    [handleDeleteBook]
  )

  const handleGridViewDetails = useCallback((book) => {
    setSelectedBook(book)
    setIsDetailsModalOpen(true)
  }, [])

  const [windowWidth, setWindowWidth] = useState(window.innerWidth)
  const [selectedBook, setSelectedBook] = useState(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [viewMode, setViewMode] = useState('table')
  const [selectedCategory, setSelectedCategory] = useState('')

  const handleCategoryChange = useCallback((category) => {
    setSelectedCategory(category)
  }, [])

  // Filter books by category
  const filteredBooks = books.filter((book) => {
    if (book.cancelled) return false
    if (!selectedCategory) return true
    return book.category === selectedCategory
  })

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth)
      if (window.innerWidth > 1500) {
        setIsDetailsModalOpen(false)
        setSelectedBook(null)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleRowClick = useCallback(
    (book) => {
      navigate(`/books/edit-book/${book.id}`)
    },
    [navigate]
  )

  const handleCloseDetailsModal = useCallback(() => {
    setIsDetailsModalOpen(false)
    const timer = setTimeout(() => {
      setSelectedBook(null)
    }, 300)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    fetchBooksData(1, debouncedSearchTerm)
  }, [debouncedSearchTerm, fetchBooksData])

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setIsCollapsed(true)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    return () => {
      handleCloseDetailsModal()
    }
  }, [handleCloseDetailsModal])

  return (
    <div className="app-wrapper">
      <Sidebar isCollapsed={isCollapsed} onToggle={() => setIsCollapsed(!isCollapsed)} />
      <div className={`books-container ${isCollapsed ? 'collapsed' : ''}`}>
        <ErrorBoundary>
          <div className="books-content">
            <BooksHeader
              onSearch={handleSearch}
              onAddBook={handleAddBook}
              token={token}
              onRefresh={fetchBooksData}
              onCategoryChange={handleCategoryChange}
              selectedCategory={selectedCategory}
              viewMode={viewMode}
              onViewChange={setViewMode}
              onExport={handleExportToCSV}
            />

            {viewMode === 'grid' ? (
              <BookGrid
                books={filteredBooks}
                isLoading={isLoading}
                onEditBook={handleEditBook}
                onDeleteBook={handleGridDelete}
                onViewDetails={handleGridViewDetails}
              />
            ) : (
              <BooksTable
                books={filteredBooks}
                isLoading={isLoading}
                onEditBook={handleEditBook}
                onDeleteBook={handleDeleteBook}
                onRowClick={handleRowClick}
                pagination={pagination}
                onPageChange={handlePageChange}
              />
            )}
          </div>
        </ErrorBoundary>
      </div>

      <ErrorBoundary>
        {selectedBook && isDetailsModalOpen && (
          <BookDetailsModal
            key={`modal-${selectedBook.id}`}
            book={selectedBook}
            isOpen={true}
            onClose={handleCloseDetailsModal}
            onEdit={handleEditBook}
            onDelete={handleDeleteBook}
          />
        )}
      </ErrorBoundary>

      <ConfirmDeleteModal
        isOpen={deleteConfirm.isOpen}
        bookTitle={deleteConfirm.bookTitle}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        isDeleting={isDeleting}
      />

      <ToastContainer />
    </div>
  )
}

export default Books
