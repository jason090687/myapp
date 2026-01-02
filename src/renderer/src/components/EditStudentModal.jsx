import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { X, User, Hash, GraduationCap } from 'lucide-react'
import { Button } from './ui/button'
import './EditStudentModal.css'

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

  if (!isOpen) return null

  return (
    <div className="edit-student-modal-overlay">
      <div className="edit-student-modal-content">
        <div className="edit-student-modal-header">
          <h2>Edit Student Details</h2>
          <button onClick={onClose} className="edit-student-modal-close" aria-label="Close modal">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="edit-student-modal-body">
            <div className="edit-student-field-group">
              <label htmlFor="name">Full Name</label>
              <div className="edit-student-input-wrapper">
                <User size={18} />
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter student's full name"
                />
              </div>
            </div>

            <div className="edit-student-field-group">
              <label htmlFor="id_number">ID Number</label>
              <div className="edit-student-input-wrapper">
                <Hash size={18} />
                <input
                  type="text"
                  id="id_number"
                  name="id_number"
                  value={formData.id_number}
                  onChange={handleChange}
                  required
                  placeholder="Enter student ID number"
                />
              </div>
            </div>

            <div className="edit-student-field-group">
              <label htmlFor="year_level">Year Level</label>
              <div className="edit-student-input-wrapper">
                <GraduationCap size={18} />
                <input
                  type="text"
                  id="year_level"
                  name="year_level"
                  value={formData.year_level}
                  onChange={handleChange}
                  required
                  placeholder="e.g., 1st Year, 2nd Year"
                />
              </div>
            </div>

            <div className="edit-student-field-group">
              <label htmlFor="active">Active Status</label>
              <div className="edit-student-toggle-wrapper">
                <label className="edit-student-toggle">
                  <input
                    type="checkbox"
                    name="active"
                    checked={formData.active}
                    onChange={handleChange}
                  />
                  <span className="edit-student-slider"></span>
                </label>
                <span className="edit-student-toggle-label">
                  {formData.active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>

          <div className="edit-student-modal-footer">
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

EditStudentModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  student: PropTypes.object
}

export default EditStudentModal
