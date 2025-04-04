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
import './AddBookModal.css'
import { fetchUserDetails, fetchBookStatuses } from '../Features/api'
import { useSelector } from 'react-redux'
import { Bounce, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const AddBookModal = ({ isOpen, onClose, onSubmit, currentUser, onRefresh }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [userDetails, setUserDetails] = useState([])

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
    description: '', // Add description to initial form state
    isbn: '',
    accession_number: '',
    call_number: '',
    barcode: '',
    date_received: '',
    subject: '',
    additional_author: '',
    copies: '',
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
    book_cover: null // Add book_cover to initial form state
  }

  const [formData, setFormData] = useState(initialFormState)
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

  const handleChange = (e) => {
    const { name, value, files } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value || '' // Handle file input for book_cover
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
    transition: Bounce,
    closeButton: true
  }

  const isFormValid = () => {
    const copiesNum = parseInt(formData.copies)
    return (
      formData.title?.trim() && // Ensure title is required
      formData.author?.trim() && // Ensure author is required
      formData.publisher?.trim() &&
      formData.place_of_publication?.trim() &&
      formData.year?.trim() &&
      formData.isbn?.trim() &&
      formData.copies &&
      formData.date_received?.trim() &&
      formData.status &&
      formData.date_processed &&
      copiesNum > 0 &&
      Number.isInteger(copiesNum)
    )
  }

  const resetFormData = () => {
    setFormData(initialFormState)
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
        const bookData = new FormData()
        Object.keys(formData).forEach((key) => {
          if (key === 'date_processed') {
            // Update date_processed to current time for each submission
            bookData.append(
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
          } else if (key !== 'book_cover') {
            bookData.append(key, formData[key])
          }
        })
        bookData.set('copies', currentCopy) // Set current copy number
        bookData.set('copy_number', currentCopy)
        bookData.set('processed_by', userDetails.id || currentUser.id)

        // Add the book cover if it exists
        if (formData.book_cover) {
          bookData.append('book_cover', formData.book_cover)
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

      // Only close modal and reset form if all copies were successful
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
        onClose() // Only close modal on complete success
      } else {
        // Keep modal open if there were any failures
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
      // Do not close modal or reset form on error
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  const inputFields = [
    { name: 'title', label: 'Title*', icon: FaBook, required: true }, // Ensure title is required
    { name: 'author', label: 'Author*', icon: FaUser, required: true }, // Ensure author is required
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
    { name: 'volume', label: 'Volume', icon: FaVolumeUp },
    { name: 'physical_description', label: 'Physical Description', icon: FaBox },
    { name: 'isbn', label: 'ISBN*', icon: FaBarcode, required: true },
    { name: 'accession_number', label: 'Accession Number', icon: FaHashtag },
    { name: 'call_number', label: 'Call Number', icon: FaHashtag },
    { name: 'barcode', label: 'Barcode', icon: FaQrcode },
    { name: 'subject', label: 'Subject', icon: FaTag },
    { name: 'copies', label: 'Number of Copies*', icon: FaHashtag, type: 'number', required: true },
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
                value={userDetails?.first_name || currentUser?.name || ''} // Ensure value is never undefined
                icon={FaUser}
                disabled
                id="processed_by_display" // Changed ID to avoid confusion
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

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="cancel-btn" disabled={isLoading}>
              Cancel
            </button>
            <button type="submit" className="submit-btn" disabled={isLoading || !isFormValid()}>
              {isLoading ? (
                <span className="spinner-wrapper">
                  <div className="spinner"></div>
                  <span>Processing...</span>
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
