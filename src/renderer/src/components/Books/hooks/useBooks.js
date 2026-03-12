import { useState, useCallback, useEffect } from 'react'
import { fetchBooks, deleteBook } from '../../../Features/api'
import { toast } from 'react-toastify'
import { useActivity } from '../../../context/ActivityContext'
import { useNavigate } from 'react-router-dom'
import { useBookSearch } from './useBookSearch'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchUserDetails } from '../../../api/auth'
import { setAuthToken } from '../../../api/axios'

export const useBooks = (token) => {
  const navigate = useNavigate()
  const { addActivity } = useActivity()
  const queryClient = useQueryClient()
  const { debouncedSearchTerm, handleSearch } = useBookSearch()
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
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [selectedBook, setSelectedBook] = useState(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [exportProgress, setExportProgress] = useState({
    isOpen: false,
    progress: 0,
    currentPage: 0,
    totalPages: 0,
    exportedCount: 0
  })

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['books', token, pagination.currentPage, debouncedSearchTerm],
    queryFn: () => fetchBooks(token, pagination.currentPage, debouncedSearchTerm),
    enabled: !!token,
    keepPreviousData: true,
    onError: () => {
      toast.error('Failed to fetch books')
    }
  })

  const books = data?.results || []

  useEffect(() => {
    if (data?.count !== undefined) {
      setPagination((prev) => ({
        ...prev,
        totalPages: Math.ceil(data.count / 10),
        totalItems: data.count
      }))
    }
  }, [data])

  setAuthToken(token)

  const { data: userDetails } = useQuery({
    queryKey: ['user', token],
    queryFn: () => fetchUserDetails(),
    enabled: !!token
  })

  const deleteMutation = useMutation({
    mutationFn: ({ bookId, cancelData }) => deleteBook(token, bookId, cancelData),

    onSuccess: (_, variables) => {
      toast.success('Book deleted successfully!')

      addActivity({
        type: 'book_deleted',
        description: `Cancelled "${variables.bookTitle}"`
      })

      queryClient.invalidateQueries(['books'])
    },

    onError: () => {
      toast.error('Failed to cancel book')
    }
  })

  const handleDeleteBook = (id, bookTitle) => {
    setDeleteConfirm({
      isOpen: true,
      bookId: id,
      bookTitle: bookTitle || 'this book'
    })
  }

  const confirmDelete = () => {
    const { bookId, bookTitle } = deleteConfirm

    const cancelData = {
      cancelledBy: parseInt(userDetails?.id) || null,
      cancelledAt: new Date().toISOString()
    }

    deleteMutation.mutate({
      bookId,
      cancelData,
      bookTitle
    })

    setDeleteConfirm({ isOpen: false, bookId: null, bookTitle: '' })
  }

  const cancelDelete = () => {
    setDeleteConfirm({ isOpen: false, bookId: null, bookTitle: '' })
  }

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({
      ...prev,
      currentPage: newPage
    }))
  }

  const handleCategoryChange = (category) => {
    setSelectedCategory(category)
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

  const handleSort = (column) => {
    const direction =
      sortConfig.column === column && sortConfig.direction === 'asc' ? 'desc' : 'asc'

    setSortConfig({ column, direction })
  }

  const filteredBooks = sortedBooks.filter((book) => !book.cancelled)

  const handleExportToCSV = useCallback(async () => {
    try {
      setExportProgress({
        isOpen: true,
        progress: 0,
        currentPage: 0,
        totalPages: 0,
        exportedCount: 0
      })

      let allBooksData = []
      let currentPage = 1
      let hasMore = true
      let totalPages = 1

      while (hasMore) {
        const response = await fetchBooks(token, currentPage, debouncedSearchTerm)

        if (response?.results) {
          const filtered = response.results.filter((b) => !b.cancelled)
          allBooksData = [...allBooksData, ...filtered]

          hasMore = response.next !== null

          if (response.count && currentPage === 1) {
            totalPages = Math.ceil(response.count / 10)
          }

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

      // Convert books data to CSV rows
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

  const handleRowClick = (book) => {
    setSelectedBook(book)
    setIsDetailsModalOpen(true)
  }

  const handleGridViewDetails = (book) => {
    setSelectedBook(book)
    setIsDetailsModalOpen(true)
  }

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false)
    setTimeout(() => setSelectedBook(null), 300)
  }

  return {
    books: filteredBooks,
    isLoading,
    isFetching,
    refetch,
    pagination,
    sortConfig,
    deleteConfirm,
    exportProgress,
    isDetailsModalOpen,
    selectedBook,
    debouncedSearchTerm,
    handleCategoryChange,
    handleSearch,
    handlePageChange,
    handleSort,
    handleDeleteBook,
    confirmDelete,
    cancelDelete,
    handleRowClick,
    handleGridViewDetails,
    handleCloseDetailsModal,
    handleExportToCSV
  }
}
