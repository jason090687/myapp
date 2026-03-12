import api, { multipartConfig } from './axios'

export const loginUser = async (userData) => {
  try {
    const response = await api.post(`/accounts/auth/jwt/create/`, userData)
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Login failed.')
  }
}

export const registerUser = async (userData) => {
  try {
    const response = await api.post(`/accounts/auth/users/`, userData)
    return response.data
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        'An error occurred during registration. Please try again later.'
    )
  }
}

export const activateUser = async (userData) => {
  try {
    const response = await api.post(`/accounts/auth/users/activation/`, userData)
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Activation failed.')
  }
}

export const resetPassword = async (userData) => {
  try {
    const response = await api.post(`/accounts/auth/users/reset_password/`, userData)
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Reset password failed.')
  }
}

export const resetPasswordConfirm = async (userData) => {
  try {
    const response = await api.post(`/accounts/auth/users/reset_password_confirm/`, userData)
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Reset password confirmation failed.')
  }
}

export const changePassword = async (passwordData) => {
  try {
    const response = await api.post(`/accounts/auth/users/set_password/`, passwordData)
    return response.data
  } catch (error) {
    const data = error.response?.data
    throw new Error(
      data?.detail ||
        data?.current_password?.[0] ||
        data?.new_password?.[0] ||
        data?.re_new_password?.[0] ||
        data?.old_password?.[0] ||
        'Failed to change password'
    )
  }
}

export const verifyOtp = async (verifyData) => {
  try {
    const response = await api.post(`/accounts/verify-otp/`, verifyData)
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'OTP verification failed')
  }
}

export const resendOtp = async (email) => {
  try {
    const response = await api.post(`/accounts/resend-otp/`, { email })
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Failed to resend OTP')
  }
}

export const verifyOtpDirectly = async (verifyData) => {
  try {
    const response = await api.post(`/accounts/verify-otp/`, verifyData)
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.message || 'OTP verification failed')
  }
}

export const resendOtpDirectly = async (email) => {
  try {
    const response = await api.post(`/accounts/resend-otp/`, { email })
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to resend OTP')
  }
}

export const requestPasswordResetOtp = async (email) => {
  try {
    const response = await api.post(`/accounts/request-password-reset/`, { email })
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Failed to request password reset')
  }
}

export const resetPasswordWithOtp = async (email, otp, newPassword) => {
  try {
    const response = await api.post(`/accounts/reset-password/`, {
      email,
      otp,
      new_password: newPassword
    })
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Failed to reset password')
  }
}

export const fetchUserDetails = async () => {
  try {
    const response = await api.get(`/accounts/auth/users/me/`)
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Fetch user details failed.')
  }
}

export const createUser = async (payload) => {
  try {
    const response = await api.post(`/accounts/auth/users/`, payload)
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Failed to create user')
  }
}

export const updateUserProfile = async (formData) => {
  try {
    const response = await api.patch(`/accounts/auth/users/me/`, formData, multipartConfig)
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Failed to update profile')
  }
}
