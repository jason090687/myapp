import axios from 'axios'

const API_URL = 'http://countmein.pythonanywhere.com/api/v1'

const apiConfig = {
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: false // Change this to false
}

const getAuthHeaders = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`
  }
})

// User APIs
export const fetchUsers = async (token) => {
  const response = await axios.get(`${API_URL}/accounts/auth/users/`, getAuthHeaders(token))
  return response.data
}

// Auth APIs
export const registerUser = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/accounts/auth/users/`, userData, {
      headers: {
        'Content-Type': 'application/json'
      }
    })
    return response.data
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        'An error occurred during registration. Please try again later.'
    )
  }
}

export const loginUser = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/accounts/auth/jwt/create/`, userData, {
      headers: {
        'Content-Type': 'application/json'
      }
    })
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Login failed.')
  }
}

export const activateUser = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/accounts/auth/users/activation/`, userData, {
      headers: {
        'Content-Type': 'application/json'
      }
    })
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Activation failed.')
  }
}

export const resetPassword = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/accounts/auth/users/reset_password/`, userData, {
      headers: {
        'Content-Type': 'application/json'
      }
    })
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Reset password failed.')
  }
}

export const resetPasswordConfirm = async (userData) => {
  try {
    const response = await axios.post(
      `${API_URL}/accounts/auth/users/reset_password_confirm/`,
      userData,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Reset password confirmation failed.')
  }
}

export const fetchUserDetails = async (token) => {
  try {
    const response = await axios.get(`${API_URL}/accounts/auth/users/me/`, getAuthHeaders(token))
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Fetch user details failed.')
  }
}

// POST: Create a new user
export const createUser = async (token, payload) => {
  try {
    const response = await axios.post(
      `${API_URL}/accounts/auth/users/`,
      payload,
      getAuthHeaders(token) // Use default JSON content type
    )
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Failed to create user')
  }
}

// PATCH: Update user profile
export const updateUserProfile = async (token, formData) => {
  try {
    const response = await axios.patch(
      `${API_URL}/accounts/auth/users/me/`,
      formData, // FormData handles both file and text fields
      getAuthHeaders(token, 'multipart/form-data') // Include multipart content type for files
    )
    return response.data // Axios automatically parses JSON responses
  } catch (error) {
    // Standardize error handling
    throw new Error(error.response?.data?.detail || 'Failed to update profile')
  }
}

export const fetchBooks = async (token, page = 1) => {
  try {
    const response = await axios.get(`${API_URL}/marc/search/?page=${page}`, getAuthHeaders(token))
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch books')
  }
}
