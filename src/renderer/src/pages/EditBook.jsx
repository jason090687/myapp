import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import InputField from '../components/InputField'
import {
  FaBook,
  FaUser,
  FaBookOpen,
  FaBuilding,
  FaMapMarker,
  FaCalendar,
  FaBookmark,
  FaVolumeUp,
  FaBox,
  FaBarcode,
  FaHashtag,
  FaQrcode,
  FaTag,
  FaPen,
  FaImage,
  FaArrowLeft
} from 'react-icons/fa'
import '../components/AddBook.css'
import { updateBook, fetchBookDetails } from '../Features/api'
import { useToaster } from '../components/Toast/useToaster'
import { useSelector } from 'react-redux'

const EditBook = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const { showToast } = useToaster()
  const [isLoading, setIsLoading] = useState(false)
  const [isPageLoading, setIsPageLoading] = useState(true)
  const [isCollapsed, setIsCollapsed] = useState(window.innerWidth <= 768)
  const [bookDetails, setBookDetails] = useState(null)
  // const [userDetails, setUserDetails] = useState([])
  const { token } = useSelector((state) => state.auth)

  const initialFormState = {
    title: '',
    author: '',
    series_title: '',
    publisher: '',
    place_of_publication: '',
    year: '',
    edition: '',
    volume: '',
    physical_description: '',
    isbn: '',
    accession_number: '',
    call_number: '',
    barcode: '',
    date_received: '',
    subject: '',
    additional_author: '',
    status: 'Available',
    date_processed: new Date()
      .toLocaleString('sv-SE', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
      .replace(' ', 'T'),
    processed_by: '',
    description: '',
    book_cover: null,
    selectedFileName: '',
    coverPreview: null
  }

  const [formData, setFormData] = useState(initialFormState)

  // useEffect(() => {
  //   const loadUserDetails = async () => {
  //     try {
  //       const response = await fetchUserDetails(token)
  //       setUserDetails(response)
  //     } catch (error) {
  //       console.error('Error fetching user details:', error)
  //     } finally {
  //       setIsLoading(false)
  //     }
  //   }
  //   if (token) {
  //     loadUserDetails()
  //   }
  // }, [])

  // Fetch book details
  useEffect(() => {
    const loadBookDetails = async () => {
      try {
        setIsPageLoading(true)
        const data = await fetchBookDetails(token, id)
        console.log('Book details loaded:', data)
        setBookDetails(data)
      } catch (error) {
        console.error('Error loading book details:', error)
        showToast('Error', 'Failed to load book details', 'error')
        navigate('/books')
      } finally {
        setIsPageLoading(false)
      }
    }

    if (token) {
      loadBookDetails()
    }
  }, [id, token])

  // Update form when book details load
  useEffect(() => {
    if (bookDetails) {
      console.log('Updating form with book details:', bookDetails)
      setFormData({
        title: bookDetails.title || '',
        author: bookDetails.author || '',
        series_title: bookDetails.series_title || '',
        publisher: bookDetails.publisher || '',
        place_of_publication: bookDetails.place_of_publication || '',
        year: bookDetails.year?.toString() || '',
        edition: bookDetails.edition || '',
        volume: bookDetails.volume?.toString() || '',
        physical_description: bookDetails.physical_description || '',
        isbn: bookDetails.isbn || '',
        accession_number: bookDetails.accession_number || '',
        call_number: bookDetails.call_number || '',
        barcode: bookDetails.barcode || '',
        date_received: bookDetails.date_received
          ? new Date(bookDetails.date_received).toISOString().split('T')[0]
          : '',
        subject: bookDetails.subject || '',
        additional_author: bookDetails.additional_author || '',
        status: bookDetails.status || 'Available',
        date_processed: bookDetails.date_processed
          ? new Date(bookDetails.date_processed).toISOString().slice(0, 16)
          : new Date().toISOString().slice(0, 16),
        processed_by: bookDetails.processed_by || '',
        description: bookDetails.description || '',
        book_cover: null,
        selectedFileName: '',
        coverPreview: bookDetails.book_cover || null
      })
    }
  }, [bookDetails])

  const handleChange = (e) => {
    const { name, value, files } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value || ''
    }))
  }

  // Helper function to show toast using custom Toast system
  const handleCoverUrlClick = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = (e) => {
      const file = e.target.files[0]
      if (file) {
        setFormData((prev) => ({
          ...prev,
          book_cover: file,
          selectedFileName: file.name,
          coverPreview: URL.createObjectURL(file)
        }))
      }
    }
    input.click()
  }

  const isFormValid = () => {
    return (
      formData.title?.trim() && // Ensure title is required
      formData.author?.trim() && // Ensure author is required
      formData.publisher?.trim() &&
      formData.place_of_publication?.trim() &&
      formData.year?.trim() &&
      formData.date_received?.trim() &&
      formData.status &&
      formData.date_processed
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!isFormValid()) {
      showToast('Error', 'Please fill in all required fields', 'error')
      return
    }

    setIsLoading(true)

    try {
      const bookDataToSend = new FormData()
      Object.keys(formData).forEach((key) => {
        if (key === 'date_processed') {
          bookDataToSend.append(
            key,
            new Date()
              .toLocaleString('sv-SE', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
              })
              .replace(' ', 'T')
          )
        } else if (key !== 'book_cover' && key !== 'selectedFileName' && key !== 'coverPreview') {
          bookDataToSend.append(key, formData[key])
        }
      })
      bookDataToSend.set('copies', 1)
      bookDataToSend.set('copy_number', 1)
      bookDataToSend.set('processed_by', bookDetails.processed_by || '')

      if (formData.book_cover) {
        bookDataToSend.append('book_cover', formData.book_cover)
      }

      console.log('Submitting book update...')
      await updateBook(token, id, bookDataToSend)

      showToast('Success', 'Book updated successfully!', 'success')
      navigate('/books')
    } catch (error) {
      console.error('Error updating book:', error)
      showToast('Error', error.message || 'Failed to update book', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const inputFields = [
    { name: 'title', label: 'Title*', icon: FaBook, required: true },
    { name: 'author', label: 'Author*', icon: FaUser, required: true },
    { name: 'series_title', label: 'Series Title', icon: FaBookOpen },
    { name: 'publisher', label: 'Publisher*', icon: FaBuilding, required: true },
    {
      name: 'place_of_publication',
      label: 'Place of Publication*',
      icon: FaMapMarker,
      required: true
    },
    { name: 'year', label: 'Year*', icon: FaCalendar, type: 'number', required: true },
    { name: 'edition', label: 'Edition', icon: FaBookmark },
    { name: 'volume', label: 'Volume', icon: FaVolumeUp, type: 'text' },
    { name: 'physical_description', label: 'Physical Description', icon: FaBox },
    { name: 'isbn', label: 'ISBN', icon: FaBarcode },
    { name: 'accession_number', label: 'Accession Number', icon: FaHashtag },
    { name: 'call_number', label: 'Call Number', icon: FaHashtag },
    { name: 'barcode', label: 'Barcode', icon: FaQrcode },
    { name: 'subject', label: 'Subject', icon: FaTag },
    { name: 'additional_author', label: 'Additional Author', icon: FaPen }
  ]

  return (
    <div className="app-wrapper">
      <Sidebar isCollapsed={isCollapsed} onToggle={() => setIsCollapsed(!isCollapsed)} />
      <div className={`add-book-container ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="add-book-content">
          <div className="page-header">
            <button onClick={() => navigate('/books')} className="back-btn">
              <FaArrowLeft /> Back to Books
            </button>
            {/* <h1>Edit Book</h1> */}
          </div>

          <form onSubmit={handleSubmit} className="add-book-form">
            <div className="form-grid">
              {inputFields.map((field) => (
                <div className="form-group" key={field.name}>
                  <label htmlFor={field.name}>{field.label}</label>
                  <InputField
                    type={field.type || 'text'}
                    id={field.name}
                    name={field.name}
                    required={field.required}
                    value={formData[field.name]}
                    onChange={handleChange}
                    icon={field.icon}
                    placeholder={field.label}
                  />
                </div>
              ))}

              <div className="form-group">
                <label htmlFor="date_received">Date Received*</label>
                <InputField
                  type="date"
                  id="date_received"
                  name="date_received"
                  value={formData.date_received}
                  onChange={handleChange}
                  icon={FaCalendar}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="status">Status*</label>
                <div className="select-wrapper">
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="select-field"
                    required
                  >
                    <option value="Available">Available</option>
                    <option value="Borrowed">Borrowed</option>
                    <option value="Lost">Lost</option>
                    <option value="Damaged">Damaged</option>
                    <option value="Overdue">Overdue</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="date_processed">Date Processed</label>
                <InputField
                  type="datetime-local" // Change to datetime-local
                  id="date_processed"
                  name="date_processed"
                  value={formData.date_processed}
                  onChange={handleChange}
                  icon={FaCalendar}
                  disabled
                />
              </div>

              <div className="form-group">
                <label htmlFor="processed_by">Processed By</label>
                <InputField
                  type="text"
                  value={bookDetails?.processed_by || ''}
                  icon={FaUser}
                  disabled
                  id="processed_by_display"
                />
                {/* Add hidden input to store the ID */}
                <input type="hidden" name="processed_by" value={bookDetails?.processed_by || ''} />
              </div>

              <div className="form-group">
                <label htmlFor="book_cover">Book Cover</label>
                <div className="cover-url-wrapper" onClick={handleCoverUrlClick}>
                  <InputField
                    type="text"
                    id="book_cover"
                    name="book_cover_display"
                    value={formData.selectedFileName || 'Click to upload image...'}
                    readOnly
                    icon={FaImage}
                    className="cover-url-input"
                  />
                </div>
                {formData.coverPreview && (
                  <div className="cover-preview-link">
                    <img
                      src={formData.coverPreview}
                      alt="Cover preview"
                      onError={(e) => {
                        e.target.onerror = null
                        e.target.style.display = 'none'
                        showToast('Invalid image file', 'error')
                      }}
                    />
                    <button
                      type="button"
                      className="cancel-image-btn"
                      onClick={() => {
                        setFormData((prev) => ({
                          ...prev,
                          book_cover: null,
                          selectedFileName: '',
                          coverPreview: null
                        }))
                      }}
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>

              <div className="form-group description-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter book description..."
                />
              </div>
            </div>

            <div className="page-footer">
              <button
                type="button"
                onClick={() => navigate('/books')}
                className="cancel-btn"
                disabled={isLoading || isPageLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="submit-btn"
                disabled={isLoading || !isFormValid() || isPageLoading}
              >
                {isLoading ? (
                  <span className="spinner-wrapper">
                    <div className="spinner"></div>
                    <span>Processing...</span>
                  </span>
                ) : isPageLoading ? (
                  <span className="spinner-wrapper">
                    <div className="spinner"></div>
                    <span>Loading...</span>
                  </span>
                ) : (
                  'Update Book'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default EditBook
