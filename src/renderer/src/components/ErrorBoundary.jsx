import React from 'react'
import { useRouteError } from 'react-router-dom'
import '../styles/ErrorPage.css'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <ErrorContent error={this.state.error} />
    }

    return this.props.children
  }
}

function ErrorContent({ error }) {
  return (
    <div className="error-page">
      <div className="error-content">
        <h1>Oops! Something went wrong</h1>
        <p>We apologize for the inconvenience. Please try again.</p>
        <div className="error-details">
          <pre>{error?.message || 'Unknown error occurred'}</pre>
        </div>
        <button onClick={() => window.location.reload()}>Refresh Page</button>
      </div>
    </div>
  )
}

export default ErrorBoundary
