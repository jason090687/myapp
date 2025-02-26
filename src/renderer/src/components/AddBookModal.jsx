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
import './AddBookModal.css'
import { fetchUserDetails, fetchBookStatuses } from '../Features/api'
import { useSelector } from 'react-redux'
import { Bounce, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const AddBookModal = ({ isOpen, onClose, onSubmit, currentUser, onRefresh }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [userDetails, setUserDetails] = useState([])
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
    status: 'Available', // Update to match API case
    date_processed: new Date().toISOString().slice(0, 16), // Format: "YYYY-MM-DDThh:mm"
    processed_by: currentUser.id
  })
  const [statusOptions, setStatusOptions] = useState([])

  const { token } = useSelector((state) => state.auth)

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
  }, [token, currentUser.id])

  useEffect(() => {
    const fetchStatuses = async () => {
      const statuses = await fetchBookStatuses()
      setStatusOptions(statuses)
    }
    fetchStatuses()
  }, [])

  useEffect(() => {
    if (userDetails?.id) {
      setFormData((prev) => ({
        ...prev,
        processed_by: userDetails.id
      }))
    }
  }, [userDetails])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))
  }

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

  const isFormValid = () => {
    const copiesNum = parseInt(formData.copies)
    return (
      formData.title?.trim() &&
      formData.author?.trim() &&
      formData.barcode?.trim() &&
      formData.status &&
      formData.copies &&
      copiesNum > 0 &&
      Number.isInteger(copiesNum) // Ensure it's a valid integer
    )
  }

  const resetFormData = () => {
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
      copies: '',
      status: 'Available', // Update to match API case
      date_processed: new Date().toISOString().slice(0, 16), // Format: "YYYY-MM-DDThh:mm"
      processed_by: currentUser.id // Ensure we use the ID
    })
  }

  const generateSequentialIdentifiers = (totalCopies) => {
    const identifiers = []
    for (let i = 1; i <= totalCopies; i++) {
      identifiers.push({
        copyNumber: i,
        barcode: formData.barcode, // Same barcode for all copies
        accession: formData.accession_number // Keep original accession number
      })
    }
    return identifiers
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!isFormValid()) {
      toast.error('Please fill in all required fields', { ...toastConfig })
      return
    }

    setIsLoading(true)

    try {
      const totalCopies = Math.max(1, parseInt(formData.copies) || 1)
      let successCount = 0
      const failedCopies = []

      // Process books sequentially with incrementing copies
      for (let currentCopy = 1; currentCopy <= totalCopies; currentCopy++) {
        const bookData = {
          ...formData,
          copies: currentCopy, // Set current copy number
          copy_number: currentCopy,
          processed_by: userDetails.id || currentUser.id
        }

        try {
          await onSubmit(bookData)
          successCount++

          toast.info(
            <div>
              <strong>Adding Book</strong>
              <p>
                Processing Copy {currentCopy}/{totalCopies}
                <br />
                Title: {formData.title}
                <br />
                Copy Number: {currentCopy}
              </p>
            </div>,
            {
              ...toastConfig,
              autoClose: 1000,
              toastId: `copy-${currentCopy}`
            }
          )

          // Small delay between submissions
          await new Promise((resolve) => setTimeout(resolve, 300))
        } catch (error) {
          failedCopies.push({
            copyNumber: currentCopy,
            error: error.message
          })
        }
      }

      // Success handling
      if (successCount === totalCopies) {
        toast.success(
          <div>
            <strong>Success!</strong>
            <p>
              Added {totalCopies} copies of "{formData.title}"
            </p>
            <small>
              Copies created: 1 through {totalCopies}
              <br />
              Each copy with incrementing number
            </small>
          </div>,
          { ...toastConfig, autoClose: 4000 }
        )
        onRefresh && onRefresh()
        resetFormData()
        onClose()
      } else {
        // Show failed copies
        toast.error(
          <div>
            <strong>Some copies failed</strong>
            <p>
              Successfully added {successCount} out of {totalCopies} copies
            </p>
            <ul>
              {failedCopies.map((fail) => (
                <li key={fail.copyNumber}>
                  Copy {fail.copyNumber} failed: {fail.error}
                </li>
              ))}
            </ul>
          </div>,
          { ...toastConfig, autoClose: 5000 }
        )
      }
    } catch (error) {
      toast.error('Failed to add books: ' + (error.message || 'Unknown error'), {
        ...toastConfig,
        autoClose: 5000
      })
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
    { name: 'barcode', label: 'Barcode*', icon: FaQrcode, required: true },
    { name: 'subject', label: 'Subject', icon: FaTag },
    { name: 'copies', label: 'Number of Copies*', icon: FaHashtag, type: 'number', required: true },
    { name: 'additional_author', label: 'Additional Author (Optional)', icon: FaPen }
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
                        {' '}
                        {/* Use label as value */}
                        {option.label}
                      </option>
                    ))
                  ) : (
                    <option value="Available">Available</option> // Fallback option
                  )}
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
                value={userDetails.first_name || currentUser.name || ''} // Display name
                icon={FaUser}
                disabled
                id="processed_by_display" // Changed ID to avoid confusion
              />
              {/* Add hidden input to store the ID */}
              <input type="hidden" name="processed_by" value={userDetails.id || currentUser.id} />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="cancel-btn" disabled={isLoading}>
              Cancel
            </button>
            <button type="submit" className="submit-btn" disabled={isLoading || !isFormValid()}>
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
  currentUser: PropTypes.object.isRequired,
  onRefresh: PropTypes.func // Add new prop type
}

export default AddBookModal
