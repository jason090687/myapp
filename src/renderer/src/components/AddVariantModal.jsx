import { useState } from 'react'
import PropTypes from 'prop-types'
import InputField from './InputField'
import { FaBookmark, FaVolumeUp, FaBarcode, FaHashtag, FaQrcode, FaTrash } from 'react-icons/fa'
import './AddVariantModal.css'

const AddVariantModal = ({ isOpen, onClose, totalCopiesLimit, variants, onVariantsChange }) => {
  const [localVariants, setLocalVariants] = useState(variants)

  const handleVariantChange = (index, field, value) => {
    setLocalVariants((prev) =>
      prev.map((variant, i) => (i === index ? { ...variant, [field]: value } : variant))
    )
  }

  const addVariant = () => {
    if (localVariants.length < totalCopiesLimit) {
      setLocalVariants((prev) => [
        ...prev,
        {
          edition: '',
          volume: '',
          isbn: '',
          accession_number: '',
          call_number: '',
          barcode: ''
        }
      ])
    }
  }

  const removeVariant = (index) => {
    setLocalVariants((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSave = () => {
    onVariantsChange(localVariants)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Manage Book Variants</h2>
          <button onClick={onClose} className="close-btn">
            &times;
          </button>
        </div>
        <div className="add-book-form">
          <div className="variant-header">
            <p>Total variants required: {totalCopiesLimit}</p>
            <button
              type="button"
              onClick={addVariant}
              className="add-variant-btn"
              disabled={localVariants.length >= totalCopiesLimit}
            >
              <FaBookmark /> Add Variant
            </button>
          </div>

          {localVariants.map((variant, index) => (
            <div key={index} className="variant-item">
              <div className="variant-item-header">
                <h4 className="variant-title">Variant #{index + 1}</h4>
                <button
                  type="button"
                  onClick={() => removeVariant(index)}
                  className="remove-variant-btn"
                >
                  <FaTrash /> Remove
                </button>
              </div>

              <div className="variant-grid">
                <div className="variant-field">
                  <label>Edition</label>
                  <InputField
                    value={variant.edition}
                    onChange={(e) => handleVariantChange(index, 'edition', e.target.value)}
                    icon={FaBookmark}
                  />
                </div>

                <div className="variant-field">
                  <label>Volume</label>
                  <InputField
                    value={variant.volume}
                    onChange={(e) => handleVariantChange(index, 'volume', e.target.value)}
                    icon={FaVolumeUp}
                  />
                </div>

                <div className="variant-field">
                  <label>ISBN*</label>
                  <InputField
                    value={variant.isbn}
                    onChange={(e) => handleVariantChange(index, 'isbn', e.target.value)}
                    icon={FaBarcode}
                    required
                  />
                </div>

                <div className="variant-field">
                  <label>Accession Number</label>
                  <InputField
                    value={variant.accession_number}
                    onChange={(e) => handleVariantChange(index, 'accession_number', e.target.value)}
                    icon={FaHashtag}
                  />
                </div>

                <div className="variant-field">
                  <label>Call Number</label>
                  <InputField
                    value={variant.call_number}
                    onChange={(e) => handleVariantChange(index, 'call_number', e.target.value)}
                    icon={FaHashtag}
                  />
                </div>

                <div className="variant-field">
                  <label>Barcode</label>
                  <InputField
                    value={variant.barcode}
                    onChange={(e) => handleVariantChange(index, 'barcode', e.target.value)}
                    icon={FaQrcode}
                  />
                </div>
              </div>
            </div>
          ))}

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="cancel-btn">
              Cancel
            </button>
            <button type="button" onClick={handleSave} className="submit-btn">
              Save Variants
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

AddVariantModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  totalCopiesLimit: PropTypes.number.isRequired,
  variants: PropTypes.array.isRequired,
  onVariantsChange: PropTypes.func.isRequired
}

export default AddVariantModal
