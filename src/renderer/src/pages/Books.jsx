import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import Sidebar from '../components/Sidebar'
import BooksHeader from '../components/Books/components/BooksHeader'
import BooksTable from '../components/Books/components/BooksTable'
import AddBookModal from '../components/AddBookModal'
import EditBookModal from '../components/EditBookModal'
import { useBooks } from '../components/Books/hooks/useBooks'
import { useBookModals } from '../components/Books/hooks/useBookModals'
import { useBookSearch } from '../components/Books/hooks/useBookSearch'
import './Books.css'
import Pagination from '../components/Pagination'
import BookDetailsModal from '../components/Books/components/BookDetailsModal'

function Books() {
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

  const { searchTerm, debouncedSearchTerm, handleSearch } = useBookSearch(() => {
    fetchBooksData(1, debouncedSearchTerm)
  })

  const {
    isModalOpen,
    isEditModalOpen,
    editingBook,
    handleAddBook,
    handleEditBook,
    handleCloseModal,
    handleCloseEditModal,
    handleSubmitBook,
    handleEditSubmit
  } = useBookModals(token, fetchBooksData, pagination.currentPage)

  const [selectedBook, setSelectedBook] = useState(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)

  const handleRowClick = (book) => {
    setSelectedBook(book)
    setIsDetailsModalOpen(true)
  }

  const handleCloseDetailsModal = () => {
    // First set selected book to null, then close modal
    setSelectedBook(null)
    setTimeout(() => {
      setIsDetailsModalOpen(false)
    }, 0)
  }

  useEffect(() => {
    fetchBooksData(1, debouncedSearchTerm)

    // Cleanup function to ensure modals are closed when component unmounts
    return () => {
      setIsDetailsModalOpen(false)
      setSelectedBook(null)
    }
  }, [debouncedSearchTerm])

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setIsCollapsed(true)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div className="app-wrapper">
      <Sidebar isCollapsed={isCollapsed} onToggle={() => setIsCollapsed(!isCollapsed)} />
      <div className={`books-container ${isCollapsed ? 'collapsed' : ''}`}>
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
      </div>

      <AddBookModal
        isOpen={isModalOpen}
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

      {isDetailsModalOpen && selectedBook && (
        <BookDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={handleCloseDetailsModal}
          book={selectedBook}
          onEdit={handleEditBook}
          onDelete={handleDeleteBook}
        />
      )}
    </div>
  )
}

export default Books
