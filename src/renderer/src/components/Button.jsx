import 'react'
import PropTypes from 'prop-types'
import './Button.css'

const Button = ({ children, disabled = false, type = 'button', onClick, isLoading = false }) => {
  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`button ${disabled ? 'button-disabled' : ''} ${isLoading ? 'button-loading' : ''}`}
    >
      {isLoading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <span>Loading...</span>
        </div>
      ) : (
        children
      )}
    </button>
  )
}

Button.propTypes = {
  children: PropTypes.node.isRequired,
  disabled: PropTypes.bool,
  type: PropTypes.string,
  onClick: PropTypes.func,
  isLoading: PropTypes.bool
}

export default Button
