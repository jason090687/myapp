import { useState } from 'react'
import { MdEmail } from 'react-icons/md'
import { useNavigate } from 'react-router-dom'
import InputField from '../components/InputField'
import Button from '../components/Button'
import background from '../assets/background.jpg'
import logo from '../assets/logo.png'
import './ForgotPassword.css'

function ForgotPassword() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async () => {
    try {
      setIsLoading(true)
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))
      console.log('Reset password for:', email)
      // Handle password reset logic here
    } finally {
      setIsLoading(false)
    }
  }

  const handleBackToLogin = () => {
    navigate('/')
  }

  const handleEmailChange = (e) => {
    setEmail(e.target.value)
  }

  return (
    <div className="container">
      <div className="left-side">
        <div className="input-field-wrapper">
          <div className="reset-notice">
            <h3>Forgot your password?</h3>
            <p>
              Enter your email address and we&apos;ll send you instructions to reset your password.
            </p>
          </div>

          <InputField
            type="email"
            placeholder="Email"
            icon={MdEmail}
            value={email}
            onChange={handleEmailChange}
          />

          <Button onClick={handleSubmit} disabled={!email} isLoading={isLoading}>
            Send Reset Link
          </Button>

          <p className="back-to-login">
            Remember your password? <a onClick={handleBackToLogin}>Back to Login</a>
          </p>
        </div>
      </div>

      <div className="right-side">
        <img src={background} alt="School" />
        <img src={logo} alt="School Logo" className="logo" width={40} />
      </div>
    </div>
  )
}

export default ForgotPassword
