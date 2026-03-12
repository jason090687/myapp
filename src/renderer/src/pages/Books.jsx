import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import Sidebar from '../components/Sidebar'
import BooksHeader from '../components/Books/components/BooksHeader'
import BooksTable from '../components/Books/components/BooksTable'
import BookGrid from '../components/Books/components/BookGrid'
import { useBooks } from '../components/Books/hooks/useBooks'
import { useBookModals } from '../components/Books/hooks/useBookModals'
import './Books.css'
import BookDetailsModal from '../components/Books/components/BookDetailsModal'
import ConfirmDeleteModal from '../components/Books/components/ConfirmDeleteModal'
import ErrorBoundary from '../components/ErrorBoundary'
import ToastContainer from '../components/Toast/ToastContainer'
import ExportProgressModal from '../components/Books/components/ExportProgressModal'
import AddBookModal from '../components/Books/components/AddBooksModal'
import UpdateBookModal from '../components/Books/components/UpdateBooksModal'

function Books() {
  const [isCollapsed, setIsCollapsed] = useState(window.innerWidth <= 768)
  const { token } = useSelector((state) => state.auth)
  const [isAddBookOpen, setIsAddBookOpen] = useState(false)
  const [isEditBookOpen, setIsEditBookOpen] = useState(false)
  const [selectedBookId, setSelectedBookId] = useState(null)

  const [viewMode, setViewMode] = useState('table')

  const {
    books,
    isLoading,
    pagination,
    handleDeleteBook,
    handlePageChange,
    handleExportToCSV,
    handleGridViewDetails,
    handleCloseDetailsModal,
    handleRowClick,
    handleSearch,
    handleCategoryChange,
    exportProgress,
    selectedBook,
    isDetailsModalOpen,
    deleteConfirm,
    confirmDelete,
    cancelDelete,
    refetch
  } = useBooks(token)

  const handleEditBook = (book) => {
    setSelectedBookId(book.id)
    setIsEditBookOpen(true)
  }

  // const handleRowClick = (book) => {
  //   setSelectedBookId(book.id)
  //   setIsDetailsModalOpen(true)
  // }

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
              onAddBook={() => setIsAddBookOpen(true)}
              onCategoryChange={handleCategoryChange}
              token={token}
              viewMode={viewMode}
              onViewChange={setViewMode}
              onExport={handleExportToCSV}
              onRefresh={refetch}
              books={books}
            />

            {viewMode === 'grid' ? (
              <BookGrid
                books={books}
                isLoading={isLoading}
                onEditBook={handleEditBook}
                onDeleteBook={handleDeleteBook}
                onViewDetails={handleGridViewDetails}
                pagination={pagination}
                onPageChange={handlePageChange}
              />
            ) : (
              <BooksTable
                books={books}
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
      <AddBookModal
        isOpen={isAddBookOpen}
        onClose={() => setIsAddBookOpen(false)}
        onSuccess={() => refetch?.()}
      />
      <UpdateBookModal
        isOpen={isEditBookOpen}
        bookId={selectedBookId}
        onClose={() => setIsEditBookOpen(false)}
        onSuccess={() => refetch()}
      />

      {/* DETAILS MODAL */}
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

      {/* DELETE CONFIRMATION */}
      <ConfirmDeleteModal
        isOpen={deleteConfirm.isOpen}
        bookTitle={deleteConfirm.bookTitle}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />

      {/* EXPORT PROGRESS */}
      <ExportProgressModal
        isOpen={exportProgress.isOpen}
        progress={exportProgress.progress}
        currentPage={exportProgress.currentPage}
        totalPages={exportProgress.totalPages}
        exportedCount={exportProgress.exportedCount}
      />

      <ToastContainer />
    </div>
  )
}

export default Books
