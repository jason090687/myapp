import { useState } from 'react'
import { updateBook, addNewBook } from '../../../Features/api'
import { toast } from 'react-toastify'

export const useBookModals = (token, fetchBooksData, currentPage) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingBook, setEditingBook] = useState(null)

  const handleAddBook = () => {
    setIsModalOpen(true)
    setIsEditModalOpen(false)
    setEditingBook(null)
  }

  const handleEditBook = (book) => {
    setEditingBook(null)
    setIsEditModalOpen(false)
    setTimeout(() => {
      setEditingBook(book)
      setIsEditModalOpen(true)
      setIsModalOpen(false)
    }, 0)
  }

  const handleCloseModal = () => setIsModalOpen(false)

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false)
    setTimeout(() => setEditingBook(null), 100)
  }

  const handleSubmitBook = async (bookData) => {
    try {
      if (editingBook) {
        await updateBook(token, { ...editingBook, ...bookData })
        toast.success('Book updated successfully!', {
          position: 'top-right',
          autoClose: 2000,
          hideProgressBar: false
        })
      } else {
        await addNewBook(token, bookData)
        toast.success('Book added successfully!', {
          position: 'top-right',
          autoClose: 2000,
          hideProgressBar: false
        })
      }
      setIsModalOpen(false)
      setEditingBook(null)
      await fetchBooksData(currentPage)
    } catch (error) {
      console.error('Error saving book:', error)
      toast.error(error.message || 'Failed to save book!', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false
      })
    }
  }

  const handleEditSubmit = async () => {
    try {
      setIsEditModalOpen(false)
      setEditingBook(null)
      await fetchBooksData(currentPage)
      toast.success('Book updated successfully!', {
        position: 'top-right',
        autoClose: 2000
      })
    } catch (error) {
      console.error('Error updating book:', error)
      toast.error('Failed to update book!', {
        position: 'top-right',
        autoClose: 3000
      })
      throw error
    }
  }

  return {
    isModalOpen,
    isEditModalOpen,
    editingBook,
    handleAddBook,
    handleEditBook,
    handleCloseModal,
    handleCloseEditModal,
    handleSubmitBook,
    handleEditSubmit
  }
}
