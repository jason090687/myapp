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
import { fetchUserDetails, fetchBookStatuses, updateBook, fetchBookDetails } from '../Features/api'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'

const EditBook = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const { token, user: currentUser } = useSelector((state) => state.auth)
  const [isLoading, setIsLoading] = useState(false)
  const [userDetails, setUserDetails] = useState([])
  const [isCollapsed, setIsCollapsed] = useState(window.innerWidth <= 768)

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
    processed_by: currentUser?.id || '',
    description: '',
    book_cover: null,
    selectedFileName: '',
    coverPreview: null
  }

  const [formData, setFormData] = useState(initialFormState)
  const [statusOptions, setStatusOptions] = useState([])

  useEffect(() => {
    setIsLoading(true)
    const fetchUserData = async () => {
      try {
        const response = await fetchUserDetails(token)
        setUserDetails(response)
      } catch (error) {
        console.error('Error fetching user details:', error)
      } finally {
        setIsLoading(false)
      }
    }
    if (token) fetchUserData()
  }, [token, currentUser?.id])

  useEffect(() => {
    const getStatuses = async () => {
      if (!token) {
        console.error('Token is missing.')
        return
      }
      try {
        const statuses = await fetchBookStatuses(token)
        setStatusOptions(statuses)
      } catch (error) {
        console.error('Error loading status options:', error)
      }
    }

    getStatuses()
  }, [token])

  useEffect(() => {
    if (userDetails?.id) {
      setFormData((prev) => ({
        ...prev,
        processed_by: userDetails.id
      }))
    }
  }, [userDetails])

  useEffect(() => {
    const fetchBook = async () => {
      if (!id || !token) return
      try {
        const book = await fetchBookDetails(token, id)
        // Populate form data
        setFormData({
          title: book.title || '',
          author: book.author || '',
          series_title: book.series_title || '',
          publisher: book.publisher || '',
          place_of_publication: book.place_of_publication || '',
          year: book.year?.toString() || '',
          edition: book.edition || '',
          volume: book.volume?.toString() || '',
          physical_description: book.physical_description || '',
          isbn: book.isbn || '',
          accession_number: book.accession_number || '',
          call_number: book.call_number || '',
          barcode: book.barcode || '',
          date_received: book.date_received
            ? new Date(book.date_received).toISOString().split('T')[0]
            : '',
          subject: book.subject || '',
          additional_author: book.additional_author || '',
          status: book.status || 'Available',
          date_processed: book.date_processed
            ? new Date(book.date_processed).toISOString().slice(0, 16)
            : new Date().toISOString().slice(0, 16),
          processed_by: book.processed_by || currentUser?.id || '',
          description: book.description || '',
          book_cover: null,
          selectedFileName: '',
          coverPreview: book.book_cover || null
        })
      } catch (error) {
        console.error('Error fetching book details:', error)
        toast.error('Failed to load book details')
        navigate('/books')
      }
    }
    fetchBook()
  }, [id, token, currentUser?.id, navigate])

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setIsCollapsed(true)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleChange = (e) => {
    const { name, value, files } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value || ''
    }))
  }

  // Add image handling function
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

  const toastConfig = {
    position: 'top-right',
    autoClose: 2000,
    hideProgressBar: true,
    closeOnClick: true,
    pauseOnHover: false,
    draggable: false,
    theme: 'light',
    closeButton: true
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
      toast.error('Please fill in all required fields', { ...toastConfig })
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
      bookDataToSend.set('processed_by', userDetails.id || currentUser.id)

      if (formData.book_cover) {
        bookDataToSend.append('book_cover', formData.book_cover)
      }

      await updateBook(token, id, bookDataToSend)

      toast.success('Book updated successfully!', toastConfig)
      navigate('/books')
    } catch (error) {
      toast.error(error.message || 'Failed to update book', toastConfig)
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
                    {statusOptions
                      .filter((option) => option.value !== 'Available')
                      .map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
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
                  value={userDetails?.first_name || currentUser?.name || ''}
                  icon={FaUser}
                  disabled
                  id="processed_by_display"
                />
                {/* Add hidden input to store the ID */}
                <input
                  type="hidden"
                  name="processed_by"
                  value={userDetails?.id || currentUser?.id || ''}
                />
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
                        toast.error('Invalid image file', toastConfig)
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
                disabled={isLoading}
              >
                Cancel
              </button>
              <button type="submit" className="submit-btn" disabled={isLoading || !isFormValid()}>
                {isLoading ? (
                  <span className="spinner-wrapper">
                    <div className="spinner"></div>
                    <span>Processing...</span>
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
