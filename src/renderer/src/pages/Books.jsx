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
import { fetchBooks } from '../Features/api'
import { toast } from 'react-toastify'
import ExportProgressModal from '../components/Books/components/ExportProgressModal'

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

  const handleExportToCSV = useCallback(async () => {
    try {
      // Show progress modal
      setExportProgress({
        isOpen: true,
        progress: 0,
        currentPage: 0,
        totalPages: 0,
        exportedCount: 0
      })

      // Fetch all books across all pages
      let allBooksData = []
      let currentPage = 1
      let hasMore = true
      let totalPages = 1

      while (hasMore) {
        const data = await fetchBooks(token, currentPage, debouncedSearchTerm)
        if (data && data.results) {
          const filteredBooks = data.results.filter((book) => !book.cancelled)
          allBooksData = [...allBooksData, ...filteredBooks]
          hasMore = data.next !== null

          // Calculate total pages from count
          if (data.count && currentPage === 1) {
            totalPages = Math.ceil(data.count / 10)
          }

          // Update progress
          const progress = totalPages > 0 ? (currentPage / totalPages) * 90 : 0
          setExportProgress({
            isOpen: true,
            progress,
            currentPage,
            totalPages,
            exportedCount: allBooksData.length
          })

          currentPage++
        } else {
          hasMore = false
        }
      }

      if (allBooksData.length === 0) {
        setExportProgress({
          isOpen: false,
          progress: 0,
          currentPage: 0,
          totalPages: 0,
          exportedCount: 0
        })
        toast.warning('No books to export')
        return
      }

      // Update progress for CSV generation
      setExportProgress((prev) => ({
        ...prev,
        progress: 95
      }))

      // Define CSV headers - UPPERCASE
      const headers = [
        'NAME',
        'TITLE',
        'AUTHOR',
        'SERIES_TITLE',
        'PUBLISHER',
        'PLACE_OF_PUBLICATION',
        'YEAR',
        'EDITION',
        'VOLUME',
        'PHYSICAL_DESCRIPTION',
        'ISBN',
        'ACCESSION_NUMBER',
        'CALL_NUMBER',
        'BARCODE',
        'SUBJECT',
        'DESCRIPTION',
        'ADDITIONAL_AUTHOR',
        'COPIES'
      ]

      // Convert books data to CSV rows
      const csvRows = [
        headers.join(','),
        ...allBooksData.map((book) =>
          [
            `"${(book.name || '').replace(/"/g, '""')}"`,
            `"${(book.title || '').replace(/"/g, '""')}"`,
            `"${(book.author || '').replace(/"/g, '""')}"`,
            `"${(book.series_title || '').replace(/"/g, '""')}"`,
            `"${(book.publisher || '').replace(/"/g, '""')}"`,
            `"${(book.place_of_publication || '').replace(/"/g, '""')}"`,
            book.year || '',
            `"${(book.edition || '').replace(/"/g, '""')}"`,
            `"${(book.volume || '').replace(/"/g, '""')}"`,
            `"${(book.physical_description || '').replace(/"/g, '""')}"`,
            `"${book.isbn || ''}"`,
            `"${book.accession_number || ''}"`,
            `"${book.call_number || ''}"`,
            `"${book.barcode || ''}"`,
            `"${(book.subject || '').replace(/"/g, '""')}"`,
            `"${(book.description || '').replace(/"/g, '""')}"`,
            `"${(book.additional_author || '').replace(/"/g, '""')}"`,
            book.copies || 0
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

      // Complete progress
      setExportProgress((prev) => ({
        ...prev,
        progress: 100
      }))

      // Close modal after brief delay
      setTimeout(() => {
        setExportProgress({
          isOpen: false,
          progress: 0,
          currentPage: 0,
          totalPages: 0,
          exportedCount: 0
        })
        toast.success(`Successfully exported ${allBooksData.length} books`)
      }, 500)
    } catch (error) {
      console.error('Export failed:', error)
      setExportProgress({
        isOpen: false,
        progress: 0,
        currentPage: 0,
        totalPages: 0,
        exportedCount: 0
      })
      toast.error('Failed to export books')
    }
  }, [token, debouncedSearchTerm])

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
  const [exportProgress, setExportProgress] = useState({
    isOpen: false,
    progress: 0,
    currentPage: 0,
    totalPages: 0,
    exportedCount: 0
  })

  const handleCategoryChange = useCallback(
    (category) => {
      setSelectedCategory(category)
      fetchBooksData(1, debouncedSearchTerm, category)
    },
    [fetchBooksData, debouncedSearchTerm]
  )

  // No client-side filtering needed - filtering is done server-side
  const filteredBooks = books.filter((book) => !book.cancelled)

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
    fetchBooksData(1, debouncedSearchTerm, selectedCategory)
  }, [debouncedSearchTerm, selectedCategory, fetchBooksData])

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
              books={books}
            />

            {viewMode === 'grid' ? (
              <BookGrid
                books={filteredBooks}
                isLoading={isLoading}
                onEditBook={handleEditBook}
                onDeleteBook={handleGridDelete}
                onViewDetails={handleGridViewDetails}
                pagination={pagination}
                onPageChange={(page) =>
                  handlePageChange(page, debouncedSearchTerm, selectedCategory)
                }
              />
            ) : (
              <BooksTable
                books={filteredBooks}
                isLoading={isLoading}
                onEditBook={handleEditBook}
                onDeleteBook={handleDeleteBook}
                onRowClick={handleRowClick}
                pagination={pagination}
                onPageChange={(page) =>
                  handlePageChange(page, debouncedSearchTerm, selectedCategory)
                }
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
