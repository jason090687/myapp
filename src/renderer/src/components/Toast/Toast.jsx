import { useState, useEffect, createContext } from 'react'
import { FaCheck, FaExclamationTriangle, FaInfoCircle, FaTimes } from 'react-icons/fa'
import './Toast.css'

export const ToastContext = createContext(null)

const toastVariants = {
  success: {
    icon: FaCheck,
    className: 'toast-success',
    bgColor: '#ecfdf5'
  },
  error: {
    icon: FaExclamationTriangle,
    className: 'toast-error',
    bgColor: '#fef2f2'
  },
  info: {
    icon: FaInfoCircle,
    className: 'toast-info',
    bgColor: '#eff6ff'
  }
}

function Toast({ id, title, description, variant = 'success', duration = 4000, onClose }) {
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true)
      setTimeout(() => onClose(id), 300)
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, id, onClose])

  const variantConfig = toastVariants[variant] || toastVariants.success
  const Icon = variantConfig.icon

  return (
    <div className={`toast ${variantConfig.className} ${isExiting ? 'toast-exit' : 'toast-enter'}`}>
      <div className="toast-content">
        <div className="toast-icon-wrapper">
          <Icon className="toast-icon" />
        </div>
        <div className="toast-message">
          {title && <div className="toast-title">{title}</div>}
          {description && <div className="toast-description">{description}</div>}
        </div>
      </div>
      <button
        className="toast-close"
        onClick={() => {
          setIsExiting(true)
          setTimeout(() => onClose(id), 300)
        }}
        aria-label="Close toast"
      >
        <FaTimes />
      </button>
    </div>
  )
}

export default Toast
