import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from './Sidebar'
import InputField from './InputField'
import AddVariantModal from './AddVariantModal'
import { Progress } from './ui/progress'
import {
  FaBook,
  FaUser,
  FaBookOpen,
  FaBuilding,
  FaMapMarker,
  FaCalendar,
  FaBox,
  FaHashtag,
  FaTag,
  FaPen,
  FaImage,
  FaArrowLeft,
  FaCog
} from 'react-icons/fa'
import './AddBook.css'
import { fetchUserDetails, addNewBook } from '../Features/api'
import { useSelector } from 'react-redux'
import { useToaster } from './Toast/useToaster'
import { useActivity } from '../context/ActivityContext'
import { Button } from './ui/button'

const AddBook = () => {
  const navigate = useNavigate()
  const { token, user: currentUser } = useSelector((state) => state.auth)
  const { addActivity } = useActivity()
  const { showToast } = useToaster()
  const [isLoading, setIsLoading] = useState(false)
  const [userDetails, setUserDetails] = useState([])
  const [isCollapsed, setIsCollapsed] = useState(window.innerWidth <= 768)
  const [variants, setVariants] = useState([])
  const [isVariantModalOpen, setIsVariantModalOpen] = useState(false)
  const [showProgress, setShowProgress] = useState(false)
  const [progressData, setProgressData] = useState({
    current: 0,
    total: 0,
    currentCopy: 0,
    status: '',
    completed: false
  })

  const initialFormState = {
    title: '',
    author: '',
    series_title: '',
    publisher: '',
    place_of_publication: '',
    year: '',
    physical_description: '',
    description: '',
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
    book_cover: null
  }

  const [formData, setFormData] = useState(initialFormState)

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
    if (userDetails?.id) {
      setFormData((prev) => ({
        ...prev,
        processed_by: userDetails.id
      }))
    }
  }, [userDetails])

  useEffect(() => {
    const total = parseInt(formData.copies) || 0
    setVariants((prev) => {
      const currentLength = prev.length
      if (currentLength < total) {
        const newVariants = [...prev]
        for (let i = currentLength; i < total; i++) {
          newVariants.push({
            edition: '',
            volume: '',
            isbn: '',
            accession_number: '',
            call_number: '',
            barcode: ''
          })
        }
        return newVariants
      } else if (currentLength > total) {
        return prev.slice(0, total)
      }
      return prev
    })
  }, [formData.copies])

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

  const isFormValid = () => {
    const totalCopiesNum = parseInt(formData.copies)
    const hasValidVariants =
      variants.length === totalCopiesNum && variants.every((variant) => variant.isbn?.trim())
    return (
      formData.title?.trim() && // Ensure title is required
      formData.author?.trim() && // Ensure author is required
      formData.publisher?.trim() &&
      formData.place_of_publication?.trim() &&
      formData.year?.trim() &&
      formData.copies &&
      formData.date_received?.trim() &&
      formData.status &&
      formData.date_processed &&
      totalCopiesNum > 0 &&
      Number.isInteger(totalCopiesNum) &&
      hasValidVariants
    )
  }

  // const generateSequentialIdentifiers = (totalCopies) => {
  //   const identifiers = []
  //   for (let i = 1; i <= totalCopies; i++) {
  //     identifiers.push({
  //       copyNumber: i,
  //       barcode: formData.barcode, // Same barcode for all copies
  //       accession: formData.accession_number // Keep original accession number
  //     })
  //   }
  //   return identifiers
  // }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!isFormValid()) {
      window.showToast('Error', 'Please fill in all required fields', 'error')
      return
    }

    const totalCopies = variants.length

    // Initialize progress bar
    setProgressData({
      current: 0,
      total: totalCopies,
      currentCopy: 0,
      status: 'Initializing...',
      completed: false
    })
    setShowProgress(true)
    setIsLoading(true)

    try {
      let successCount = 0
      const failedCopies = []

      // Process books sequentially for each variant
      for (let currentCopy = 0; currentCopy < totalCopies; currentCopy++) {
        const variant = variants[currentCopy]

        // Update progress for current copy
        setProgressData((prev) => ({
          ...prev,
          currentCopy: currentCopy + 1,
          status: `Processing copy ${currentCopy + 1} of ${totalCopies}...`
        }))

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
          } else if (key !== 'book_cover' && key !== 'copies') {
            bookData.append(key, formData[key])
          }
        })
        // Add variant data
        bookData.set('edition', variant.edition)
        bookData.set('volume', variant.volume)
        bookData.set('isbn', variant.isbn)
        bookData.set('accession_number', variant.accession_number)
        bookData.set('call_number', variant.call_number)
        bookData.set('barcode', variant.barcode)
        bookData.set('copies', currentCopy + 1)
        bookData.set('processed_by', userDetails.id || currentUser.id)

        // Add the book cover if it exists
        if (formData.book_cover) {
          bookData.append('book_cover', formData.book_cover)
        }

        try {
          await addNewBook(token, bookData)
          successCount++

          // Log activity
          addActivity({
            type: 'book_added',
            description: `Added "${formData.title}" by ${formData.author}`
          })

          // Update progress
          setProgressData((prev) => ({
            ...prev,
            current: successCount,
            status: `Successfully added copy ${currentCopy + 1}`
          }))

          // Small delay between submissions
          await new Promise((resolve) => setTimeout(resolve, 500))
        } catch (error) {
          failedCopies.push({
            copyNumber: currentCopy + 1,
            error: error.message
          })

          // Update progress for failed copy
          setProgressData((prev) => ({
            ...prev,
            status: `Failed to add copy ${currentCopy + 1}`
          }))

          await new Promise((resolve) => setTimeout(resolve, 500))
        }
      }

      // Show completion status
      setProgressData((prev) => ({
        ...prev,
        completed: true,
        status:
          successCount === totalCopies
            ? 'All copies added successfully!'
            : `${successCount} of ${totalCopies} copies added successfully`
      }))

      // Navigate after showing completion for 2 seconds
      setTimeout(() => {
        navigate('/books')
      }, 2000)
    } catch (error) {
      setProgressData((prev) => ({
        ...prev,
        status: 'Error: ' + (error.message || 'Unknown error occurred'),
        completed: true
      }))

      setTimeout(() => {
        setShowProgress(false)
        setIsLoading(false)
      }, 3000)
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
    { name: 'physical_description', label: 'Physical Description', icon: FaBox },
    { name: 'subject', label: 'Subject', icon: FaTag },
    {
      name: 'copies',
      label: 'Total Copies*',
      icon: FaHashtag,
      type: 'number',
      required: true
    },
    { name: 'additional_author', label: 'Additional Author', icon: FaPen }
  ]

  return (
    <div className="app-wrapper">
      <Sidebar isCollapsed={isCollapsed} onToggle={() => setIsCollapsed(!isCollapsed)} />
      <div className={`add-book-container ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="add-book-content">
          <div className="page-header">
            <Button variant="secondary" type="button" onClick={() => navigate('/books')}>
              <FaArrowLeft /> Back to Books
            </Button>
          </div>

          {/* Progress Bar Overlay */}
          {showProgress && (
            <div className="progress-overlay">
              <div className="progress-container">
                <div className="progress-header">
                  <h3>Adding Book Copies</h3>
                  <div className="progress-info">
                    <span className="progress-count">
                      {progressData.current}/{progressData.total}
                    </span>
                    <span className="progress-percentage">
                      {Math.round((progressData.current / progressData.total) * 100)}%
                    </span>
                  </div>
                </div>

                <Progress
                  value={(progressData.current / progressData.total) * 100}
                  className="progress-bar-container"
                />

                <div className="progress-details">
                  <div className="book-title-progress">
                    <strong>{formData.title}</strong>
                  </div>
                  <div className="current-status">{progressData.status}</div>
                  {progressData.completed && (
                    <div className="completion-message">
                      <div className="success-icon">✓</div>
                      <span>Redirecting to Books page...</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

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
              {/* Variants Section - integrated into single form-grid */}
              <div className="form-group variants-group">
                <div className="variants-section-header">
                  <h3 className="variants-section-title">Book Variants (Edition, ISBN, etc.)</h3>
                  <Button
                    variant="primary"
                    type="button"
                    onClick={() => setIsVariantModalOpen(true)}
                    disabled={!formData.copies || parseInt(formData.copies) <= 0}
                  >
                    Manage Variants
                  </Button>
                </div>

                {variants.length > 0 ? (
                  <div className="variants-summary">
                    <p>{variants.length} variant(s) configured</p>
                  </div>
                ) : (
                  <div className="variants-summary">
                    <p>No variants configured. Click "Manage Variants" to add them.</p>
                  </div>
                )}
              </div>

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
                    <option value="Damaged">Damaged</option>
                    <option value="Overdue">Overdue</option>
                    <option value="Lost">Lost</option>
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
                        showToast('Error', 'Invalid image file', 'error')
                      }}
                    />
                    <Button
                      variant="secondary"
                      type="button"
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
                    </Button>
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
              <Button
                variant="secondary"
                type="button"
                onClick={() => navigate('/books')}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={isLoading || !isFormValid()}>
                {isLoading ? (
                  <span className="spinner-wrapper">
                    <div className="spinner"></div>
                    <span>Processing...</span>
                  </span>
                ) : (
                  'Add Book'
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
      <AddVariantModal
        isOpen={isVariantModalOpen}
        onClose={() => setIsVariantModalOpen(false)}
        totalCopiesLimit={parseInt(formData.copies) || 0}
        usedCopies={0}
        variants={variants}
        onVariantsChange={setVariants}
      />
    </div>
  )
}

export default AddBook
