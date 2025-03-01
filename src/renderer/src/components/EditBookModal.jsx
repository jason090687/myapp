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
  FaPen
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
    barcode: '',
    date_received: '',
    subject: '',
    additional_author: '',
    copies: '',
    status: 'available', // Set default value
    date_processed: new Date().toISOString().split('T')[0],
    processed_by: currentUser.id
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
    const fetchStatuses = async () => {
      const statuses = await fetchBookStatuses()
      setStatusOptions(statuses)
    }
    fetchStatuses()
  }, [])

  // Update date formatting helper
  const formatDatetime = (dateString) => {
    if (!dateString) return ''
    try {
      const date = new Date(dateString)
      // Ensure the date is valid
      if (isNaN(date.getTime())) return ''

      // Format as YYYY-MM-DDThh:mm
      return date.toISOString().slice(0, 16)
    } catch (error) {
      console.error('Date formatting error:', error)
      return ''
    }
  }

  // Set initial form data when book data is provided
  useEffect(() => {
    if (bookData) {
      setFormData({
        id: bookData.id,
        title: bookData.title || '',
        author: bookData.author || '',
        series_title: bookData.seriesTitle || '',
        publisher: bookData.publisher || '',
        place_of_publication: bookData.placeOfPublication || '',
        year: bookData.year || '',
        edition: bookData.edition || '',
        volume: bookData.volume || '',
        physical_description: bookData.physicalDescription || '',
        isbn: bookData.isbn || '',
        accession_number: bookData.accessionNo || '',
        barcode: bookData.barcode || '',
        date_received: formatDatetime(bookData.dateReceived || ''),
        subject: bookData.subject || '',
        additional_author: bookData.additionalAuthor || '',
        status: bookData.status || 'available', // Add fallback
        date_processed: formatDatetime(bookData.dateProcessed || new Date()),
        processed_by: bookData.processedBy || currentUser.id
      })
    }
  }, [bookData]) // Ensure effect runs when `bookData` updates

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
      barcode: '',
      date_received: '',
      subject: '',
      additional_author: '',
      status: 'available',
      date_processed: new Date().toISOString().split('T')[0],
      processed_by: currentUser.id
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

  // Update handleSubmit to include toast notifications
  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Format the data according to your API requirements
      const updatedData = {
        id: formData.id,
        title: formData.title || null,
        author: formData.author || null,
        series_title: formData.series_title || null,
        publisher: formData.publisher || null,
        place_of_publication: formData.place_of_publication || null,
        year: formData.year ? parseInt(formData.year) : null,
        edition: formData.edition || null,
        volume: formData.volume || null,
        physical_description: formData.physical_description || null,
        isbn: formData.isbn || null,
        accession_number: formData.accession_number || null,
        barcode: formData.barcode || null,
        date_received: formData.date_received ? formatDatetime(formData.date_received) : null,
        subject: formData.subject || null,
        additional_author: formData.additional_author || null,
        status: formData.status, // Don't modify status case or set to null
        date_processed: formatDatetime(formData.date_processed || new Date()),
        processed_by: currentUser.id
      }

      await updateBook(token, updatedData.id, updatedData)
      toast.success('Book updated successfully!', toastConfig)
      onSubmit(updatedData)
      onClose()
    } catch (error) {
      toast.error(error.message || 'Failed to update book', toastConfig)
      console.error('Error updating book:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const inputFields = [
    { name: 'title', label: 'Title*', icon: FaBook, required: true },
    { name: 'author', label: 'Author*', icon: FaUser, required: true },
    { name: 'series_title', label: 'Series Title', icon: FaBookOpen },
    { name: 'publisher', label: 'Publisher', icon: FaBuilding },
    { name: 'place_of_publication', label: 'Place of Publication', icon: FaMapMarker },
    { name: 'year', label: 'Year', icon: FaCalendar, type: 'number' },
    { name: 'edition', label: 'Edition', icon: FaBookmark },
    { name: 'volume', label: 'Volume', icon: FaVolumeUp },
    { name: 'physical_description', label: 'Physical Description', icon: FaBox },
    { name: 'isbn', label: 'ISBN', icon: FaBarcode },
    { name: 'accession_number', label: 'Accession Number', icon: FaHashtag },
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
                  {statusOptions.length > 0 ? (
                    statusOptions.map((option) => (
                      <option key={option.value} value={option.label}>
                        {option.label}
                      </option>
                    ))
                  ) : (
                    <option value="Available">Available</option>
                  )}
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
                value={userDetails.first_name || currentUser.name}
                icon={FaUser}
                disabled
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
