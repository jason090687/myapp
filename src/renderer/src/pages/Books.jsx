import { useEffect, useState, useCallback } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import BooksHeader from '../components/Books/components/BooksHeader'
import BooksTable from '../components/Books/components/BooksTable'
import { useBooks } from '../components/Books/hooks/useBooks'
import { useBookModals } from '../components/Books/hooks/useBookModals'
import { useBookSearch } from '../components/Books/hooks/useBookSearch'
import './Books.css'
import Pagination from '../components/Pagination'
import BookDetailsModal from '../components/Books/components/BookDetailsModal'
import ErrorBoundary from '../components/ErrorBoundary'

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
    handlePageChange
  } = useBooks(token)

  const { debouncedSearchTerm, handleSearch } = useBookSearch()

  const { handleAddBook, handleEditBook } = useBookModals()

  const [windowWidth, setWindowWidth] = useState(window.innerWidth)
  const [selectedBook, setSelectedBook] = useState(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)

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
            />

            <BooksTable
              books={books}
              isLoading={isLoading}
              sortConfig={sortConfig}
              onSort={handleSort}
              onEditBook={handleEditBook}
              onDeleteBook={handleDeleteBook}
              onRowClick={handleRowClick}
            />

            {!isLoading && books.length > 0 && (
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                totalItems={pagination.totalItems}
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
    </div>
  )
}

export default Books
