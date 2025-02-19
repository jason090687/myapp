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

export const fetchBooks = async (token, page = 1, search = '') => {
  try {
    const response = await axios.get(
      `${API_URL}/marc/search/?page=${page}&search=${encodeURIComponent(search)}`,
      getAuthHeaders(token)
    )
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch books')
  }
}

// Add new function to fetch all books across pages
export const fetchAllBooks = async (token, search = '') => {
  try {
    let allBooks = []
    let nextPage = 1
    let hasMore = true

    while (hasMore) {
      const response = await axios.get(
        `${API_URL}/marc/search/?page=${nextPage}&search=${encodeURIComponent(search)}`,
        getAuthHeaders(token)
      )

      allBooks = [...allBooks, ...response.data.results]

      hasMore = response.data.next !== null
      nextPage += 1
    }

    return { results: allBooks }
  } catch (error) {
    console.error('Error fetching all books:', error)
    throw new Error(error.response?.data?.message || 'Failed to fetch all books')
  }
}

export const addNewBook = async (token, bookData) => {
  try {
    const response = await axios.post(`${API_URL}/marc/record/`, bookData, getAuthHeaders(token))
    return response.data
  } catch (error) {
    console.error('API Error:', error.response?.data || error.message)
    throw new Error(error.response?.data?.message || 'Failed to add new book')
  }
}

export const updateBook = async (token, bookId, bookData) => {
  try {
    const response = await axios.patch(
      `${API_URL}/marc/record/${bookId}/`,
      bookData,
      getAuthHeaders(token)
    )
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update book')
  }
}

export const deleteBook = async (token, bookId) => {
  try {
    await axios.delete(`${API_URL}/marc/record/${bookId}/`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    return true // Return success flag since delete usually doesn't return data
  } catch (error) {
    console.error('Delete error:', error.response?.data || error.message)
    throw new Error(error.response?.data?.detail || 'Failed to delete book')
  }
}

export const fetchStatus = async (token) => {
  try {
    const response = await axios.get(`${API_URL}/marc/status/`, getAuthHeaders(token))
    // The API returns status list as an array of strings
    return response.data
  } catch (error) {
    console.error('Error fetching status:', error)
    return ['Available', 'Borrowed', 'Lost'] // Fallback default values
  }
}

export const fetchBorrowedBooks = async (token, page = 1) => {
  if (!token) {
    console.error('Error: Missing authentication token')
    throw new Error('Unauthorized: No token provided')
  }

  try {
    const response = await axios.get(
      `${API_URL}/borrow/list/?page=${page}`,
      getAuthHeaders(token) // Ensure headers are passed correctly
    )
    return response.data
  } catch (error) {
    console.error('Error fetching borrowed books:', error.response?.data || error.message)
    throw new Error(error.response?.data?.message || 'Failed to fetch borrowed books')
  }
}

export const fetchStudents = async (token) => {
  try {
    const response = await axios.get(`${API_URL}/students/`, getAuthHeaders(token))
    return response.data
  } catch (error) {
    console.error('Error fetching students:', error)
    throw new Error(error.response?.data?.message || 'Failed to fetch students')
  }
}

// Add this new function for borrowing books
export const borrowBook = async (token, borrowData) => {
  try {
    const response = await axios.post(`${API_URL}/borrow/`, borrowData, getAuthHeaders(token))
    return response.data
  } catch (error) {
    console.error('Error borrowing book:', error)
    throw new Error(error.response?.data?.message || 'Failed to borrow book')
  }
}

// Update the return book function to use the simple endpoint
export const returnBook = async (token, bookId, returnData) => {
  try {
    const response = await axios.patch(
      `${API_URL}/borrow/return/${bookId}/`,
      {
        ...returnData,
        is_returned: true, // Add this line to ensure is_returned is set to true
        returned_date: returnData.returned_date
      },
      getAuthHeaders(token)
    )
    return response.data
  } catch (error) {
    console.error('Error returning book:', error)
    throw new Error(error.response?.data?.message || 'Failed to return book')
  }
}

export const renewBook = async (token, borrowId, renewData) => {
  try {
    const response = await axios.patch(
      `${API_URL}/borrow/renew/${borrowId}/`,
      {
        due_date: renewData.due_date,
        renewed_count: renewData.renewed_count
      },
      getAuthHeaders(token)
    )
    return response.data
  } catch (error) {
    console.error('Error renewing book:', error)
    throw new Error(error.response?.data?.message || 'Failed to renew book')
  }
}
