import { useState, useEffect } from 'react'
import { FaLock } from 'react-icons/fa'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import InputField from '../components/InputField'
import Button from '../components/Button'
import background from '../assets/background.jpg'
import logo from '../assets/logo.png'
import './CreateNewPassword.css'
import { Bounce, toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { resetPasswordWithOtp } from '../Features/api'

function CreateNewPassword() {
  const navigate = useNavigate()
  const { token } = useParams()
  const location = useLocation()
  const userEmail = location.state?.email
  const userOtp = location.state?.otp
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  })
  const [passwordMatch, setPasswordMatch] = useState({
    isValid: false,
    message: ''
  })

  const { password, confirmPassword } = formData

  const toastConfig = {
    position: 'top-center',
    autoClose: 3000,
    hideProgressBar: true,
    closeOnClick: true,
    pauseOnHover: false,
    draggable: false,
    theme: 'light',
    transition: Bounce
  }

  useEffect(() => {
    if (!userEmail || !userOtp) {
      navigate('/forgot-password')
    }
  }, [userEmail, userOtp, navigate])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prevState) => ({
      ...prevState,
      [name]: value
    }))

    // Check password match when either password field changes
    if (name === 'password' || name === 'confirmPassword') {
      const otherValue = name === 'password' ? formData.confirmPassword : formData.password
      setPasswordMatch({
        isValid: value === otherValue && value !== '',
        message: value === otherValue || value === '' ? '' : 'Passwords do not match'
      })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!password || !confirmPassword) {
      toast.warning('Please fill in all fields', toastConfig)
      return
    }

    if (password !== confirmPassword) {
      toast.warning('Passwords do not match', toastConfig)
      return
    }

    if (password.length < 8) {
      toast.warning('Password must be at least 8 characters', toastConfig)
      return
    }

    setIsLoading(true)

    try {
      await resetPasswordWithOtp(userEmail, userOtp, password)
      toast.success('Password reset successful!', {
        ...toastConfig,
        position: 'top-right',
        icon: '✅'
      })
      setTimeout(() => navigate('/'), 1500)
    } catch (error) {
      toast.error(error.message || 'Failed to reset password. Please try again.', toastConfig)
    } finally {
      setIsLoading(false)
    }
  }

  const handleBackToLogin = () => {
    navigate('/')
  }

  return (
    <>
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss={false}
        draggable={false}
        pauseOnHover={false}
        theme="light"
      />
      <div className="container">
        <div className="left-side">
          <h2>Create New Password</h2>
          <div className="input-field-wrapper">
            <form onSubmit={handleSubmit} className="password-reset-form">
              <div className="input-group">
                <InputField
                  type="password"
                  placeholder="New Password"
                  icon={FaLock}
                  value={password}
                  onChange={handleChange}
                  name="password"
                  required
                />
                <InputField
                  type="password"
                  placeholder="Confirm Password"
                  icon={FaLock}
                  value={confirmPassword}
                  onChange={handleChange}
                  name="confirmPassword"
                  required
                  className={confirmPassword && !passwordMatch.isValid ? 'error' : ''}
                />
                {confirmPassword && (
                  <p
                    className={`password-match-message ${passwordMatch.isValid ? 'valid' : 'invalid'}`}
                  >
                    {passwordMatch.isValid ? '✓ Passwords match' : '✗ Passwords do not match'}
                  </p>
                )}
              </div>

              <div className="reset-button">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <div className="spinner-wrapper">
                      <div className="spinner" />
                      <span>Resetting...</span>
                    </div>
                  ) : (
                    'Reset Password'
                  )}
                </Button>
              </div>
            </form>

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
    </>
  )
}

export default CreateNewPassword
