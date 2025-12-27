import axios from 'axios'

// const API_URL = 'http://192.168.0.145:8000/api/v1'
// const API_URL = 'http://countmein.pythonanywhere.com/api/v1'
const API_URL = 'http://192.168.2.175:8000/api/v1'

// const apiConfig = {
//   baseURL: API_URL,
//   headers: {
//     'Content-Type': 'application/json'
//   },
//   withCredentials: false // Change this to false
// }

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
      formData,
      getAuthHeaders(token, 'multipart/form-data')
    )
    return response.data // Axios automatically parses JSON responses
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Failed to update profile')
  }
}

export const fetchBooks = async (token, page = 1, search = '') => {
  try {
    const response = await axios.get(
      `${API_URL}/marc/search/?page=${page}&page_size=10&search=${encodeURIComponent(search)}`,
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
      bookData, // Use bookData directly as FormData
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data' // Ensure multipart content type for file upload
        }
      }
    )
    return response.data
  } catch (error) {
    console.error('API Error:', error.response?.data || error.message)
    throw error
  }
}

export const uploadNewBook = async (token, bookData) => {
  try {
    const response = await axios.post(
      `${API_URL}/marc/record/`,
      bookData, // Use bookData directly as FormData
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
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

export const fetchBorrowedBooks = async (token, page = 1, searchTerm = '') => {
  try {
    const response = await axios.get(
      `${API_URL}/borrow/list/?page=${page}&search=${searchTerm}&ordering=return_status,-returned_date`,
      getAuthHeaders(token)
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

export const fetchStudentsList = async (token, page = 1) => {
  try {
    const response = await axios.get(`${API_URL}/students/?page=${page}`, getAuthHeaders(token))
    return response.data
  } catch (error) {
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
        returned_date: paymentData.is_returned ? new Date().toISOString().split('T')[0] : null,
        or_number: paymentData.or_number // Add this line to include OR number
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

export const fetchOverdueBorrowedBooks = async (token, borrowedId) => {
  try {
    const response = await axios.get(`${API_URL}/borrow/fines/${borrowedId}`, getAuthHeaders(token))
    return response.data
  } catch (error) {
    console.error('Error fetching overdue borrowed books:', error)
    throw new Error(error.response?.data?.message || 'Failed to fetch overdue borrowed books')
  }
}

export const fetchTopBooks = async (token) => {
  try {
    const response = await axios.get(`${API_URL}/borrow/top-books/`, getAuthHeaders(token))
    // Return the data directly since it's already in the correct format
    return response.data.book_borrowing_frequencies || []
  } catch (error) {
    console.error('Top books fetch error:', error)
    return []
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

export const fetchTotalBooksCount = async (token) => {
  try {
    const response = await axios.get(`${API_URL}/marc/search/`, getAuthHeaders(token))
    return response.data.count
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch total books count')
  }
}

export const fetchDashboardStats = async (token) => {
  try {
    const [booksRes, borrowedRes, returnedRes, overdueRes] = await Promise.all([
      axios.get(`${API_URL}/marc/search/`, getAuthHeaders(token)),
      axios.get(`${API_URL}/borrow/list/`, getAuthHeaders(token)),
      axios.get(`${API_URL}/borrow/list/?is_returned=true`, getAuthHeaders(token)),
      axios.get(`${API_URL}/borrow/list/?is_overdue=true`, getAuthHeaders(token))
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

export const fetchAllStudentsWithBorrowCount = async (token) => {
  try {
    const firstResponse = await axios.get(`${API_URL}/students/`, getAuthHeaders(token))
    const totalPages = Math.ceil(firstResponse.data.count / 10)

    const pagePromises = Array.from({ length: totalPages }, (_, i) =>
      axios.get(`${API_URL}/students/?page=${i + 1}`, getAuthHeaders(token))
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

export const fetchRecentCheckouts = async (token, limit = 5) => {
  try {
    const response = await axios.get(`${API_URL}/borrow/list/`, getAuthHeaders(token))
    return response.data.results.slice(0, limit)
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch recent checkouts')
  }
}

export const fetchBorrowedBooksStats = async (token) => {
  try {
    const response = await axios.get(
      `${API_URL}/borrow/list/?page_size=1000`,
      getAuthHeaders(token)
    )
    const books = response.data.results
    console.log(books)

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

export const fetchTotalPenalties = async (token) => {
  try {
    const response = await axios.get(`${API_URL}/borrow/fines/`, getAuthHeaders(token))

    // Validate the response data to ensure it's reasonable
    const totalPenalties = response.data.total_penalties
    const overdueCount = response.data.overdue_count

    // Check if the values are numbers and within reasonable bounds
    const isValidTotalPenalties =
      typeof totalPenalties === 'number' && totalPenalties >= 0 && totalPenalties < 1000000
    const isValidOverdueCount =
      typeof overdueCount === 'number' && overdueCount >= 0 && overdueCount < 10000

    return {
      totalPenalties: isValidTotalPenalties ? totalPenalties : 0,
      overdueCount: isValidOverdueCount ? overdueCount : 0,
      overdueBooks: Array.isArray(response.data.overdue_books) ? response.data.overdue_books : []
    }
  } catch (error) {
    console.error('Error fetching total penalties:', error)
    return {
      totalPenalties: 0,
      overdueCount: 0,
      overdueBooks: []
    }
  }
}

export const fetchReturnedBooksCount = async (token) => {
  try {
    const response = await axios.get(`${API_URL}/borrow/returned-books/`, getAuthHeaders(token))
    return {
      returnedCount: response.data.returned_books_count || 0
    }
  } catch (error) {
    console.error('Error fetching returned books count:', error)
    return {
      returnedCount: 0
    }
  }
}

export const fetchAllBorrowedRecords = async (token) => {
  try {
    let allRecords = []
    let nextPage = `${API_URL}/borrow/list/`

    while (nextPage) {
      const response = await axios.get(nextPage, {
        headers: { Authorization: `Bearer ${token}` }
      })

      allRecords = [...allRecords, ...response.data.results]
      nextPage = response.data.next
    }

    const today = new Date()

    // Process the records
    const processedData = {
      borrowed: allRecords.filter((record) => !record.is_returned),
      returned: allRecords.filter((record) => record.is_returned),
      total: allRecords.length,
      amount: allRecords
        .filter((record) => record.paid === true)
        .reduce((sum, record) => {
          return sum + (record.amount ? parseFloat(record.amount) : 0)
        }, 0),
      overdue: allRecords.filter(
        (record) => !record.is_returned && record.due_date && today > new Date(record.due_date)
      )
    }
    console.log(processedData)

    return processedData
  } catch (error) {
    console.error('Error fetching all borrowed records:', error)
    throw error
  }
}

// export const fetchAllBorrowRecords = async (token) => {
//   try {
//     let allRecords = []
//     let nextPage = `${API_URL}/borrow/list/`

//     while (nextPage) {
//       const response = await axios.get(nextPage, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         }
//       })

//       allRecords = [...allRecords, ...response.data.results]
//       nextPage = response.data.next
//     }

//     // Process the records into categories
//     const processedRecords = {
//       borrowed: allRecords.filter((record) => !record.is_returned),
//       returned: allRecords.filter((record) => record.is_returned),
//       overdue: allRecords.filter((record) => record.status === 'Overdue'),
//       all: allRecords,
//       totalCount: allRecords.length,
//       totalAmount: allRecords.reduce((sum, record) => {
//         return sum + (record.amount ? parseFloat(record.amount) : 0)
//       }, 0)
//     }

//     return processedRecords
//   } catch (error) {
//     console.error('Error fetching all borrow records:', error)
//     throw new Error(error.response?.data?.message || 'Failed to fetch borrow records')
//   }
// }

// Function to fetch a single page of borrow records
export const fetchBorrowPage = async (token, page = 1, pageSize = 1000) => {
  try {
    const response = await axios.get(`${API_URL}/borrow/list/`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      params: {
        page,
        page_size: pageSize
      }
    })

    return {
      results: response.data.results,
      count: response.data.count,
      next: response.data.next,
      previous: response.data.previous
    }
  } catch (error) {
    console.error('Error fetching borrow page:', error)
    throw new Error(error.response?.data?.message || 'Failed to fetch borrow page')
  }
}

export const verifyOtp = async (verifyData) => {
  try {
    const response = await axios.post(`${API_URL}/accounts/verify-otp/`, verifyData, {
      headers: { 'Content-Type': 'application/json' }
    })
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'OTP verification failed')
  }
}

export const resendOtp = async (email) => {
  try {
    const response = await axios.post(
      `${API_URL}/accounts/resend-otp/`,
      { email },
      {
        headers: { 'Content-Type': 'application/json' }
      }
    )
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Failed to resend OTP')
  }
}

export const verifyOtpDirectly = async (verifyData) => {
  try {
    const response = await axios.post(`${API_URL}/accounts/verify-otp/`, verifyData, {
      headers: { 'Content-Type': 'application/json' }
    })
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.message || 'OTP verification failed')
  }
}

export const resendOtpDirectly = async (email) => {
  try {
    const response = await axios.post(
      `${API_URL}/accounts/resend-otp/`,
      { email },
      {
        headers: { 'Content-Type': 'application/json' }
      }
    )
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to resend OTP')
  }
}

export const requestPasswordResetOtp = async (email) => {
  try {
    const response = await axios.post(
      `${API_URL}/accounts/request-password-reset/`,
      { email },
      {
        headers: { 'Content-Type': 'application/json' }
      }
    )
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Failed to request password reset')
  }
}

export const resetPasswordWithOtp = async (email, otp, newPassword) => {
  try {
    const response = await axios.post(
      `${API_URL}/accounts/reset-password/`,
      {
        email,
        otp,
        new_password: newPassword
      },
      {
        headers: { 'Content-Type': 'application/json' }
      }
    )
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Failed to reset password')
  }
}

export const fetchBookDetails = async (token, bookId) => {
  try {
    const response = await axios.get(`${API_URL}/marc/record/${bookId}/`, getAuthHeaders(token))
    return response.data
  } catch (error) {
    console.error('Error fetching book details:', error)
    throw new Error(error.response?.data?.message || 'Failed to fetch book details')
  }
}

export const fetchAllUsers = async (token) => {
  try {
    const response = await axios.get(`${API_URL}/accounts/auth/users/`, getAuthHeaders(token))
    return {
      total: response.data.count,
      users: response.data.results
    }
  } catch (error) {
    console.error('Error fetching users:', error)
    return {
      total: 0,
      users: []
    }
  }
}

export const fetchActiveUsers = async (token) => {
  try {
    const response = await axios.get(`${API_URL}/accounts/auth/users/`, getAuthHeaders(token))
    return {
      total: response.data.count,
      users: response.data.results
    }
  } catch (error) {
    console.error('Error fetching active users:', error)
    return {
      total: 0,
      users: []
    }
  }
}

export const fetchMonthlyStats = async (token, month, year) => {
  try {
    const response = await axios.get(
      `${API_URL}/dashboard/monthly-stats/?month=${month}&year=${year}`,
      getAuthHeaders(token)
    )
    return {
      totalBooks: response.data.total_books || 0,
      borrowed: response.data.borrowed || 0,
      returned: response.data.returned || 0,
      overdue: response.data.overdue || 0,
      month: month,
      year: year
    }
  } catch (error) {
    console.error('Error fetching monthly stats:', error)
    throw new Error('Failed to fetch monthly statistics')
  }
}

export const fetchMonthlyReport = async (token) => {
  try {
    const response = await axios.get(`${API_URL}/marc/monthly-report/`, getAuthHeaders(token))
    return response.data
  } catch (error) {
    console.error('Error fetching monthly report:', error)
    return []
  }
}

export const fetchStudentDetails = async (token, studentId) => {
  try {
    const response = await axios.get(`${API_URL}/students/${studentId}/`, getAuthHeaders(token))
    return response.data
  } catch (error) {
    console.error('API Error:', error.response?.data || error.message)
    throw new Error(error.response?.data?.message || 'Failed to fetch student details')
  }
}

export const updateStudentDetails = async (token, studentId, updateData) => {
  try {
    const response = await axios.patch(
      `${API_URL}/students/${studentId}/`,
      updateData,
      getAuthHeaders(token)
    )
    return response.data
  } catch (error) {
    console.error('API Error:', error.response?.data || error.message)
    throw new Error(error.response?.data?.message || 'Failed to update student details')
  }
}

export const createStudent = async (token, studentData) => {
  try {
    const response = await axios.post(`${API_URL}/students/`, studentData, getAuthHeaders(token))
    return response.data
  } catch (error) {
    console.error('Error creating student:', error.response?.data || error.message)
    throw new Error(error.response?.data?.message || 'Failed to create student')
  }
}

export const fetchStudentYearLevels = async (token) => {
  try {
    const response = await axios.get(`${API_URL}/students/`, getAuthHeaders(token))
    return response.data.year_level || []
  } catch (error) {
    console.error('Error fetching year levels:', error)
    throw new Error(error.response?.data?.message || 'Failed to fetch year levels')
  }
}

// First, update or add this function to your API file
export const searchStudents = async (token, searchTerm, page = 1) => {
  try {
    const response = await axios.get(
      `${API_URL}/students/?search=${encodeURIComponent(searchTerm)}&page=${page}`,
      getAuthHeaders(token)
    )
    return response.data
  } catch (error) {
    console.error('Search students error:', error)
    throw new Error(error.response?.data?.message || 'Failed to search students')
  }
}

export const fetchAllStudentsForSearch = async (token) => {
  try {
    let allStudents = []
    let page = 1
    let hasMore = true

    while (hasMore) {
      const response = await axios.get(`${API_URL}/students/?page=${page}`, getAuthHeaders(token))
      allStudents = [...allStudents, ...response.data.results]
      hasMore = response.data.next !== null
      page++
    }

    return allStudents
  } catch (error) {
    console.error('Error fetching all students:', error)
    throw new Error(error.response?.data?.message || 'Failed to fetch all students')
  }
}

// Employee APIs
export const fetchEmployees = async (token) => {
  try {
    const response = await axios.get(`${API_URL}/students/employees/`, getAuthHeaders(token))
    return response.data
  } catch (error) {
    console.error('Error fetching employees:', error)
    throw new Error(error.response?.data?.message || 'Failed to fetch employees')
  }
}

export const fetchStaffDetails = async (token, staffId) => {
  try {
    const response = await axios.get(`${API_URL}/students/${staffId}/`, getAuthHeaders(token))
    return response.data
  } catch (error) {
    console.error('API Error:', error.response?.data || error.message)
    throw new Error(error.response?.data?.message || 'Failed to fetch student details')
  }
}

export const createEmployee = async (token, employeeData) => {
  try {
    const response = await axios.post(`${API_URL}/employees/`, employeeData, getAuthHeaders(token))
    return response.data
  } catch (error) {
    console.error('Error creating employee:', error.response?.data || error.message)
    throw new Error(error.response?.data?.message || 'Failed to create employee')
  }
}

export const fetchNewArrivals = async (token) => {
  try {
    const response = await axios.get(`${API_URL}/marc/new-arrivals/`, getAuthHeaders(token))
    return response.data.results || [] // Return the results array directly
  } catch (error) {
    console.error('Error fetching new arrivals:', error)
    return []
  }
}

export const fetchMonthlyStudentStats = async (token) => {
  try {
    const response = await axios.get(`${API_URL}/students/stats/monthly/`, getAuthHeaders(token))
    return response.data
  } catch (error) {
    console.error('Error fetching monthly student stats:', error)
    return []
  }
}
