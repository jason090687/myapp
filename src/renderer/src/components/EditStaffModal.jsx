import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { X, User, Hash } from 'lucide-react'
import { Button } from './ui/button'
import './EditStaffModal.css'

const EditStaffModal = ({ isOpen, onClose, onSubmit, studentData }) => {
  const [formData, setFormData] = useState({
    name: '',
    id_number: '',
    active: false
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (studentData && isOpen) {
      setFormData({
        name: studentData.name || '',
        id_number: studentData.id_number || '',
        active: studentData.active || false
      })
    }
  }, [studentData, isOpen])

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

  if (!isOpen) return null

  return (
    <div className="edit-staff-modal-overlay">
      <div className="edit-staff-modal-content">
        <div className="edit-staff-modal-header">
          <h2>Edit Staff Details</h2>
          <button onClick={onClose} className="edit-staff-modal-close" aria-label="Close modal">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="edit-staff-modal-body">
            <div className="edit-staff-field-group">
              <label htmlFor="name">Full Name</label>
              <div className="edit-staff-input-wrapper">
                <User size={18} />
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter staff member's full name"
                />
              </div>
            </div>

            <div className="edit-staff-field-group">
              <label htmlFor="id_number">Employee ID</label>
              <div className="edit-staff-input-wrapper">
                <Hash size={18} />
                <input
                  type="text"
                  id="id_number"
                  name="id_number"
                  value={formData.id_number}
                  onChange={handleChange}
                  required
                  placeholder="Enter employee ID number"
                />
              </div>
            </div>

            <div className="edit-staff-field-group">
              <label htmlFor="active">Active Status</label>
              <div className="edit-staff-toggle-wrapper">
                <label className="edit-staff-toggle">
                  <input
                    type="checkbox"
                    name="active"
                    checked={formData.active}
                    onChange={handleChange}
                  />
                  <span className="edit-staff-slider"></span>
                </label>
                <span className="edit-staff-toggle-label">
                  {formData.active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>

          <div className="edit-staff-modal-footer">
            <Button type="button" onClick={onClose} variant="secondary" disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

EditStaffModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  studentData: PropTypes.object
}

export default EditStaffModal
