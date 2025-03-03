import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { Bounce, toast } from 'react-toastify'
import Sidebar from '../components/Sidebar'
import BooksHeader from '../components/Books/components/BooksHeader'
import BooksTable from '../components/Books/components/BooksTable'
import BooksTablePagination from '../components/Books/components/BooksTablePagination'
import AddBookModal from '../components/AddBookModal'
import EditBookModal from '../components/EditBookModal'
import { useBooks } from '../components/Books/hooks/useBooks'
import { useBookModals } from '../components/Books/hooks/useBookModals'
import { useBookSearch } from '../components/Books/hooks/useBookSearch'
import './Books.css'

function Books() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const { token, user } = useSelector((state) => state.auth)

  const {
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
    handleSort,
    handlePageChange
  } = useBooks(token)

  const { searchTerm, debouncedSearchTerm, handleSearch } = useBookSearch(fetchAllBooks)

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

  useEffect(() => {
    fetchAllBooks(debouncedSearchTerm)
  }, [debouncedSearchTerm])

  return (
    <div className="app-wrapper">
      <Sidebar isCollapsed={isCollapsed} onToggle={() => setIsCollapsed(!isCollapsed)} />
      <div className={`books-container ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="books-content">
          <BooksHeader onSearch={handleSearch} onAddBook={handleAddBook} />

          <BooksTable
            books={books}
            isLoading={isLoading}
            isFetchingAll={isFetchingAll}
            sortConfig={sortConfig}
            onSort={handleSort}
            onEditBook={handleEditBook}
            onDeleteBook={handleDeleteBook}
          />

          {!isLoading && !isFetchingAll && books.length > 0 && (
            <BooksTablePagination
              currentPage={pagination.currentPage}
              totalPages={Math.ceil((sortedBooks || allBooks).length / 10)}
              totalItems={(sortedBooks || allBooks).length}
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
    </div>
  )
}

export default Books
