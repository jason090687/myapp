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
  FaFileAlt,
  FaCheck,
  FaTimesCircle,
  FaExchangeAlt
} from 'react-icons/fa'
import './AddBookModal.css'
import { fetchStatus, fetchUserDetails } from '../Features/api'
import { useSelector } from 'react-redux'

const AddBookModal = ({ isOpen, onClose, onSubmit, currentUser }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [userDetails, setUserDetails] = useState([])
  const [status, setStatus] = useState([])
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
    status: 'available',
    date_processed: new Date().toISOString().split('T')[0],
    processed_by: currentUser.id // Ensure it's set correctly
  })

  const { token } = useSelector((state) => state.auth)

  useEffect(() => {
    setIsLoading(true)
    const fetchUserData = async () => {
      try {
        const response = await fetchUserDetails(token)
        setUserDetails(response)

        setFormData((prevFormData) => ({
          ...prevFormData,
          processed_by: response.id || currentUser.id
        }))
        console.log('User details:', setFormData)
      } catch (error) {
        console.error('Error fetching user details:', error)
      } finally {
        setIsLoading(false)
      }
    }
    if (token) fetchUserData()
  }, [token, currentUser.id])

  useEffect(() => {
    setIsLoading(true)
    const fetchStatusData = async () => {
      try {
        const response = await fetchStatus(token)

        // Convert object to array, but keep values exactly as they are
        const statusArray = Object.entries(response).map(([key, value]) => ({
          value: key, // Keep original case
          label: value
        }))

        setStatus(statusArray)
      } catch (error) {
        console.log('Error fetching status', error)
        setStatus([])
      } finally {
        setIsLoading(false)
      }
    }
    fetchStatusData()
  }, [token])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Simplify the status handling - just use the selected value directly
      const bookData = {
        ...formData,
        year: formData.year ? parseInt(formData.year) : null,
        processed_by: formData.processed_by,
        // Don't transform status, use it directly from form
        status: formData.status
      }

      await onSubmit(bookData)

      // Reset form after successful submission
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
        status: 'available', // Set default status directly
        date_processed: new Date().toISOString().split('T')[0],
        processed_by: userDetails.id || currentUser.id // Ensure correct user
      })

      onClose()
    } catch (error) {
      console.error('Error adding book:', error)
      alert(error.message || 'Failed to add book')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

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

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Add New Book</h2>
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

            {/* Special fields that need different handling */}
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
              <label htmlFor="status">Status</label>
              <div className="select-wrapper">
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="select-field"
                  disabled={status.length === 0}
                >
                  {status.length > 0 &&
                    status.map(
                      ({ value, label }) =>
                        value !== 'available' && (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        )
                    )}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="date_processed">Date Processed</label>
              <InputField
                type="date"
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
                  <span>Adding...</span>
                </span>
              ) : (
                'Add Book'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

AddBookModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  currentUser: PropTypes.object.isRequired
}

export default AddBookModal
