import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import Button from '../components/Button'
import background from '../assets/background.jpg'
import logo from '../assets/logo.png'
import './AccountActivation.css'
import { Bounce, toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useDispatch, useSelector } from 'react-redux'
import { activate, reset } from '../Features/authSlice'

function AccountActivation() {
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

  const [code, setCode] = useState(['', '', '', ''])
  const [errorMessage, setErrorMessage] = useState('')
  const navigate = useNavigate()
  const { uid, token } = useParams()
  const location = useLocation()
  const dispatch = useDispatch()

  const queryParams = new URLSearchParams(location.search)
  const activateCode = queryParams.get('code')

  const { isLoading, isError, isSuccess, message } = useSelector((state) => state.auth)

  useEffect(() => {
    if (!activateCode) {
      setErrorMessage('Invalid activation code. Please try again.')
      return
    }
    dispatch(activate({ activation_code: activateCode }))
  }, [activateCode, dispatch])

  useEffect(() => {
    if (isError) {
      setErrorMessage('Activation failed. Please try again.')
      toast.error('Activation failed. Please try again.', toastConfig)
    }
    if (isSuccess) {
      toast.success('Account activated successfully!', toastConfig)
      navigate('/')
    }

    dispatch(reset())
  }, [isError, isSuccess, message, navigate, dispatch, toastConfig])

  const handleCodeChange = (value, index) => {
    // Only allow numbers
    if (!/^\d*$/.test(value)) return

    const newCode = [...code]
    newCode[index] = value

    setCode(newCode)

    // Auto-focus next input
    if (value && index < 3) {
      const nextInput = document.querySelector(`input[name="code-${index + 1}"]`)
      if (nextInput) nextInput.focus()
    }
  }

  const handleKeyDown = (e, index) => {
    // Handle backspace
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      const prevInput = document.querySelector(`input[name="code-${index - 1}"]`)
      if (prevInput) {
        prevInput.focus()
        const newCode = [...code]
        newCode[index - 1] = ''
        setCode(newCode)
      }
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const activationCode = code.join('')

    if (activationCode.length !== 4) {
      toast.warning('Please enter the complete activation code', toastConfig)
      return
    }

    const userData = {
      activation_code: activationCode
    }
    dispatch(activate(userData))
  }

  return (
    <>
      <ToastContainer {...toastConfig} />
      <div className="container">
        <div className="left-side">
          <h2>Account Activation</h2>
          <div className="input-field-wrapper">
            <div className="activation-status">
              <div className="status-message">
                <p>Enter the 4-digit activation code sent to your email</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="activation-form">
              <div className="code-inputs">
                {[0, 1, 2, 3].map((index) => (
                  <input
                    key={index}
                    type="text"
                    maxLength="1"
                    name={`code-${index}`}
                    value={code[index]}
                    onChange={(e) => handleCodeChange(e.target.value, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    autoFocus={index === 0}
                  />
                ))}
              </div>

              <div className="button-group">
                <div className="submit-button">
                  <Button type="submit" disabled={isLoading || code.some((digit) => !digit)}>
                    {isLoading ? (
                      <div className="spinner-wrapper">
                        <div className="spinner" />
                        <span>Activating...</span>
                      </div>
                    ) : (
                      'Activate Account'
                    )}
                  </Button>
                </div>
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

export default AccountActivation
