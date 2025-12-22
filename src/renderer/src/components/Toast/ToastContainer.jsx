import { useState, useCallback } from 'react'
import Toast from './Toast'
import './Toast.css'

function ToastContainer() {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((title, description, variant = 'success', duration = 4000) => {
    const id = Date.now()
    setToasts((prev) => [...prev, { id, title, description, variant, duration }])
    return id
  }, [])

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  return (
    <>
      <div className="toast-container">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            id={toast.id}
            title={toast.title}
            description={toast.description}
            variant={toast.variant}
            duration={toast.duration}
            onClose={removeToast}
          />
        ))}
      </div>
      {/* Expose toast methods globally */}
      {typeof window !== 'undefined' &&
        (() => {
          window.showToast = addToast
          return null
        })()}
    </>
  )
}

export default ToastContainer
