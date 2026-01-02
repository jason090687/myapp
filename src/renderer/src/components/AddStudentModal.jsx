import { useState } from 'react'
import PropTypes from 'prop-types'
import { X, User, Hash, GraduationCap } from 'lucide-react'
import { Button } from './ui/button'
import { useActivity } from '../context/ActivityContext'
import './AddStudentModal.css'

const AddStudentModal = ({ isOpen, onClose, onSubmit }) => {
  const { addActivity } = useActivity()
  const [formData, setFormData] = useState({
    name: '',
    id_number: '',
    year_level: '',
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
        type: 'student_added',
        description: `Added student "${formData.name}" (ID: ${formData.id_number})`
      })

      onClose()
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="add-student-modal-overlay">
      <div className="add-student-modal-content">
        <div className="add-student-modal-header">
          <h2>Add New Student</h2>
          <button onClick={onClose} className="add-student-modal-close" aria-label="Close modal">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="add-student-modal-body">
            <div className="add-student-field-group">
              <label htmlFor="name">Full Name</label>
              <div className="add-student-input-wrapper">
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

            <div className="add-student-field-group">
              <label htmlFor="id_number">ID Number</label>
              <div className="add-student-input-wrapper">
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

            <div className="add-student-field-group">
              <label htmlFor="year_level">Year Level</label>
              <div className="add-student-input-wrapper">
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
          </div>

          <div className="add-student-modal-footer">
            <Button type="button" onClick={onClose} variant="secondary" disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? 'Adding...' : 'Add Student'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

AddStudentModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired
}

export default AddStudentModal
