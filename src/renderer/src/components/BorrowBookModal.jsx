import { useState, useEffect, useMemo, useRef } from 'react'
import PropTypes from 'prop-types'
import { FaUser, FaBook, FaCalendar } from 'react-icons/fa'
import { fetchAllBooks, borrowBook } from '../Features/api'
import InputField from './InputField'
import './BorrowBookModal.css'
import { useSelector } from 'react-redux'
import { Bounce, toast } from 'react-toastify'

function BorrowBookModal({ isOpen, onClose, onSubmit }) {
  const initialFormData = {
    student: '',
    book: '',
    due_date: '',
    status: 'Borrowed'
  }
  const [formData, setFormData] = useState(initialFormData)
  const [books, setBooks] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [bookSearch, setBookSearch] = useState('')
  const [selectedBook, setSelectedBook] = useState(null)
  const [showBookDropdown, setShowBookDropdown] = useState(false)
  const { token } = useSelector((state) => state.auth)
  const bookInputRef = useRef(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const dropdownRef = useRef(null)

  const filteredBooks = useMemo(() => {
    return books.filter((book) => book.title.toLowerCase().includes(bookSearch.toLowerCase()))
  }, [books, bookSearch])

  const notifySuccess = () =>
    toast.success('Book borrowed successfully!', {
      position: 'top-right',
      autoClose: 3000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: false,
      draggable: false,
      theme: 'light',
      transition: Bounce
    })

  const notifyError = (message) =>
    toast.error(message || 'Failed to borrow book', {
      position: 'top-right',
      autoClose: 3000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: false,
      draggable: false,
      theme: 'light',
      transition: Bounce
    })

  useEffect(() => {
    if (!isOpen) return

    const fetchData = async () => {
      setIsLoading(true)
      try {
        const booksResponse = await fetchAllBooks(token, bookSearch)
        const availableBooks = booksResponse.results
          .filter((book) => book.status !== 'Borrowed') // Only include books that are not borrowed
          .map((book) => ({
            id: book.id,
            title: book.title
            // author: book.author,
            // isbn: book.isbn
          }))
        setBooks(availableBooks)
      } catch (error) {
        toast.error('Failed to fetch books')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [isOpen, token, bookSearch])

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
    setIsLoading(true)

    try {
      const borrowData = {
        student: formData.student,
        book: formData.book,
        due_date: formData.due_date,
        status: 'Borrowed'
      }

      await borrowBook(token, borrowData)
      onSubmit(borrowData)

      setFormData(initialFormData)
      setBookSearch('')
      setSelectedBook(null)
      onClose()
      notifySuccess()
    } catch (error) {
      notifyError()
    } finally {
      setIsSubmitting(false)
      setIsLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  const handleBookSelect = (book) => {
    setSelectedBook(book)
    setFormData((prev) => ({ ...prev, book: book.id }))
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
          <button onClick={onClose} className="borrow-modal-close">
            &times;
          </button>
        </div>
        <form onSubmit={handleSubmit} className="borrow-modal-form">
          <div className="borrow-form-grid">
            <div className="borrow-form-group">
              <label htmlFor="student" className="required">
                Student ID
              </label>
              <InputField
                type="text"
                id="student"
                name="student"
                value={formData.student}
                onChange={handleChange}
                required
                icon={FaUser}
                placeholder="Enter student ID"
                className="borrow-input"
              />
            </div>
            <div className="borrow-form-group">
              <label htmlFor="book-search">Book*</label>
              <div className="borrow-search-wrapper" ref={bookInputRef}>
                <FaBook className="borrow-search-icon" />
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
                    {isLoading ? (
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
              <label htmlFor="due_date">Due Date*</label>
              <InputField
                type="date"
                id="due_date"
                name="due_date"
                value={formData.due_date}
                onChange={handleChange}
                required
                icon={FaCalendar}
                className="borrow-input"
              />
            </div>
          </div>
          <div className="borrow-modal-footer">
            <button type="button" onClick={onClose} className="borrow-cancel-btn">
              Cancel
            </button>
            <button
              type="submit"
              className="borrow-submit-btn"
              disabled={isLoading || isSubmitting}
            >
              {isSubmitting ? (
                <div className="button-spinner">
                  <div className="spinner"></div>
                </div>
              ) : (
                'Borrow Book'
              )}
            </button>
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
