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
  const { token, user } = useSelector((state) => state.auth)

  const {
    books,
    isLoading,
    pagination,
    sortConfig,
    fetchBooksData,
    handleDeleteBook,
    handleSort,
    handlePageChange,
    deleteConfirm,
    isDeleting,
    confirmDelete,
    cancelDelete
  } = useBooks(token)

  const { debouncedSearchTerm, handleSearch } = useBookSearch()

  const { handleAddBook, handleEditBook } = useBookModals()

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
              sortConfig={sortConfig}
              onSort={handleSort}
              viewMode={viewMode}
              onViewChange={setViewMode}
            />

            {viewMode === 'grid' ? (
              <BookGrid
                books={books.filter((book) => !book.cancelled)}
                isLoading={isLoading}
                onEditBook={handleEditBook}
                onDeleteBook={handleGridDelete}
                onViewDetails={handleGridViewDetails}
              />
            ) : (
              <BooksTable
                books={books.filter((book) => !book.cancelled)}
                isLoading={isLoading}
                sortConfig={sortConfig}
                onSort={handleSort}
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

      {windowWidth <= 1500 && (
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
      )}

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
