import { useState } from 'react'
import PropTypes from 'prop-types'
import InputField from './InputField'
import { FaBookmark, FaVolumeUp, FaBarcode, FaHashtag, FaQrcode, FaTrash } from 'react-icons/fa'
import './AddVariantModal.css'
import { Button } from './ui/button'
import { X } from 'lucide-react'

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
    <div className="variant-modal-overlay" onClick={onClose}>
      <div className="variant-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="variant-modal-header">
          <div className="variant-modal-title-section">
            <FaBookmark className="variant-header-icon" />
            <h2>Manage Book Variants</h2>
          </div>
          <Button variant="ghost" type="button" onClick={onClose} aria-label="Close modal">
            {/* &times; */}
            <X />
          </Button>
        </div>
        <div className="variant-modal-body">
          <div className="variant-info-section">
            <div className="variant-counter">
              <span className="variant-count">{localVariants.length}</span>
              <span className="variant-count-label">of {totalCopiesLimit}</span>
            </div>
            <Button
              variant="primary"
              type="button"
              onClick={addVariant}
              className="variant-add-btn"
              disabled={localVariants.length >= totalCopiesLimit}
            >
              <FaBookmark />
              <span>Add Variant</span>
            </Button>
          </div>

          {localVariants.map((variant, index) => (
            <div key={index} className="variant-card">
              <div className="variant-card-header">
                <div className="variant-badge">
                  <FaBookmark className="variant-badge-icon" />
                  <span>Variant #{index + 1}</span>
                </div>
                <Button
                  variant="secondary"
                  type="button"
                  onClick={() => removeVariant(index)}
                  aria-label={`Remove variant ${index + 1}`}
                >
                  <FaTrash />
                </Button>
              </div>

              <div className="variant-fields-grid">
                <div className="variant-input-group">
                  <label className="variant-label">Edition</label>
                  <InputField
                    value={variant.edition}
                    onChange={(e) => handleVariantChange(index, 'edition', e.target.value)}
                    icon={FaBookmark}
                    placeholder="e.g., 1st Edition"
                  />
                </div>

                <div className="variant-input-group">
                  <label className="variant-label">Volume</label>
                  <InputField
                    value={variant.volume}
                    onChange={(e) => handleVariantChange(index, 'volume', e.target.value)}
                    icon={FaVolumeUp}
                    placeholder="e.g., Vol. 1"
                  />
                </div>

                <div className="variant-input-group">
                  <label className="variant-label">
                    ISBN <span className="required-asterisk">*</span>
                  </label>
                  <InputField
                    value={variant.isbn}
                    onChange={(e) => handleVariantChange(index, 'isbn', e.target.value)}
                    icon={FaBarcode}
                    placeholder="Enter ISBN"
                    required
                  />
                </div>

                <div className="variant-input-group">
                  <label className="variant-label">Accession Number</label>
                  <InputField
                    value={variant.accession_number}
                    onChange={(e) => handleVariantChange(index, 'accession_number', e.target.value)}
                    icon={FaHashtag}
                    placeholder="Enter accession number"
                  />
                </div>

                <div className="variant-input-group">
                  <label className="variant-label">Call Number</label>
                  <InputField
                    value={variant.call_number}
                    onChange={(e) => handleVariantChange(index, 'call_number', e.target.value)}
                    icon={FaHashtag}
                    placeholder="Enter call number"
                  />
                </div>

                <div className="variant-input-group">
                  <label className="variant-label">Barcode</label>
                  <InputField
                    value={variant.barcode}
                    onChange={(e) => handleVariantChange(index, 'barcode', e.target.value)}
                    icon={FaQrcode}
                    placeholder="Enter barcode"
                  />
                </div>
              </div>
            </div>
          ))}

          <div className="variant-modal-footer">
            <Button variant="secondary" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" type="button" onClick={handleSave}>
              <FaBookmark />
              Save Variants
            </Button>
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
