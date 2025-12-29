import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import ReactModal from 'react-modal'
import { FaTimes } from 'react-icons/fa'

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    transform: 'translate(-50%, -50%)',
    maxWidth: '500px',
    width: '90%',
    borderRadius: '16px',
    padding: '2rem'
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    zIndex: 1000
  }
}

const EditStudentModal = ({ isOpen, onClose, onSubmit, student }) => {
  const [formData, setFormData] = useState({
    name: '',
    id_number: '',
    year_level: '',
    active: false
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (student && isOpen) {
      setFormData({
        name: student.name || '',
        id_number: student.id_number || '',
        year_level: student.year_level || '',
        active: student.active || false
      })
    }
  }, [student, isOpen])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await onSubmit(formData)
      onClose()
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <ReactModal // Changed from Modal to ReactModal
      isOpen={isOpen}
      onRequestClose={onClose}
      style={customStyles}
      contentLabel="Edit Student"
      ariaHideApp={false}
    >
      <div className="modal-header">
        <h2>Edit Student Details</h2>
        <button onClick={onClose} className="close-btn">
          <FaTimes />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="edit-form">
        <div className="form-group">
          <label htmlFor="name">Student ID</label>
          <input
            type="text"
            id="id_number"
            name="id_number"
            value={formData.id_number}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="year_level">Year Level</label>
          <input
            type="text"
            id="year_level"
            name="year_level"
            value={formData.year_level}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group status-toggle">
          <div className="toggle-container">
            <label className="toggle">
              <input
                type="checkbox"
                name="active"
                checked={formData.active}
                onChange={handleChange}
              />
              <span className="slider"></span>
            </label>
            <span className="toggle-label">Active Status</span>
          </div>
        </div>

        <div className="modal-actions">
          <button type="button" onClick={onClose} className="cancel-btn" disabled={isSubmitting}>
            Cancel
          </button>
          <button type="submit" className="submit-btn" disabled={isSubmitting}>
            {isSubmitting ? (
              <div className="spinner-wrapper">
                <div className="spinnerer" />
                <span>Saving...</span>
              </div>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </form>
    </ReactModal>
  )
}

EditStudentModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  student: PropTypes.object
}

export default EditStudentModal
