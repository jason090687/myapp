import React from 'react'
import './progress.css'

const Progress = React.forwardRef(({ className, value = 0, ...props }, ref) => (
  <div ref={ref} className={`progress-root ${className || ''}`} {...props}>
    <div
      className="progress-indicator"
      style={{
        transform: `translateX(-${100 - (value || 0)}%)`
      }}
    />
  </div>
))

Progress.displayName = 'Progress'

export { Progress }
