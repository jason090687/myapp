import { useState, useEffect } from 'react'
import { FaUser, FaBook, FaCalendar, FaTimes } from 'react-icons/fa'
import { fetchAllBooks, borrowBook } from '../Features/api'
import InputField from '../components/InputField'
import Sidebar from '../components/Sidebar'
import './BorrowBookPage.css'
import { useSelector } from 'react-redux'
import { Bounce, toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'

function BorrowBookPage() {
  const navigate = useNavigate()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const handleSidebarToggle = () => setIsCollapsed(!isCollapsed)
  const initialFormData = {
    student: '',
    books: [],
    lexile_level: '',
    due_date: '',
    status: 'Borrowed'
  }
  const [formData, setFormData] = useState(initialFormData)
  const [books, setBooks] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const { token } = useSelector((state) => state.auth)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [globalSearch, setGlobalSearch] = useState('')
  const [showGlobalDropdown, setShowGlobalDropdown] = useState(false)
  const [globalHighlightedIndex, setGlobalHighlightedIndex] = useState(-1)

  const getGlobalFilteredBooks = () => {
    return books.filter((book) => book.title.toLowerCase().includes(globalSearch.toLowerCase()))
  }

  const handleGlobalSelect = (e, book) => {
    e.preventDefault()
    e.stopPropagation()
    setFormData((prev) => ({
      ...prev,
      books: [...prev.books, { book: book.id }]
    }))
    setShowGlobalDropdown(false)
    setGlobalSearch('')
  }

  const handleGlobalKeyDown = (e) => {
    const filtered = getGlobalFilteredBooks()

    switch (e.key) {
      case 'ArrowDown':
        if (showGlobalDropdown && filtered.length > 0) {
          e.preventDefault()
          setGlobalHighlightedIndex((prev) => (prev < filtered.length - 1 ? prev + 1 : prev))
        }
        break
      case 'ArrowUp':
        if (showGlobalDropdown && filtered.length > 0) {
          e.preventDefault()
          setGlobalHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0))
        }
        break
      case 'Enter':
        e.preventDefault()
        if (showGlobalDropdown && globalHighlightedIndex >= 0 && filtered.length > 0) {
          handleGlobalSelect(e, filtered[globalHighlightedIndex])
        }
        break
      case 'Escape':
        setShowGlobalDropdown(false)
        setGlobalHighlightedIndex(-1)
        break
      default:
        break
    }
  }

  const removeBook = (index) => {
    setFormData((prev) => ({
      ...prev,
      books: prev.books.filter((_, i) => i !== index)
    }))
  }

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
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const booksResponse = await fetchAllBooks(token)
        const availableBooks = booksResponse.results
          .filter((book) => book.status !== 'Borrowed')
          .map((book) => ({
            id: book.id,
            title: book.title,
            lexile_level: book.lexile_level
          }))
        setBooks(availableBooks)
      } catch {
        toast.error('Failed to fetch books')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [token])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (isSubmitting) return

    // Validation
    if (!formData.student.trim()) {
      toast.error('Please enter a student ID', {
        position: 'top-right',
        autoClose: 3000,
        theme: 'light'
      })
      return
    }

    if (formData.books.length === 0) {
      toast.error('Please select at least one book', {
        position: 'top-right',
        autoClose: 3000,
        theme: 'light'
      })
      return
    }

    if (!formData.lexile_level.trim()) {
      toast.error('Please enter a lexile level', {
        position: 'top-right',
        autoClose: 3000,
        theme: 'light'
      })
      return
    }

    if (!formData.due_date) {
      toast.error('Please select a due date', {
        position: 'top-right',
        autoClose: 3000,
        theme: 'light'
      })
      return
    }

    setIsSubmitting(true)
    setIsLoading(true)

    try {
      // Borrow each book
      for (const bookData of formData.books) {
        if (bookData.book) {
          const borrowData = {
            student: formData.student,
            book: bookData.book,
            due_date: formData.due_date,
            status: 'Borrowed',
            lexile_level: formData.lexile_level
          }
          await borrowBook(token, borrowData)
        }
      }

      setFormData(initialFormData)
      navigate('/borrowed')
      notifySuccess()
    } catch (error) {
      notifyError(error.message || 'Failed to borrow book')
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

  return (
    <div className="app-wrapper">
      <Sidebar isCollapsed={isCollapsed} onToggle={handleSidebarToggle} />
      <div className={`borrow-page-container ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="borrow-page">
          <div className="borrow-page-header">
            <div className="header-left">
              <div className="header-top">
                <h2>Borrow Book</h2>
                <button onClick={() => navigate('/borrowed')} className="borrow-page-close">
                  ×
                </button>
              </div>
              <input
                type="text"
                placeholder="Search books online..."
                className="global-search"
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                onClick={() => setShowGlobalDropdown(true)}
                onKeyDown={handleGlobalKeyDown}
                onBlur={() => setTimeout(() => setShowGlobalDropdown(false), 200)}
              />
              {showGlobalDropdown && (
                <div className="global-search-results">
                  {getGlobalFilteredBooks().map((book, index) => (
                    <div
                      key={book.id}
                      className={`global-search-item ${index === globalHighlightedIndex ? 'highlighted' : ''}`}
                      onClick={(e) => handleGlobalSelect(e, book)}
                      onMouseEnter={() => setGlobalHighlightedIndex(index)}
                    >
                      {book.title} {book.author ? `- ${book.author}` : ''}
                      {book.isbn ? `(ISBN: ${book.isbn})` : ''}
                    </div>
                  ))}
                  {getGlobalFilteredBooks().length === 0 && globalSearch && (
                    <div className="global-search-item no-results">No books found</div>
                  )}
                </div>
              )}
            </div>
          </div>
          <form onSubmit={handleSubmit} className="borrow-page-form">
            <div className="borrow-form-grid">
              {formData.books.length > 0 &&
                formData.books.map((bookData, index) => (
                  <div key={index} className="borrow-form-group book-field">
                    <div className="borrow-head">
                      <label htmlFor={`book-search-${index}`}>Book {index + 1}*</label>
                      <FaTimes
                        className="remove-icon"
                        onClick={() => removeBook(index)}
                        title="Remove book"
                      />
                    </div>
                    <div className="borrow-display-wrapper">
                      <FaBook className="borrow-search-icon" />
                      <input
                        type="text"
                        id={`book-display-${index}`}
                        value={
                          books.find((b) => b.id === formData.books[index].book)
                            ? `Book: ${books.find((b) => b.id === formData.books[index].book).title}`
                            : 'No book selected'
                        }
                        className="borrow-display-input"
                        readOnly
                        required
                      />
                    </div>
                  </div>
                ))}
              <div className="horizontal-fields">
                <div className="borrow-form-group student-field">
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
                  <label htmlFor="lexile_level">Lexile Level*</label>
                  <InputField
                    type="text"
                    id="lexile_level"
                    name="lexile_level"
                    value={formData.lexile_level}
                    onChange={handleChange}
                    required
                    icon={FaBook}
                    placeholder="Enter lexile level"
                    className="borrow-input"
                  />
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
            </div>
            <div className="borrow-page-footer">
              <button
                type="button"
                onClick={() => navigate('/borrowed')}
                className="borrow-cancel-btn"
              >
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
    </div>
  )
}

export default BorrowBookPage
