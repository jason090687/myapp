import 'react'
import { MdEmail } from 'react-icons/md'
import { FaLock } from 'react-icons/fa'
import InputField from '../components/InputField'
import { useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import background from '../assets/background.jpg'
import logo from '../assets/logo.png'
import './SignInPage.css'
import { useDispatch, useSelector } from 'react-redux'
import { useEffect, useState } from 'react'
import { login, reset } from '../Features/authSlice'
import { Bounce, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { ToastContainer } from 'react-toastify'

function SignInPage() {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  })
  const { email, password, rememberMe } = formData

  const { user, isLoading, isError, isSuccess, message } = useSelector((state) => state.auth)

  const toastConfig = {
    position: 'top-right',
    autoClose: 3000,
    hideProgressBar: true,
    closeOnClick: true,
    pauseOnHover: false,
    draggable: false,
    theme: 'light',
    transition: Bounce
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prevState) => ({
      ...prevState,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault() // This will now work properly with the form

    if (!email || !password) {
      toast.warning('Please provide both email and password', toastConfig)
      return
    }

    dispatch(login({ email, password }))

    if (rememberMe) {
      localStorage.setItem('rememberedEmail', email)
    } else {
      localStorage.removeItem('rememberedEmail')
    }
  }

  useEffect(() => {
    if (isError) {
      toast.warning(message || 'Unable to log in. Please verify your credentials.', toastConfig)
    }

    if (isSuccess && user) {
      toast.success('Successfully logged in!', toastConfig)
      navigate('/dashboard')
    }

    return () => dispatch(reset())
  }, [isError, isSuccess, user, message, navigate, dispatch])

  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail')
    if (savedEmail) {
      setFormData((prev) => ({
        ...prev,
        email: savedEmail,
        rememberMe: true
      }))
    }
  }, [])

  const handleSignUp = () => {
    navigate('/signup')
  }

  const handleForgotPassword = () => {
    navigate('/forgot-password')
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
        {/* Left Side - Login Form */}
        <div className="left-side">
          <h2>E-Library</h2>
          <div className="input-field-wrapper">
            <form onSubmit={handleSubmit} className="login-form">
              <div className="input-group">
                <InputField
                  type="email"
                  placeholder="Email"
                  icon={MdEmail}
                  value={email} // ensure this is correct
                  onChange={handleChange} // ensure this function is updating the correct state
                  name="email"
                  required
                />
                <InputField
                  type="password"
                  placeholder="Password"
                  icon={FaLock}
                  value={password} // ensure this is correct
                  onChange={handleChange} // ensure this function is updating the correct state
                  name="password"
                  required
                />
              </div>

              <div className="form-bottom">
                <div className="remember-me">
                  <input
                    type="checkbox"
                    id="rememberMe"
                    name="rememberMe"
                    checked={rememberMe}
                    onChange={handleChange}
                  />
                  <label htmlFor="rememberMe">Remember me</label>
                </div>

                <a
                  onClick={handleForgotPassword}
                  className="forgot-password"
                  style={{ cursor: 'pointer' }}
                >
                  Forgot password?
                </a>
              </div>

              <div className="login-button">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <div className="spinner-wrapper">
                      <div className="spinner" />
                    </div>
                  ) : (
                    'Log In'
                  )}
                </Button>
              </div>
            </form>

            <div className="or-divider">
              <div></div>
              <span>OR</span>
              <div></div>
            </div>

            <p className="sign-up">
              Don&apos;t have an account? <a onClick={handleSignUp}>Sign up</a>
            </p>
          </div>
        </div>

        {/* Right Side - Image Section */}
        <div className="right-side">
          <img src={background} alt="School" />
          <img src={logo} alt="School Logo" className="logo" width={40} />
        </div>
      </div>
    </>
  )
}

export default SignInPage
