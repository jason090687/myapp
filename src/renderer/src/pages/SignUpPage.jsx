import { useState, useEffect } from 'react'
import { MdEmail, MdPerson } from 'react-icons/md'
import { FaLock } from 'react-icons/fa'
import InputField from '../components/InputField'
import { useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import background from '../assets/background.jpg'
import logo from '../assets/logo.png'
import './SignUpPage.css'
import { useDispatch, useSelector } from 'react-redux'
import { register, reset } from '../Features/authSlice'

function SignUpPage() {
  const dispatch = useDispatch()
  const { isLoading, isError, isSuccess, message } = useSelector((state) => state.auth)

  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [passwordValidation, setPasswordValidation] = useState({
    length: false,
    uppercase: false,
    number: false,
    special: false,
    match: false
  })

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: ''
    })
    setPasswordValidation({
      length: false,
      uppercase: false,
      number: false,
      special: false,
      match: false
    })
  }

  useEffect(() => {
    if (isError) {
      // Handle error - you might want to show this in your UI
      console.error(message)
    }

    if (isSuccess) {
      resetForm()
      navigate('/')
    }

    dispatch(reset())
  }, [isError, isSuccess, message, navigate, dispatch])

  const validatePassword = (password) => {
    setPasswordValidation({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*]/.test(password),
      match: password === formData.confirmPassword
    })
  }

  const handleChange = (field) => (e) => {
    const value = e.target.value
    setFormData((prev) => ({ ...prev, [field]: value }))

    if (field === 'password') {
      validatePassword(value)
    } else if (field === 'confirmPassword') {
      setPasswordValidation((prev) => ({
        ...prev,
        match: value === formData.password
      }))
    }
  }

  const isFormValid = () => {
    return (
      Object.values(passwordValidation).every((value) => value) &&
      Object.values(formData).every((value) => value !== '')
    )
  }

  const handleSignIn = () => {
    navigate('/')
  }

  const handleRegister = async () => {
    const userData = {
      first_name: formData.firstName,
      last_name: formData.lastName,
      email: formData.email,
      password: formData.password,
      re_password: formData.confirmPassword
    }

    dispatch(register(userData))
  }

  return (
    <div className="container">
      <div className="left-side">
        <h2>Create Account</h2>
        <div className="input-field-wrapper">
          <InputField
            type="text"
            placeholder="First Name"
            icon={MdPerson}
            value={formData.firstName}
            onChange={handleChange('firstName')}
          />
          <InputField
            type="text"
            placeholder="Last Name"
            icon={MdPerson}
            value={formData.lastName}
            onChange={handleChange('lastName')}
          />
          <InputField
            type="email"
            placeholder="Email"
            icon={MdEmail}
            value={formData.email}
            onChange={handleChange('email')}
          />
          <InputField
            type="password"
            placeholder="Password"
            icon={FaLock}
            value={formData.password}
            onChange={handleChange('password')}
          />
          <div className="password-requirements">
            <p className={passwordValidation.length ? 'valid' : 'invalid'}>
              ✓ At least 8 characters
            </p>
            <p className={passwordValidation.uppercase ? 'valid' : 'invalid'}>
              ✓ At least one uppercase letter
            </p>
            <p className={passwordValidation.number ? 'valid' : 'invalid'}>✓ At least one number</p>
            <p className={passwordValidation.special ? 'valid' : 'invalid'}>
              ✓ At least one special character
            </p>
          </div>
          <InputField
            type="password"
            placeholder="Confirm Password"
            icon={FaLock}
            value={formData.confirmPassword}
            onChange={handleChange('confirmPassword')}
          />
          {formData.confirmPassword && (
            <p className={`password-match ${passwordValidation.match ? 'valid' : 'invalid'}`}>
              {passwordValidation.match ? '✓ Passwords match' : '✗ Passwords do not match'}
            </p>
          )}

          <Button onClick={handleRegister} disabled={!isFormValid()} isLoading={isLoading}>
            Sign Up
          </Button>

          <div className="or-divider">
            <div></div>
            <span>OR</span>
            <div></div>
          </div>

          <p className="sign-up">
            Already have an account? <a onClick={handleSignIn}>Sign in</a>
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

export default SignUpPage
