import {
  activateUser,
  fetchUserDetails,
  loginUser,
  resetPassword,
  resetPasswordConfirm,
  verifyOtp as verifyOtpApi,
  resendOtp as resendOtpApi,
  registerUser
} from '../api/auth'

// Helper to handle API errors
const handleError = (error) => {
  throw new Error(error.response?.data?.message || 'An error occurred. Please try again.')
}

// Register
const register = async (userData) => {
  try {
    return await registerUser(userData)
  } catch (error) {
    handleError(error)
  }
}

// Login
const login = async (userData) => {
  try {
    const response = await loginUser(userData)

    if (response) {
      const { access: token } = response
      const user = { email: userData.email }

      localStorage.setItem('authToken', token)
      localStorage.setItem('user', JSON.stringify(user))

      return { token, user }
    }
  } catch (error) {
    handleError(error)
  }
}

// Logout (no hook here)
const logout = async () => {
  try {
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
  } catch (error) {
    handleError(error)
  }
}

// Activate
const activate = async (userData) => {
  try {
    return await activateUser(userData)
  } catch (error) {
    handleError(error)
  }
}

// Request Reset
const requestResetPassword = async (userData) => {
  try {
    return await resetPassword(userData)
  } catch (error) {
    handleError(error)
  }
}

// Confirm Reset
const confirmResetPassword = async (userData) => {
  try {
    return await resetPasswordConfirm(userData)
  } catch (error) {
    handleError(error)
  }
}

// User Details
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
    return await verifyOtpApi(otpData)
  } catch (error) {
    handleError(error)
  }
}

// Resend OTP
const resendOtp = async (email) => {
  try {
    return await resendOtpApi(email)
  } catch (error) {
    handleError(error)
  }
}

export default {
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