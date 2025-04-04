import { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import InputField from './InputField'
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
  FaImage
} from 'react-icons/fa'
import { fetchUserDetails, updateBook, fetchBookStatuses } from '../Features/api'
import { useSelector } from 'react-redux'
import './AddBookModal.css' // Use the same modal styles
import { Bounce, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const EditBookModal = ({ isOpen, onClose, onSubmit, bookData, currentUser }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [userDetails, setUserDetails] = useState([])
  const [statusOptions, setStatusOptions] = useState([])
  const [formData, setFormData] = useState({
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
    copies: '',
    status: '', // Change to lowercase to match API
    date_processed: new Date().toISOString().split('T')[0],
    processed_by: currentUser.id,
    description: '', // Add description field
    book_cover: null,
    selectedFileName: '',
    coverPreview: null
  })

  const { token } = useSelector((state) => state.auth)

  // Load user details
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetchUserDetails(token)
        setUserDetails(response)
      } catch (error) {
        console.error('Error fetching user details:', error)
      }
    }
    fetchUserData()
  }, [token])

  // Add status options fetching
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

  // Update formatDatetime to handle both date and datetime-local inputs
  const formatDatetime = (dateString, type = 'date') => {
    if (!dateString) return ''
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return ''

      if (type === 'datetime-local') {
        return date.toISOString().slice(0, 16) // Format as YYYY-MM-DDThh:mm
      }
      return date.toISOString().slice(0, 10) // Format as YYYY-MM-DD
    } catch (error) {
      console.error('Date formatting error:', error)
      return ''
    }
  }

  // Set initial form data when book data is provided
  useEffect(() => {
    if (bookData) {
      setFormData((prev) => ({
        ...prev,
        id: bookData.id,
        title: bookData.title || '',
        author: bookData.author || '',
        series_title: bookData.series_title || '',
        publisher: bookData.publisher || '',
        place_of_publication: bookData.place_of_publication || '',
        year: bookData.year?.toString() || '', // Convert number to string
        edition: bookData.edition || '',
        volume: bookData.volume?.toString() || '', // Convert number to string
        physical_description: bookData.physical_description || '',
        isbn: bookData.isbn || '',
        accession_number: bookData.accession_number || '',
        call_number: bookData.call_number || '',
        barcode: bookData.barcode || '',
        date_received: formatDatetime(bookData.date_received),
        subject: bookData.subject || '',
        additional_author: bookData.additional_author || '',
        status: bookData.status || 'available',
        date_processed: formatDatetime(bookData.date_processed || new Date(), 'datetime-local'),
        processed_by: bookData.processed_by || currentUser?.id,
        processed_by_name: bookData.name || currentUser?.name || '',
        copies: bookData.copies?.toString() || '1', // Convert number to string
        description: bookData.description || '', // Add description from bookData
        book_cover: null,
        selectedFileName: '',
        coverPreview: bookData.book_cover || null
      }))
    }
  }, [bookData, userDetails, currentUser])

  // Add a reset function
  const resetForm = () => {
    setFormData({
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
      status: 'available',
      date_processed: new Date().toISOString().split('T')[0],
      processed_by: currentUser.id,
      description: '', // Add description reset
      book_cover: null,
      selectedFileName: '',
      coverPreview: null
    })
  }

  // Add cleanup effect when modal closes
  useEffect(() => {
    if (!isOpen) {
      resetForm()
    }
  }, [isOpen, currentUser.id])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value
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

  // Add toast configuration
  const toastConfig = {
    position: 'top-right',
    autoClose: 2000,
    hideProgressBar: true,
    closeOnClick: true,
    pauseOnHover: false,
    draggable: false,
    theme: 'light',
    transition: Bounce,
    closeButton: true
  }

  // Update handleSubmit to include image upload
  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const formDataToSend = new FormData()

      // Ensure processed_by is sent as ID/PK
      const dataToSend = {
        ...formData,
        processed_by: userDetails?.id || currentUser?.id || formData.processed_by
      }

      // Remove the display name before sending
      delete dataToSend.processed_by_name

      // Add all form fields
      Object.keys(dataToSend).forEach((key) => {
        if (!['coverPreview', 'selectedFileName'].includes(key) && dataToSend[key] !== null) {
          formDataToSend.append(key, dataToSend[key])
        }
      })

      // Add the book cover if it exists
      if (formData.book_cover) {
        formDataToSend.append('book_cover', formData.book_cover)
      }

      await updateBook(token, formData.id, formDataToSend)
      // toast.success('Book updated successfully!', toastConfig) remove double TOAST
      onSubmit(formDataToSend)
      onClose()
    } catch (error) {
      toast.error(error.message || 'Failed to update book', toastConfig)
      console.error('Error updating book:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Update input fields array to ensure number inputs are handled properly
  const inputFields = [
    { name: 'title', label: 'Title*', icon: FaBook, required: true },
    { name: 'author', label: 'Author*', icon: FaUser, required: true },
    { name: 'series_title', label: 'Series Title', icon: FaBookOpen },
    { name: 'publisher', label: 'Publisher', icon: FaBuilding },
    { name: 'place_of_publication', label: 'Place of Publication', icon: FaMapMarker },
    { name: 'year', label: 'Year', icon: FaCalendar, type: 'text' }, // Changed from 'number'
    { name: 'edition', label: 'Edition', icon: FaBookmark },
    { name: 'volume', label: 'Volume', icon: FaVolumeUp, type: 'text' }, // Changed from implicit number
    { name: 'physical_description', label: 'Physical Description', icon: FaBox },
    { name: 'isbn', label: 'ISBN', icon: FaBarcode },
    { name: 'accession_number', label: 'Accession Number', icon: FaHashtag },
    { name: 'call_number', label: 'Call Number', icon: FaHashtag },
    { name: 'barcode', label: 'Barcode', icon: FaQrcode },
    { name: 'subject', label: 'Subject', icon: FaTag },
    { name: 'additional_author', label: 'Additional Author', icon: FaPen }
  ]

  // Add an early return if the modal shouldn't be visible
  if (!isOpen || !bookData) return null

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Edit Book</h2>
          <button onClick={onClose} className="close-btn">
            &times;
          </button>
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

            {/* Special fields */}
            <div className="form-group">
              <label htmlFor="date_received">Date Received</label>
              <InputField
                type="date"
                id="date_received"
                name="date_received"
                value={formData.date_received}
                onChange={handleChange}
                icon={FaCalendar}
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
                  {statusOptions.map((option) => (
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
                type="datetime-local" // Changed from 'date' to 'datetime-local'
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
                value={formData.processed_by_name} // Show name for display
                icon={FaUser}
                disabled
                id="processed_by_display"
              />
              <input
                type="hidden"
                name="processed_by"
                value={formData.processed_by} // Store actual ID
              />
            </div>

            <div className="form-group">
              <label htmlFor="book_cover">Book Cover</label>
              <div className="cover-url-wrapper" onClick={handleCoverUrlClick}>
                <InputField
                  type="text"
                  id="book_cover"
                  name="book_cover"
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

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="cancel-btn" disabled={isLoading}>
              Cancel
            </button>
            <button type="submit" className="submit-btn" disabled={isLoading}>
              {isLoading ? (
                <span className="spinner-wrapper">
                  <div className="spinner"></div>
                  <span>Saving...</span>
                </span>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

EditBookModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  bookData: PropTypes.object,
  currentUser: PropTypes.object.isRequired
}

export default EditBookModal
