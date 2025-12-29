import { useState } from 'react'
import PropTypes from 'prop-types'
import ReactModal from 'react-modal'
import { FaTimes } from 'react-icons/fa'
// import { Bounce, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useActivity } from '../context/ActivityContext'

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

const AddStaffBookModal = ({ isOpen, onClose, onSubmit }) => {
  const { addActivity } = useActivity()
  const [formData, setFormData] = useState({
    name: '',
    id_number: '',
    active: true
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

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

      // Log activity
      addActivity({
        type: 'staff_added',
        description: `Added staff member "${formData.name}" (ID: ${formData.id_number})`
      })

      onClose()
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <ReactModal
      isOpen={isOpen}
      onRequestClose={onClose}
      style={customStyles}
      contentLabel="Add Staff"
      ariaHideApp={false}
    >
      <div className="modal-header">
        <h2>Add New Staff</h2>
        <button onClick={onClose} className="close-btn">
          <FaTimes />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="edit-form">
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
          <label htmlFor="id_number">ID Number</label>
          <input
            type="text"
            id="id_number"
            name="id_number"
            value={formData.id_number}
            onChange={handleChange}
            required
          />
        </div>

        <div className="modal-actions">
          <button type="button" onClick={onClose} className="cancel-btn" disabled={isSubmitting}>
            Cancel
          </button>
          <button type="submit" className="submit-btn" disabled={isSubmitting}>
            {isSubmitting ? (
              <div className="spinner-wrapper">
                <div className="spinner" />
                <span>Adding...</span>
              </div>
            ) : (
              'Add Staff'
            )}
          </button>
        </div>
      </form>
    </ReactModal>
  )
}

AddStaffBookModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired
}

export default AddStaffBookModal
