import { useState } from 'react'
import PropTypes from 'prop-types'
import { X, User, Hash } from 'lucide-react'
import { Button } from './ui/button'
import { useActivity } from '../context/ActivityContext'
import './AddStaffBookModal.css'

const AddStaffBookModal = ({ isOpen, onClose, onSubmit }) => {
  const { addActivity } = useActivity()
  const [formData, setFormData] = useState({
    name: '',
    id_number: '',
    rfid_number: '',
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

  if (!isOpen) return null

  return (
    <div className="add-staff-modal-overlay">
      <div className="add-staff-modal-content">
        <div className="add-staff-modal-header">
          <h2>Add New Staff</h2>
          <button onClick={onClose} className="add-staff-modal-close" aria-label="Close modal">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="add-staff-modal-body">
            <div className="add-staff-field-group">
              <label htmlFor="name">Full Name</label>
              <div className="add-staff-input-wrapper">
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

            <div className="add-staff-field-group">
              <label htmlFor="id_number">Employee ID</label>
              <div className="add-staff-input-wrapper">
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

            <div className="add-staff-field-group">
              <label htmlFor="rfid_number">RFID Number</label>
              <div className="add-staff-input-wrapper">
                <Hash size={18} />
                <input
                  type="text"
                  id="rfid_number"
                  name="rfid_number"
                  value={formData.rfid_number}
                  onChange={handleChange}
                  required
                  placeholder="Enter RFID number"
                />
              </div>
            </div>
          </div>

          <div className="add-staff-modal-footer">
            <Button type="button" onClick={onClose} variant="secondary" disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? 'Adding...' : 'Add Staff'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

AddStaffBookModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired
}

export default AddStaffBookModal
