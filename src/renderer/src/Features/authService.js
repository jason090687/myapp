import {
  registerUser,
  loginUser,
  activateUser,
  resetPassword,
  resetPasswordConfirm,
  fetchUserDetails
} from '../Features/api'

// Helper to handle API errors
const handleError = (error) => {
  throw new Error(error.response?.data?.message || 'An error occurred. Please try again.')
}

// Register User
const register = async (userData) => {
  try {
    return await registerUser(userData)
  } catch (error) {
    handleError(error)
  }
}

// Login User
const login = async (userData) => {
  try {
    const response = await loginUser(userData)
    if (response) {
      const { access: token } = response // Assuming JWT access token
      const user = { email: userData.email } // Add user email to localStorage

      // Save token and user to localStorage
      localStorage.setItem('authToken', token)
      localStorage.setItem('user', JSON.stringify(user))

      return { token, user } // Return token and user details
    }
  } catch (error) {
    handleError(error)
  }
}

// Logout User
const logout = () => {
  localStorage.removeItem('authToken')
  localStorage.removeItem('user')
}

// Activate User Account
const activate = async (userData) => {
  try {
    return await activateUser(userData)
  } catch (error) {
    handleError(error)
  }
}

// Request Password Reset
const requestResetPassword = async (userData) => {
  try {
    return await resetPassword(userData)
  } catch (error) {
    handleError(error)
  }
}

// Confirm Password Reset
const confirmResetPassword = async (userData) => {
  try {
    return await resetPasswordConfirm(userData)
  } catch (error) {
    handleError(error)
  }
}

// Fetch User Details
const userDetails = async (token) => {
  try {
    return await fetchUserDetails(token)
  } catch (error) {
    handleError(error)
  }
}

// Verify OTP
const verifyOtp = async (otpData) => {
  try {
    return await api.verifyOtp(otpData)
  } catch (error) {
    handleError(error)
  }
}

// Resend OTP
const resendOtp = async () => {
  try {
    return await api.resendOtp()
  } catch (error) {
    handleError(error)
  }
}

const authService = {
  register,
  login,
  logout,
  activate,
  requestResetPassword,
  confirmResetPassword,
  userDetails,
  verifyOtp,
  resendOtp
}

export default authService
