import { useState, useEffect } from 'react'
import { FaLock } from 'react-icons/fa'
import { useNavigate, useParams } from 'react-router-dom'
import InputField from '../components/InputField'
import Button from '../components/Button'
import background from '../assets/background.jpg'
import logo from '../assets/logo.png'
import './CreateNewPassword.css'
import { Bounce, toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

function CreateNewPassword() {
  const navigate = useNavigate()
  const { token } = useParams()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
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

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prevState) => ({
      ...prevState,
      [name]: value
    }))
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

    if (password.length < 6) {
      toast.warning('Password must be at least 6 characters', toastConfig)
      return
    }

    try {
      setIsLoading(true)
      // Add your password reset API call here
      await new Promise((resolve) => setTimeout(resolve, 2000)) // Simulate API call
      toast.success('Password successfully reset!', toastConfig)
      setTimeout(() => navigate('/'), 2000)
    } catch (error) {
      toast.error('Failed to reset password. Please try again.', toastConfig)
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
                />
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
