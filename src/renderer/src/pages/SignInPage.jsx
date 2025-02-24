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

function SignInPage() {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  const { email, password } = formData

  const { user, isLoading, isError, isSuccess, message } = useSelector((state) => state.auth)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prevState) => ({
      ...prevState,
      [name]: value // Make sure name matches the state fields (email, password)
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault() // This will now work properly with the form

    if (!email || !password) {
      alert('Please provide both your email and password to continue.')
      return
    }

    dispatch(login({ email, password }))
  }

  useEffect(() => {
    if (isError) {
      alert(message || 'Unable to log in. Please verify your credentials and try again.')
    }

    if (isSuccess && user) {
      navigate('/dashboard')
    }

    return () => dispatch(reset())
  }, [isError, isSuccess, user, message, navigate, dispatch])

  const handleSignUp = () => {
    navigate('/signup')
  }

  const handleForgotPassword = () => {
    navigate('/forgot-password')
  }

  return (
    <>
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

              <a
                onClick={handleForgotPassword}
                className="forgot-password"
                style={{ cursor: 'pointer' }}
              >
                Forgot password?
              </a>

              <div className="login-button">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <div className="spinner-wrapper">
                      <div className="spinner" />
                      <span>Signing in...</span>
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
