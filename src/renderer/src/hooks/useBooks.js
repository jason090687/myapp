import { useState, useCallback, useEffect } from 'react'
import { toast } from 'react-toastify'
import { useActivity } from '../context/ActivityContext'
import { useBookSearch } from './useBookSearch'
import { useQueryClient } from '@tanstack/react-query'
import { useSelector } from 'react-redux'
import { useBooks as useBookQuery, useAllBooks, useDeleteBook } from './useQueries'

export const useBooks = () => {
  const { addActivity } = useActivity()
  const queryClient = useQueryClient()
  const { debouncedSearchTerm, handleSearch } = useBookSearch()
  const { user } = useSelector((state) => state.auth)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 0,
    totalItems: 0
  })
  const [sortConfig, setSortConfig] = useState({ column: '', direction: '' })
  const [deleteConfirm, setDeleteConfirm] = useState({
    isOpen: false,
    bookId: null,
    bookTitle: ''
  })
  const [exportProgress, setExportProgress] = useState({
    isOpen: false,
    progress: 0,
    currentPage: 0,
    totalPages: 0,
    exportedCount: 0
  })

  // 🔥 FETCH BOOKS
  const { data, isLoading, isFetching, refetch } = useBookQuery(
    pagination.currentPage,
    debouncedSearchTerm
  )


  const allBooksQuery = useAllBooks(debouncedSearchTerm)
  const deleteBookMutation = useDeleteBook()

  const books = data?.results || []

  // 🔥 PAGINATION UPDATE
  useEffect(() => {
    if (data?.count !== undefined) {
      setPagination((prev) => ({
        ...prev,
        totalPages: Math.ceil(data.count / 10),
        totalItems: data.count
      }))
    }
  }, [data])

  // 🔥 DELETE HANDLER (OPEN MODAL)
  const handleDeleteBook = (id, bookTitle) => {
    setDeleteConfirm({
      isOpen: true,
      bookId: id,
      bookTitle: bookTitle || 'this book'
    })
  }

  // 🔥 CONFIRM DELETE (FIXED)
  const confirmDelete = async () => {
    const { bookId, bookTitle } = deleteConfirm

    const cancelData = {
      cancelledBy: user?.id ?? user?.user_id ?? user?.pk,
      cancelledAt: new Date().toISOString()
    }

    try {
      await deleteBookMutation.mutateAsync({ bookId, cancelData })

      // ✅ IMPORTANT: refresh query cache
      queryClient.invalidateQueries(['books'])

      toast.success('Book deleted successfully!')

      addActivity({
        type: 'book_deleted',
        description: `Cancelled "${bookTitle}"`
      })

      setDeleteConfirm({ isOpen: false, bookId: null, bookTitle: '' })
    } catch (error) {
      toast.error(error.message || 'Failed to delete book')
    }
  }

  const cancelDelete = () => {
    setDeleteConfirm({ isOpen: false, bookId: null, bookTitle: '' })
  }

  // 🔥 PAGINATION CHANGE
  const handlePageChange = (newPage) => {
    setPagination((prev) => ({
      ...prev,
      currentPage: newPage
    }))
  }

  // 🔥 SORTING
  const handleCategoryChange = (category) => {
    if (category === 'title_asc') {
      setSortConfig({ column: 'title', direction: 'asc' })
    } else if (category === 'title_desc') {
      setSortConfig({ column: 'title', direction: 'desc' })
    } else if (category === 'author_asc') {
      setSortConfig({ column: 'author', direction: 'asc' })
    } else if (category === 'author_desc') {
      setSortConfig({ column: 'author', direction: 'desc' })
    } else if (category === 'year_desc') {
      setSortConfig({ column: 'year', direction: 'desc' })
    } else if (category === 'year_asc') {
      setSortConfig({ column: 'year', direction: 'asc' })
    } else if (category === 'newest') {
      setSortConfig({ column: 'date_received', direction: 'desc' })
    } else {
      setSortConfig({ column: '', direction: '' })
    }

    setPagination((prev) => ({ ...prev, currentPage: 1 }))
  }

  const sortedBooks = sortConfig.column
    ? [...books].sort((a, b) => {
      if (a[sortConfig.column] < b[sortConfig.column])
        return sortConfig.direction === 'asc' ? -1 : 1
      if (a[sortConfig.column] > b[sortConfig.column])
        return sortConfig.direction === 'asc' ? 1 : -1
      return 0
    })
    : books

  // 🔥🔥🔥 FIXED FILTER (IMPORTANT)
  const filteredBooks = sortedBooks.filter((book) => !book.cancelled && !book.cancelledAt)

  const handleSort = (column) => {
    const direction =
      sortConfig.column === column && sortConfig.direction === 'asc' ? 'desc' : 'asc'

    setSortConfig({ column, direction })
  }

  // 🔥 EXPORT CSV (FILTER FIXED TOO)
  const handleExportToCSV = useCallback(async () => {
    try {
      setExportProgress({
        isOpen: true,
        progress: 0,
        currentPage: 0,
        totalPages: 0,
        exportedCount: 0
      })

      const allBooksData = (allBooksQuery.data || []).filter((b) => !b.cancelled && !b.cancelledAt)

      if (!allBooksData.length) {
        toast.warning('No books to export')
        setExportProgress({
          isOpen: false,
          progress: 0,
          currentPage: 0,
          totalPages: 0,
          exportedCount: 0
        })
        return
      }

      const headers = [
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

      const csvRows = [
        headers.join(','),
        ...allBooksData.map((book) =>
          [
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

      const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)

      link.href = url
      link.download = `books_export_${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast.success(`Successfully exported ${allBooksData.length} books`)
      setExportProgress({ isOpen: false, progress: 0 })
    } catch (error) {
      console.error(error)
      toast.error('Failed to export books')
    }
  }, [allBooksQuery.data])

  return {
    books: filteredBooks,
    isLoading,
    isFetching,
    refetch,
    pagination,
    sortConfig,
    deleteConfirm,
    exportProgress,
    debouncedSearchTerm,
    handleCategoryChange,
    handleSearch,
    handlePageChange,
    handleSort,
    handleDeleteBook,
    confirmDelete,
    cancelDelete,
    handleExportToCSV,
  }
}
