import { useNavigate } from 'react-router-dom'

export const useBookModals = () => {
  const navigate = useNavigate()

  const showToast = (title, description, variant = 'success', duration = 4000) => {
    if (typeof window !== 'undefined' && window.showToast) {
      window.showToast(title, description, variant, duration)
    }
  }

  const handleAddBook = () => {
    navigate('/books/add-book')
  }

  const handleEditBook = (book) => {
    navigate('/books/edit-book/' + book.id)
  }

  return {
    handleAddBook,
    handleEditBook,
    showToast
  }
}
