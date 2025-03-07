import React from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import { FaCheckCircle } from 'react-icons/fa'
import background from '../assets/background.jpg'
import logo from '../assets/logo.png'
import './ActivationSuccess.css'

const ActivationSuccess = () => {
  const navigate = useNavigate()

  const handleGoToLogin = () => {
    navigate('/')
  }

  return (
    <div className="container">
      <div className="left-side">
        <h2>E-Library</h2>
        <div className="success-container">
          <FaCheckCircle className="success-icon" />
          <h3>Account Activated!</h3>
          <p>Your account has been successfully activated.</p>
          <p>You can now log in to access your account.</p>
          <div className="button-container">
            <Button onClick={handleGoToLogin}>Go to Login</Button>
          </div>
        </div>
      </div>
      <div className="right-side">
        <img src={background} alt="School" />
        <img src={logo} alt="School Logo" className="logo" width={40} />
      </div>
    </div>
  )
}

export default ActivationSuccess
