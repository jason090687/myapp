import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import Sidebar from '../components/Sidebar'
import BooksHeader from '../components/Books/BooksHeader'
import BooksTable from '../components/Books/BooksTable'
import BookGrid from '../components/Books/BookGrid'
import { useBooks } from '../hooks/useBooks'
import './styles/Books.css'
import BookDetailsModal from '../components/Books/BookDetailsModal'
import ConfirmDeleteModal from '../components/Books/ConfirmDeleteModal'
import ErrorBoundary from '../components/ErrorBoundary'
import ToastContainer from '../components/Toast/ToastContainer'
import ExportProgressModal from '../components/Books/ExportProgressModal'
import AddBookModal from '../components/Books/AddBooksModal'
import UpdateBookModal from '../components/Books/UpdateBooksModal'

function Books() {
  const [isCollapsed, setIsCollapsed] = useState(window.innerWidth <= 768)
  const { token } = useSelector((state) => state.auth)
  const [isAddBookOpen, setIsAddBookOpen] = useState(false)
  const [isEditBookOpen, setIsEditBookOpen] = useState(false)
  const [selectedBookId, setSelectedBookId] = useState(null)
  const [selectedBook, setSelectedBook] = useState(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isImporting, setIsImporting] = useState(false)

  const [viewMode, setViewMode] = useState('table')

  const {
    books,
    isLoading,
    pagination,
    handleDeleteBook,
    handlePageChange,
    handleExportToCSV,
    handleSearch,
    handleCategoryChange,
    exportProgress,
    deleteConfirm,
    confirmDelete,
    cancelDelete,
    refetch
  } = useBooks()

  const handleEditBook = (book) => {
    setSelectedBookId(book.id)
    setIsEditBookOpen(true)
    setIsDetailsOpen(false)
  }

  const handleViewDetails = (book) => {
    setSelectedBook(book)
    setIsDetailsOpen(true)
  }

  const handleCloseDetailsModal = () => {
    setIsDetailsOpen(false)
  }

  const handleEditFromDetails = (book) => {
    setSelectedBookId(book.id)
    setIsEditBookOpen(true)
    setIsDetailsOpen(false)
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
              onImportStart={() => setIsImporting(true)}
              onImportEnd={() => setIsImporting(false)}
              books={books}
            />

            {viewMode === 'grid' ? (
              <BookGrid
                books={books}
                isLoading={isLoading || isImporting}
                onEditBook={handleEditBook}
                onDeleteBook={handleDeleteBook}
                onViewDetails={handleViewDetails}
                pagination={pagination}
                onPageChange={handlePageChange}
              />
            ) : (
              <BooksTable
                books={books}
                isLoading={isLoading || isImporting}
                onEditBook={handleEditBook}
                onDeleteBook={handleDeleteBook}
                onRowClick={handleViewDetails}
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
        {selectedBook && isDetailsOpen && (
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
