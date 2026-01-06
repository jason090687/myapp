import { useState } from 'react'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import PropTypes from 'prop-types'
import './InputField.css'

const InputField = ({
  type = 'text',
  placeholder = '',
  icon: Icon,
  value = '',
  onChange = () => {},
  name = '',
  className = '',
  ...rest
}) => {
  const [showPassword, setShowPassword] = useState(false)

  const normalizedValue = value === null || value === undefined ? '' : String(value)

  const handleChange = (e) => {
    onChange({ target: { name, value: e.target.value } })
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  return (
    <div className="input-container">
      <div className="input-icon">
        <Icon size={20} />
      </div>
      <input
        type={type === 'password' ? (showPassword ? 'text' : 'password') : type}
        placeholder={placeholder}
        value={normalizedValue}
        onChange={handleChange}
        name={name}
        className={`input-field ${className}`.trim()}
        {...rest}
      />
      {type === 'password' && (
        <button type="button" onClick={togglePasswordVisibility} className="password-toggle">
          {showPassword ? <FaEye size={20} /> : <FaEyeSlash size={20} />}
        </button>
      )}
    </div>
  )
}

InputField.propTypes = {
  type: PropTypes.string,
  placeholder: PropTypes.string,
  icon: PropTypes.elementType.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  name: PropTypes.string,
  className: PropTypes.string
}

export default InputField
