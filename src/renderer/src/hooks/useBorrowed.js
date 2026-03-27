import { useState, useEffect, useMemo } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useToaster } from '../components/Toast/useToaster'
import { useSearchParams } from 'react-router-dom'
import {
  useBorrowedBooks,
  useReturnBook,
  useRenewBook,
  useProcessOverduePayment,
  useUpdateBook
} from './useQueries'

export const useBorrowed = () => {
  const queryClient = useQueryClient()
  const { showToast } = useToaster()

  // UI State
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isRenewModalOpen, setIsRenewModalOpen] = useState(false)
  const [selectedBorrow, setSelectedBorrow] = useState(null)
  const [isOverdueModalOpen, setIsOverdueModalOpen] = useState(false)
  const [selectedOverdue, setSelectedOverdue] = useState(null)
  const [searchParams] = useSearchParams()
  const highlightedId = searchParams.get('id')
  const shouldHighlight = searchParams.get('highlight') === 'true'
  const [selectedBorrowDetails, setSelectedBorrowDetails] = useState(null)
  const [windowWidth, setWindowWidth] = useState(window.innerWidth)
  const [filterStatus, setFilterStatus] = useState('all')

  // Fetch borrowed books with TanStack Query hook
  const { data: borrowData, isLoading, refetch } = useBorrowedBooks(currentPage, searchTerm)

  // Transform data with sorting
  const sortBorrowedBooks = (books) => {
    return [...books].sort((a, b) => {
      if (a.is_returned !== b.is_returned) {
        return a.is_returned ? 1 : -1
      }
      return new Date(b.borrowed_date) - new Date(a.borrowed_date)
    })
  }

  const borrowedBooks = useMemo(
    () => sortBorrowedBooks(borrowData?.results || []),
    [borrowData?.results]
  )

  const pagination = {
    count: borrowData?.count || 0,
    next: borrowData?.next,
    previous: borrowData?.previous,
    currentPage
  }

  const totalPages = Math.ceil(pagination.count / 10)

  // Mutations using hooks
  const updateBookMutation = useUpdateBook()
  const returnMutation = useReturnBook()
  const renewMutation = useRenewBook()
  const overdueMutation = useProcessOverduePayment()

  // Borrow mutation wrapper
  const borrowMutation = {
    mutate: async ({ bookId, borrowData }) => {
      try {
        await updateBookMutation.mutateAsync({ bookId, bookData: borrowData })
        queryClient.invalidateQueries({ queryKey: ['borrowedBooks'] })
        showToast('Success', 'Book borrowed successfully!', 'success')
      } catch (error) {
        showToast('Error', error.message || 'Failed to borrow book', 'error')
        throw error
      }
    },
    mutateAsync: async ({ bookId, borrowData }) => {
      try {
        await updateBookMutation.mutateAsync({ bookId, bookData: borrowData })
        queryClient.invalidateQueries({ queryKey: ['borrowedBooks'] })
        showToast('Success', 'Book borrowed successfully!', 'success')
      } catch (error) {
        showToast('Error', error.message || 'Failed to borrow book', 'error')
        throw error
      }
    },
    isPending: updateBookMutation.isPending
  }

  // Helper functions
  const isOverdue = (dueDate) => {
    const today = new Date()
    const due = new Date(dueDate)
    return due < today
  }

  const getRowClassName = (item) => {
    let className = item.is_returned ? 'disabled-row' : ''
    if (!item.is_returned && isOverdue(item.due_date)) {
      className += ' overdue'
    }
    return className
  }

  const getStatusBadgeClass = (item) => {
    if (item.is_returned) return 'returned'
    if (item.paid && isOverdue(item.due_date)) return 'paid-overdue'
    return isOverdue(item.due_date) ? 'overdue' : 'borrowed'
  }

  const getStatusText = (item) => {
    if (item.is_returned) return 'Returned'
    if (item.paid && isOverdue(item.due_date)) return 'Paid'
    return isOverdue(item.due_date) ? 'DUE' : 'BORROWED'
  }

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString()

  // Event handlers
  const handleSidebarToggle = () => setIsCollapsed(!isCollapsed)

  const handlePageChange = (newPage) => {
    if (newPage > 0) {
      setCurrentPage(newPage)
    }
  }

  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
    if (currentPage !== 1) {
      setCurrentPage(1)
    }
  }

  const handleBorrowBook = () => setIsModalOpen(true)
  const handleCloseModal = () => setIsModalOpen(false)

  const handleSubmitBorrow = async (borrowData) => {
    setIsModalOpen(false)
    await borrowMutation.mutateAsync({
      bookId: borrowData.book,
      borrowData: { status: 'Borrowed' }
    })
  }

  const handleReturnBook = async (borrowId) => {
    const borrowItem = borrowedBooks.find((item) => item.id === borrowId)
    if (!borrowItem) {
      showToast('Error', 'Borrow record not found', 'error')
      return
    }
    await returnMutation.mutateAsync({ borrowId, bookId: borrowItem.book })
  }

  const handleRenewClick = (borrowItem) => {
    setSelectedBorrow({
      id: borrowItem.id,
      student_name: borrowItem.student_name,
      book_title: borrowItem.book_title,
      due_date: borrowItem.due_date
    })
    setIsRenewModalOpen(true)
  }

  const handleRenewSubmit = async (renewData) => {
    setIsRenewModalOpen(false)
    await renewMutation.mutateAsync({
      borrowId: renewData.id,
      renewData: {
        due_date: renewData.due_date,
        renewed_count: (renewData.renewed_count || 0) + 1
      }
    })
  }

  const handleOverdueClick = (borrowItem) => {
    setSelectedOverdue({
      id: borrowItem.id,
      student_name: borrowItem.student_name,
      book_title: borrowItem.book_title,
      due_date: borrowItem.due_date
    })
    setIsOverdueModalOpen(true)
  }

  const handleOverdueSubmit = async (paymentData) => {
    setIsOverdueModalOpen(false)
    await overdueMutation.mutateAsync(paymentData)
  }

  const refreshTable = () => queryClient.invalidateQueries({ queryKey: ['borrowedBooks'] })

  // Filtered books
  const getFilteredBooks = () => {
    let filtered = borrowedBooks

    if (filterStatus === 'borrowed') {
      filtered = filtered.filter((book) => !book.is_returned && !isOverdue(book.due_date))
    } else if (filterStatus === 'returned') {
      filtered = filtered.filter((book) => book.is_returned)
    } else if (filterStatus === 'overdue') {
      filtered = filtered.filter((book) => !book.is_returned && isOverdue(book.due_date))
    }

    if (!searchTerm) return filtered

    const searchLower = searchTerm.toLowerCase()
    return filtered.filter((book) => {
      const studentName = book.student_name || ''
      const bookTitle = book.book_title || ''

      return (
        studentName.toLowerCase().includes(searchLower) ||
        bookTitle.toLowerCase().includes(searchLower) ||
        formatDate(book.borrowed_date).toLowerCase().includes(searchLower) ||
        formatDate(book.due_date).toLowerCase().includes(searchLower)
      )
    })
  }

  const handleRowClick = (item) => {
    if (windowWidth <= 1500) {
      setSelectedBorrowDetails(item)
    }
  }

  // Effects
  useEffect(() => {
    if (highlightedId && shouldHighlight) {
      const element = document.getElementById(`borrowed-item-${highlightedId}`)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
        element.classList.add('highlighted')
        setTimeout(() => {
          element.classList.remove('highlighted')
        }, 3000)
      }
    }
  }, [highlightedId, shouldHighlight])

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return {
    isCollapsed,
    refetch,
    setIsCollapsed,
    handleSidebarToggle,
    windowWidth,
    isLoading,
    searchTerm,
    setSearchTerm,
    handleSearch,
    filterStatus,
    setFilterStatus,
    borrowedBooks,
    getFilteredBooks,
    highlightedId,
    pagination,
    totalPages,
    handlePageChange,
    refreshTable,
    formatDate,
    getRowClassName,
    getStatusBadgeClass,
    getStatusText,
    isOverdue,
    handleBorrowBook,
    handleReturnBook,
    handleRenewClick,
    handleOverdueClick,
    handleRowClick,
    fetchBorrowedData: refreshTable,
    isModalOpen,
    setIsModalOpen,
    handleCloseModal,
    handleSubmitBorrow,
    isRenewModalOpen,
    setIsRenewModalOpen,
    selectedBorrow,
    handleRenewSubmit,
    isOverdueModalOpen,
    setIsOverdueModalOpen,
    selectedOverdue,
    handleOverdueSubmit,
    selectedBorrowDetails,
    setSelectedBorrowDetails,
    // Mutation states
    isBorrowing: borrowMutation.isPending,
    isReturning: returnMutation.isPending,
    isRenewing: renewMutation.isPending,
    isProcessingOverdue: overdueMutation.isPending
  }
}

// Re-export hooks for backward compatibility
export { useBorrowedBooks, useReturnBook, useRenewBook, useProcessOverduePayment }
