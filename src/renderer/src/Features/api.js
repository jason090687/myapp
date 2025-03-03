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
    const response = await axios.post(
      `${API_URL}/marc/record/`,
      {
        ...bookData,
        barcode: bookData.barcode, // Now includes copy number
        copy_number: bookData.copy_number // New field
      },
      getAuthHeaders(token)
    )
    return response.data
  } catch (error) {
    console.error('API Error:', error.response?.data || error.message)
    throw error
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

export const processOverduePayment = async (token, borrowId, paymentData) => {
  try {
    const response = await axios.patch(
      `${API_URL}/borrow/fines/${borrowId}/`,
      {
        ...paymentData,
        paid: true,
        paid_at: paymentData.paid_at,
        is_returned: paymentData.is_returned || false,
        returned_date: paymentData.is_returned ? new Date().toISOString().split('T')[0] : null
      },
      getAuthHeaders(token)
    )

    return response.data
  } catch (error) {
    console.error('Payment processing error:', error)
    throw new Error(
      error.response?.data?.message || error.response?.data?.detail || 'Failed to process payment'
    )
  }
}

export const fetchTopBooks = async (token) => {
  try {
    const response = await axios.get(`${API_URL}/borrow/most-borrowed/`, getAuthHeaders(token))
    // Return empty results if no data
    return {
      results: response.data?.results || [],
      count: response.data?.count || 0
    }
  } catch (error) {
    console.error('Top books fetch error:', error)
    // Return empty results instead of throwing error
    return {
      results: [],
      count: 0
    }
  }
}

export const fetchNewBooks = async (token) => {
  try {
    const response = await axios.get(
      `${API_URL}/marc/search/?ordering=-date_added`,
      getAuthHeaders(token)
    )
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch new books')
  }
}

export const fetchTotalBooksCount = async () => {
  try {
    const response = await axios.get(`${API_URL}/marc/search/`)
    return response.data.count
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch total books count')
  }
}

export const fetchDashboardStats = async () => {
  try {
    const [booksRes, borrowedRes, returnedRes, overdueRes] = await Promise.all([
      axios.get(`${API_URL}/marc/search/`),
      axios.get(`${API_URL}/borrow/list/`),
      axios.get(`${API_URL}/borrow/list/?is_returned=true`),
      axios.get(`${API_URL}/borrow/list/?is_overdue=true`)
    ])

    return {
      totalBooks: booksRes.data.count,
      borrowed: borrowedRes.data.count,
      returned: returnedRes.data.count,
      overdue: overdueRes.data.count
    }
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch dashboard stats')
  }
}

export const fetchAllStudentsWithBorrowCount = async () => {
  try {
    const firstResponse = await axios.get(`${API_URL}/students/`)
    const totalPages = Math.ceil(firstResponse.data.count / 10)

    const pagePromises = Array.from({ length: totalPages }, (_, i) =>
      axios.get(`${API_URL}/students/?page=${i + 1}`)
    )

    const pages = await Promise.all(pagePromises)
    const allStudents = pages.flatMap((response) => response.data.results)

    return allStudents
      .filter((student) => student.borrowed_books_count >= 1)
      .sort((a, b) => b.borrowed_books_count - a.borrowed_books_count)
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch students')
  }
}

export const fetchRecentCheckouts = async (limit = 5) => {
  try {
    const response = await axios.get(`${API_URL}/borrow/list/`)
    return response.data.results.slice(0, limit)
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch recent checkouts')
  }
}

export const fetchBorrowedBooksStats = async () => {
  try {
    const response = await axios.get(`${API_URL}/borrow/list/?page_size=1000`)
    const books = response.data.results

    // Count books by status
    const stats = books.reduce(
      (acc, book) => {
        const status = book.status.toLowerCase()
        acc[status] = (acc[status] || 0) + 1
        return acc
      },
      {
        borrowed: 0,
        returned: 0,
        overdue: 0,
        pending: 0
      }
    )

    // Calculate total pending fees
    const totalFees = books
      .filter((book) => book.status.toLowerCase() === 'overdue')
      .reduce((total, book) => total + (book.amount || 0), 0)

    return {
      ...stats,
      pendingFees: totalFees
    }
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch borrowed books stats')
  }
}

export const fetchMarcBooks = async (token) => {
  try {
    const response = await axios.get(
      `${API_URL}/marc/search/?ordering=-date_processed`,
      getAuthHeaders(token)
    )

    // Calculate date from 5 days ago
    const fiveDaysAgo = new Date()
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5)

    // Filter and process the results
    const recentBooks = response.data.results
      .filter((book) => {
        if (!book.date_processed) return false
        const processedDate = new Date(book.date_processed)
        return processedDate >= fiveDaysAgo
      })
      .sort((a, b) => new Date(b.date_processed) - new Date(a.date_processed))
      .slice(0, 5) // Limit to 5 books
      .map((book) => ({
        id: book.id,
        title: book.title,
        date_processed: book.date_processed,
        author: book.author || 'Unknown Author',
        daysAgo: Math.floor((new Date() - new Date(book.date_processed)) / (1000 * 60 * 60 * 24))
      }))

    return { ...response.data, results: recentBooks }
  } catch (error) {
    console.error('Error fetching recent books:', error)
    return { results: [] }
  }
}

export const fetchBookStatuses = async (token) => {
  try {
    const response = await axios.get(`${API_URL}/borrow/status/`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    return Object.entries(response.data).map(([value, label]) => ({
      value,
      label
    }))
  } catch (error) {
    console.error('Error fetching book statuses:', error)
    throw error
  }
}
