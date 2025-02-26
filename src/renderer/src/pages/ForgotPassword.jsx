import { useEffect, useState } from 'react'
import { MdEmail } from 'react-icons/md'
import { useNavigate } from 'react-router-dom'
import InputField from '../components/InputField'
import Button from '../components/Button'
import background from '../assets/background.jpg'
import logo from '../assets/logo.png'
import './ForgotPassword.css'
import { Bounce, toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useDispatch, useSelector } from 'react-redux'
import { resetPassword, reset } from '../Features/authSlice'

function ForgotPassword() {
  const [email, setEmail] = useState('')

  const navigate = useNavigate()
  const dispatch = useDispatch()

  const { isLoading, isError, isSuccess, message } = useSelector((state) => state.auth)

  const handleFinish = (e) => {
    e.preventDefault() // Add this to prevent form default submission

    if (!email) {
      toast.warning('Please enter your email address', toastConfig)
      return
    }

    const userData = { email }
    dispatch(resetPassword(userData))
  }

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

  const successToastConfig = {
    ...toastConfig,
    position: 'top-right'
  }

  useEffect(() => {
    if (isError) {
      toast.error('Failed to send reset link. Please try again.', toastConfig)
    }
    if (isSuccess) {
      toast.success(
        'A password reset link has been sent to your email. Please check your inbox!',
        successToastConfig
      )
      setEmail('')
      setTimeout(() => navigate('/'), 2000)
    }

    return () => {
      dispatch(reset())
    }
  }, [isError, isSuccess, message, navigate, dispatch])

  const handleBackToLogin = () => {
    navigate('/')
  }

  return (
    <>
      <ToastContainer
        position="top-right"
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
          <h2>Forgot Password</h2>
          <div className="input-field-wrapper">
            <div className="reset-notice">
              <p>
                Enter your email address and we'll send you instructions to reset your password.
              </p>
            </div>

            <form onSubmit={handleFinish} className="forgot-password-form">
              <div className="input-group">
                <InputField
                  type="email"
                  placeholder="Email"
                  icon={MdEmail}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  name="email"
                  required
                />
              </div>

              <div className="submit-button">
                <Button type="submit" disabled={isLoading || !email}>
                  {isLoading ? (
                    <div className="spinner-wrapper">
                      <div className="spinner" />
                      <span isLoading={isLoading}>Sending...</span>
                    </div>
                  ) : (
                    'Send Reset Link'
                  )}
                </Button>
              </div>
            </form>

            <div className="or-divider">
              <div></div>
              <span>OR</span>
              <div></div>
            </div>

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

export default ForgotPassword
