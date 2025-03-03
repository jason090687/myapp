import { useState, useCallback, useRef } from 'react'
import { toast } from 'react-toastify'
import {
  fetchBorrowedBooks,
  returnBook,
  renewBook,
  processOverduePayment,
  borrowBook
} from '../../../Features/api'
import { sortBorrowedBooks } from '../utils/statusUtils'

export const useBorrowed = (token) => {
  const [borrowedBooks, setBorrowedBooks] = useState([])
  const [isLoading, setLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isRenewModalOpen, setIsRenewModalOpen] = useState(false)
  const [isOverdueModalOpen, setIsOverdueModalOpen] = useState(false)
  const [selectedBorrow, setSelectedBorrow] = useState(null)
  const [selectedOverdue, setSelectedOverdue] = useState(null)
  const [pagination, setPagination] = useState({
    count: 0,
    next: null,
    previous: null,
    currentPage: 1,
    totalPages: 1
  })
  const [currentSearchTerm, setCurrentSearchTerm] = useState('')
  const fetchInProgress = useRef(false)
  const currentPage = useRef(1)

  const fetchBorrowedData = useCallback(
    async (page = 1, searchTerm = '') => {
      if (!token || fetchInProgress.current) return
      if (page === currentPage.current && searchTerm === currentSearchTerm) return // Prevent duplicate fetches

      try {
        fetchInProgress.current = true
        setLoading(true)
        currentPage.current = page
        setCurrentSearchTerm(searchTerm)

        const response = await fetchBorrowedBooks(token, page, searchTerm)
        if (response) {
          const sortedBooks = sortBorrowedBooks(response.results || [])
          setBorrowedBooks(sortedBooks)
          setPagination((prev) => ({
            ...prev,
            count: response.count || 0,
            next: response.next,
            previous: response.previous,
            currentPage: page,
            totalPages: Math.max(1, Math.ceil((response.count || 0) / 10))
          }))
        }
      } catch (error) {
        console.error('Error fetching borrowed books:', error)
        toast.error('Failed to fetch borrowed books')
        setBorrowedBooks([])
        setPagination({
          count: 0,
          next: null,
          previous: null,
          currentPage: 1,
          totalPages: 1
        })
      } finally {
        setLoading(false)
        fetchInProgress.current = false
      }
    },
    [token]
  ) // Only depend on token

  const handleBorrowBook = () => setIsModalOpen(true)
  const handleCloseModal = () => setIsModalOpen(false)

  const handleReturnBook = async (borrowId) => {
    try {
      await returnBook(token, borrowId, {
        returned_date: new Date().toISOString().split('T')[0]
      })
      await fetchBorrowedData(pagination.currentPage)
      toast.success('Book returned successfully!')
    } catch (error) {
      toast.error(error.message || 'Failed to return book')
    }
  }

  const handleRenewClick = (borrowItem) => {
    if (!borrowItem) return

    setSelectedBorrow({
      id: borrowItem.id || '',
      student_name: borrowItem.student_name || 'Unknown Student',
      book_title: borrowItem.book_title || 'Unknown Book',
      due_date: borrowItem.due_date || new Date().toISOString()
    })
    setIsRenewModalOpen(true)
  }

  const handleCloseRenewModal = () => {
    setIsRenewModalOpen(false)
    setSelectedBorrow(null)
  }

  const handleRenewSubmit = async (renewData) => {
    try {
      await renewBook(token, renewData.id, { due_date: renewData.due_date })
      await fetchBorrowedData(pagination.currentPage)
      setIsRenewModalOpen(false)
      toast.success('Book renewed successfully!')
    } catch (error) {
      toast.error(error.message || 'Failed to renew book')
      throw error
    }
  }

  const handleOverdueClick = (borrowItem) => {
    if (!borrowItem) return

    setSelectedOverdue({
      id: borrowItem.id,
      student_name: borrowItem.student_name || 'Unknown Student',
      book_title: borrowItem.book_title || 'Unknown Book',
      due_date: borrowItem.due_date || new Date().toISOString()
    })
    setIsOverdueModalOpen(true)
  }

  const handleOverdueSubmit = async (paymentData) => {
    try {
      await processOverduePayment(token, paymentData.id, paymentData)
      await fetchBorrowedData(pagination.currentPage)
      setIsOverdueModalOpen(false)
      toast.success('Payment processed successfully!')
    } catch (error) {
      toast.error(error.message || 'Failed to process payment')
      throw error
    }
  }

  const handleSubmitBorrow = async (borrowData) => {
    try {
      await borrowBook(token, borrowData)
      setIsModalOpen(false)
      // Always fetch first page after new borrow
      await fetchBorrowedData(1, currentSearchTerm)
      toast.success('Book borrowed successfully!')
    } catch (error) {
      toast.error(error.message || 'Failed to borrow book')
    }
  }

  const handlePageChange = useCallback(
    (newPage) => {
      if (newPage > 0 && newPage !== currentPage.current) {
        fetchBorrowedData(newPage, currentSearchTerm)
      }
    },
    [currentSearchTerm, fetchBorrowedData]
  )

  return {
    borrowedBooks,
    isLoading,
    pagination,
    isModalOpen,
    isRenewModalOpen,
    isOverdueModalOpen,
    selectedBorrow,
    selectedOverdue,
    fetchBorrowedData,
    handleBorrowBook,
    handleCloseModal,
    handleReturnBook,
    handleRenewClick,
    handleRenewSubmit,
    handleOverdueClick,
    handleOverdueSubmit,
    handleSubmitBorrow,
    handlePageChange,
    handleCloseRenewModal
  }
}
