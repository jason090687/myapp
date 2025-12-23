import * as React from 'react'
import './button.css'

const Button = React.forwardRef(
  ({ className, variant = 'default', size = 'md', disabled = false, children, ...props }, ref) => {
    const variantClass = `btn-${variant}`
    const sizeClass = `btn-${size}`

    return (
      <button
        className={`btn ${variantClass} ${sizeClass} ${className || ''}`}
        disabled={disabled}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

export { Button }
