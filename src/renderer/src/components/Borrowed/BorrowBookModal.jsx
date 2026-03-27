import { useState, useEffect, useMemo, useRef } from 'react'
import PropTypes from 'prop-types'
import { User, BookOpen, Calendar, X } from 'lucide-react'
import { Button } from '../ui/button'
import './styles/BorrowBookModal.css'
import { useToaster } from '../Toast/useToaster'
import { useActivity } from '../../context/ActivityContext'
import { useBooks, useBorrowBook, useStudentDetails, useStudents } from '../../hooks'

function BorrowBookModal({ isOpen, onClose, onSubmit }) {
  const initialFormData = {
    student: '',
    book: '',
    due_date: '',
    status: 'Borrowed',
    lexile_level: '' // Add this line
  }
  const [formData, setFormData] = useState(initialFormData)
  const [isSubmittingLocal, setIsSubmittingLocal] = useState(false)
  const [bookSearch, setBookSearch] = useState('')
  const [selectedBook, setSelectedBook] = useState(null)
  const [showBookDropdown, setShowBookDropdown] = useState(false)
  const bookInputRef = useRef(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const dropdownRef = useRef(null)
  const { showToast } = useToaster()
  const { addActivity } = useActivity()

  const { data: booksData, isLoading } = useBooks(1, bookSearch)
  const { data: studentsData } = useStudents(1, formData.student)

  const borrowBookMutation = useBorrowBook()

  const studentFromSearch = useMemo(() => {
    const list = Array.isArray(studentsData) ? studentsData : studentsData?.results ?? []
    return list.find(
      (s) => String(s.id_number) === String(formData.student)
    ) ?? null
  }, [studentsData, formData.student])

  const studentPk = studentFromSearch?.id ?? studentFromSearch?.pk ?? null
  const { data: studentData, isLoading: isStudentLoading } = useStudentDetails(studentPk)

  const books = useMemo(() => {
    if (!booksData) return []

    const bookList = Array.isArray(booksData) ? booksData : booksData.results ?? []

    return bookList
      .filter((book) => book.status !== 'Borrowed')
      .map((book) => ({
        id: book.id,
        title: book.title,
        lexile_level: book.lexile_level
      }))
  }, [booksData])

  // ✅ SECOND: filteredBooks
  const filteredBooks = useMemo(() => {
    return books.filter((book) => book.title.toLowerCase().includes(bookSearch.toLowerCase()))
  }, [books, bookSearch])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (bookInputRef.current && !bookInputRef.current.contains(event.target)) {
        setShowBookDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (highlightedIndex >= 0 && dropdownRef.current) {
      const highlightedElement = dropdownRef.current.children[highlightedIndex]
      if (highlightedElement) {
        highlightedElement.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth'
        })
      }
    }
  }, [highlightedIndex])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (isSubmitting) return

    setIsSubmitting(true)
    setIsSubmittingLocal(true)

    try {
      // Wait for student data to load before validation
      if (isStudentLoading) {
        showToast('Validating student...', 'Please wait', 'info')
        setIsSubmitting(false)
        setIsSubmittingLocal(false)
        return
      }

      // Validate student is active before borrowing
      if (studentData && !studentData.active) {
        showToast('Inactive Student', 'This student cannot borrow books', 'error')
        setIsSubmitting(false)
        setIsSubmittingLocal(false)
        return
      }

      const borrowData = {
        id_number: parseInt(formData.id_number),
        student: parseInt(formData.student),
        book: parseInt(formData.book),
        lexile_level: formData.lexile_level,
        status: 'Borrowed',
        borrowed_date: new Date().toISOString().split('T')[0],
        due_date: formData.due_date
      }

      await borrowBookMutation.mutateAsync(borrowData)
      onSubmit(borrowData)

      const bookTitle = books.find((b) => b.id === parseInt(formData.book))?.title || 'Unknown book'

      addActivity({
        type: 'book_borrowed',
        description: `"${bookTitle}" borrowed by student ${formData.student}`
      })

      setFormData(initialFormData)
      setBookSearch('')
      setSelectedBook(null)
      onClose()
    } catch (error) {
      console.error('Error borrowing book:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Failed to borrow book'
      showToast('Borrow Failed', errorMessage, 'error')
    } finally {
      setIsSubmitting(false)
      setIsSubmittingLocal(false)
    }
  }

  const resetForm = () => {
    setFormData(initialFormData)
    setBookSearch('')
    setSelectedBook(null)
    setHighlightedIndex(-1)
  }

  const handleChange = async (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  const handleBookSelect = (book) => {
    setSelectedBook(book)
    setFormData((prev) => ({
      ...prev,
      book: book.id,
      lexile_level: book.lexile_level || '' // Add this line
    }))
    setBookSearch(book.title)
    setShowBookDropdown(false)
  }

  const handleKeyDown = (e) => {
    if (!showBookDropdown || filteredBooks.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setHighlightedIndex((prevIndex) => {
          const nextIndex = prevIndex < filteredBooks.length - 1 ? prevIndex + 1 : prevIndex
          return nextIndex
        })
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlightedIndex((prevIndex) => {
          const nextIndex = prevIndex > 0 ? prevIndex - 1 : 0
          return nextIndex
        })
        break
      case 'Enter':
        e.preventDefault()
        if (highlightedIndex >= 0) {
          handleBookSelect(filteredBooks[highlightedIndex])
        }
        break
      case 'Escape':
        setShowBookDropdown(false)
        setHighlightedIndex(-1)
        break
      default:
        break
    }
  }

  useEffect(() => {
    setHighlightedIndex(-1)
  }, [bookSearch])

  useEffect(() => {
    if (!showBookDropdown) {
      setHighlightedIndex(-1)
    }
  }, [showBookDropdown])

  return isOpen ? (
    <div className="borrow-modal-overlay">
      <div className="borrow-modal-content">
        <div className="borrow-modal-header">
          <h2>Borrow Book</h2>
          <button onClick={onClose} className="borrow-modal-close" aria-label="Close modal">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="borrow-modal-form">
          <div className="borrow-form-grid">
            <div className="borrow-form-group student-field">
              <label htmlFor="student" className="required">
                Student ID
              </label>
              <div className="borrow-input-wrapper">
                <User className="borrow-input-icon" size={18} />
                <input
                  type="text"
                  id="student"
                  name="student"
                  value={formData.student}
                  onChange={handleChange}
                  required
                  placeholder="Enter student ID"
                  className="borrow-input"
                />
              </div>
            </div>
            <div className="borrow-form-group book-field">
              <label htmlFor="book-search">Book*</label>
              <div className="borrow-search-wrapper" ref={bookInputRef}>
                <BookOpen className="borrow-search-icon" size={18} />
                <input
                  type="text"
                  id="book-search"
                  placeholder="Search book..."
                  value={bookSearch}
                  onChange={(e) => setBookSearch(e.target.value)}
                  onClick={() => setShowBookDropdown(true)}
                  onKeyDown={handleKeyDown}
                  className="borrow-search-input"
                  required
                />
                {showBookDropdown && (
                  <div className="borrow-search-results" ref={dropdownRef}>
                    {isLoading || isSubmittingLocal ? (
                      <div className="borrow-search-item">Loading books...</div>
                    ) : filteredBooks.length > 0 ? (
                      filteredBooks.map((book, index) => (
                        <div
                          key={book.id}
                          className={`borrow-search-item ${index === highlightedIndex ? 'highlighted' : ''}`}
                          onClick={() => handleBookSelect(book)}
                          onMouseEnter={() => setHighlightedIndex(index)}
                        >
                          {book.title} {book.author ? `- ${book.author}` : ''}
                          {book.isbn ? `(ISBN: ${book.isbn})` : ''}
                        </div>
                      ))
                    ) : (
                      <div className="borrow-search-item borrow-no-results">No books found</div>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="borrow-form-group">
              <label htmlFor="lexile_level">Lexile Level*</label>
              <div className="borrow-input-wrapper">
                <BookOpen className="borrow-input-icon" size={18} />
                <input
                  type="text"
                  id="lexile_level"
                  name="lexile_level"
                  value={formData.lexile_level}
                  onChange={handleChange}
                  required
                  placeholder="Enter lexile level"
                  className="borrow-input"
                // readOnly
                />
              </div>
            </div>
            <div className="borrow-form-group">
              <label htmlFor="due_date">Return Date*</label>
              <div className="borrow-input-wrapper">
                <Calendar className="borrow-input-icon" size={18} />
                <input
                  type="date"
                  id="due_date"
                  name="due_date"
                  value={formData.due_date}
                  onChange={handleChange}
                  required
                  className="borrow-input"
                />
              </div>
            </div>
          </div>
          <div className="borrow-modal-footer">
            <Button
              type="button"
              onClick={() => {
                resetForm()
                onClose()
              }}
              variant="secondary"
              className="borrow-cancel-btn"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="borrow-submit-btn"
              disabled={isSubmitting || isSubmittingLocal}
            >
              {isSubmitting ? 'Borrowing...' : 'Borrow Book'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  ) : null
}

BorrowBookModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired
}

export default BorrowBookModal
