import { useNavigate } from 'react-router-dom'

export const useBookModals = () => {
  const navigate = useNavigate()

  const handleAddBook = () => {
    navigate('/books/add-book')
  }

  const handleEditBook = (book) => {
    navigate('/books/edit-book/' + book.id)
  }

  return {
    handleAddBook,
    handleEditBook
  }
}
