import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bounce, toast, ToastContainer } from 'react-toastify'
import { verifyOtpDirectly, resendOtpDirectly } from '../Features/api'
import 'react-toastify/dist/ReactToastify.css'
import Button from '../components/Button'
import background from '../assets/background.jpg'
import logo from '../assets/logo.png'
import './OtpVerification.css'

const OtpVerification = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const inputRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()]
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [emailDisplay, setEmailDisplay] = useState('')

  // Get registration email
  const registrationEmail = localStorage.getItem('registrationEmail')

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

  useEffect(() => {
    if (!registrationEmail) {
      toast.error('Registration email not found. Please sign up again.', toastConfig)
      navigate('/signup')
      return
    }

    // Only set up the masked email display
    const maskedEmail = registrationEmail.replace(/(.{3})(.*)(@.*)/, '$1***$3')
    setEmailDisplay(maskedEmail)

    return () => {
      if (registrationEmail) {
        localStorage.removeItem('registrationEmail')
      }
    }
  }, []) // Run only once when component mounts

  const handleSubmit = async (e) => {
    if (e) e.preventDefault()
    if (isSubmitting) return // Prevent multiple submissions

    setError('')
    const otpString = otp.join('')

    if (!registrationEmail) {
      toast.error('Registration email not found. Please sign up again.', toastConfig)
      navigate('/signup')
      return
    }

    if (!/^\d{6}$/.test(otpString)) {
      toast.error('Please enter a valid 6-digit code', toastConfig)
      return
    }

    setIsSubmitting(true)

    try {
      await verifyOtpDirectly({
        email: registrationEmail,
        otp: otpString
      })
      toast.success('Account verified successfully', toastConfig)
      localStorage.removeItem('registrationEmail')
      navigate('/activation-success') // Navigate to success page instead of login
    } catch (err) {
      setError('Invalid OTP code. Please try again.')
      toast.error(err.message || 'Invalid OTP code. Please try again.', toastConfig)
      setOtp(['', '', '', '', '', ''])
      inputRefs[0].current.focus()
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResendOtp = async () => {
    if (!registrationEmail) {
      toast.error('Registration email not found. Please sign up again.', toastConfig)
      navigate('/signup')
      return
    }

    try {
      await resendOtpDirectly(registrationEmail)
      toast.success(`OTP has been resent to ${emailDisplay}`, toastConfig)
    } catch (error) {
      toast.error('Failed to resend OTP. Please try again.', toastConfig)
    }
  }

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return
    if (value.length > 1) return

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    // Only handle focus movement, remove auto-submit
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
    if (isSubmitting) return // Prevent paste while submitting

    const pastedData = e.clipboardData.getData('text').trim()

    // Improved validation for pasted data
    if (!/^\d{6}$/.test(pastedData)) {
      toast.error('Please paste a valid 6-digit code', toastConfig)
      return
    }

    const digits = pastedData.split('')
    setOtp(digits)
    inputRefs[5].current.focus()
    // Auto-submit removed
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
          <h2>eLibrary</h2>
          <div className="input-field-wrapper">
            <form onSubmit={handleSubmit} className="login-form">
              <h3 className="text-2xl font-bold text-center mb-4">OTP Verification</h3>
              <p className="text-center text-gray-600 mb-2">
                Please enter the 6-digit code sent to
              </p>
              <p className="text-center text-blue-600 font-medium mb-8">{emailDisplay}</p>

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

              {error && <p className="text-red-500 text-sm text-center mt-2">{error}</p>}

              <div className="login-button mb-6">
                <Button
                  type="submit"
                  disabled={isSubmitting || otp.join('').length !== 6}
                  className="w-full py-3.5 text-base font-medium"
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

              <div className="or-divider mb-6">
                <div></div>
                <span>OR</span>
                <div></div>
              </div>

              <div className="text-center">
                <button type="button" onClick={handleResendOtp} className="resend-button">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  Resend OTP
                </button>
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

export default OtpVerification
