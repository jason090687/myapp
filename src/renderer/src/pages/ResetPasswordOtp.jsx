import React, { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Bounce, toast, ToastContainer } from 'react-toastify'
import background from '../assets/background.jpg'
import logo from '../assets/logo.png'
import './OtpVerification.css'
import './ResetPasswordOtp.css'
import { Button } from '../components/ui/button'

const ResetPasswordOtp = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const inputRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()]
  const navigate = useNavigate()
  const location = useLocation()
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [emailDisplay, setEmailDisplay] = useState('')

  const userEmail = location.state?.email

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

  const successToastConfig = {
    ...toastConfig,
    autoClose: 2000,
    icon: '✅'
  }

  useEffect(() => {
    if (!userEmail) {
      navigate('/forgot-password')
      return
    }
    const maskedEmail = userEmail.replace(/(.{3})(.*)(@.*)/, '$1***$3')
    setEmailDisplay(maskedEmail)
  }, [userEmail, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (isSubmitting) return

    const otpString = otp.join('')
    if (!/^\d{6}$/.test(otpString)) {
      toast.error('Please enter a valid 6-digit code', toastConfig)
      return
    }

    setIsSubmitting(true)

    try {
      toast.success('OTP verification successful!', successToastConfig)

      // Add delay before navigation
      await new Promise((resolve) => setTimeout(resolve, 1500))

      navigate('/create-new-password', {
        state: {
          email: userEmail,
          otp: otpString
        }
      })
    } catch (err) {
      setError('Invalid OTP code. Please try again.')
      toast.error(err.message || 'Invalid OTP code. Please try again.', toastConfig)
      setOtp(['', '', '', '', '', ''])
      inputRefs[0].current.focus()
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return
    if (value.length > 1) return

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    if (value && index < 5) {
      inputRefs[index + 1].current.focus()
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs[index - 1].current.focus()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    if (isSubmitting) return

    const pastedData = e.clipboardData.getData('text').trim()

    if (!/^\d{6}$/.test(pastedData)) {
      toast.error('Please paste a valid 6-digit code')
      return
    }

    const digits = pastedData.split('')
    setOtp(digits)
    inputRefs[5].current.focus()
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
          <h2>E-Library</h2>
          <div className="input-field-wrapper">
            <form onSubmit={handleSubmit} className="login-form">
              <h3 className="otp-heading">OTP Verification</h3>
              <p className="otp-description">Please enter the 6-digit code sent to</p>
              <p className="otp-email">{emailDisplay}</p>

              <div className="otp-input-group">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={inputRefs[index]}
                    type="text"
                    inputMode="numeric"
                    pattern="\d*"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    disabled={isSubmitting}
                    className={`otp-input ${error ? 'error' : ''}`}
                    autoFocus={index === 0}
                  />
                ))}
              </div>

              {error && <p className="error-text">{error}</p>}

              <div className="button-wrapper">
                <Button
                  type="submit"
                  disabled={isSubmitting || otp.join('').length !== 6}
                  className="submit-button"
                >
                  {isSubmitting ? (
                    <div className="spinner-wrapper">
                      <div className="spinner" />
                      <span>Verifying...</span>
                    </div>
                  ) : (
                    'Verify OTP'
                  )}
                </Button>
              </div>
            </form>
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

export default ResetPasswordOtp
