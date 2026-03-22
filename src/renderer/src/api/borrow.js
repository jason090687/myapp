import api from './axios'

export const fetchBorrowedBooks = async (page = 1, searchTerm = '') => {
  try {
    const response = await api.get(
      `/borrow/list/?page=${page}&search=${searchTerm}&ordering=return_status,-returned_date`
    )
    return response.data
  } catch (error) {
    console.error('Error fetching borrowed books:', error.response?.data || error.message)
    throw new Error(error.response?.data?.message || 'Failed to fetch borrowed books')
  }
}

export const returnBook = async (bookId, returnData) => {
  try {
    const response = await api.patch(`/borrow/return/${bookId}/`, {
      is_returned: true,
      returned_date: returnData.returned_date || new Date().toISOString().split('T')[0],
      status: returnData.status || 'returned'
    })
    return response.data
  } catch (error) {
    console.error('Error returning book:', error)
    throw new Error(error.response?.data?.message || 'Failed to return book')
  }
}

export const renewBook = async (borrowId, renewData) => {
  try {
    const response = await api.patch(`/borrow/renew/${borrowId}/`, {
      due_date: renewData.due_date,
      renewed_count: renewData.renewed_count
    })
    return response.data
  } catch (error) {
    console.error('Error renewing book:', error)
    throw new Error(error.response?.data?.message || 'Failed to renew book')
  }
}

export const processOverduePayment = async (borrowId, paymentData) => {
  try {
    const response = await api.patch(`/borrow/fines/${borrowId}/`, {
      ...paymentData,
      paid: true,
      paid_at: paymentData.paid_at,
      is_returned: paymentData.is_returned || false,
      returned_date: paymentData.is_returned ? new Date().toISOString().split('T')[0] : null,
      or_number: paymentData.or_number // Add this line to include OR number
    })

    return response.data
  } catch (error) {
    console.error('Payment processing error:', error)
    throw new Error(
      error.response?.data?.message || error.response?.data?.detail || 'Failed to process payment'
    )
  }
}

export const borrowBook = async (borrowData) => {
  try {
    const response = await api.post(`/borrow/`, borrowData)
    return response.data
  } catch (error) {
    console.error('Error borrowing book:', error)
    throw new Error(error.response?.data?.message || 'Failed to borrow book')
  }
}

// Fetch pending borrow requests
export const fetchBorrowRequests = async (status = 'pending') => {
  try {
    const response = await api.get(`/borrow/requests/?status=${status}&is_read=true`)
    return response.data
  } catch (error) {
    console.error('Error fetching borrow requests:', error)
    throw new Error(error.response?.data?.message || 'Failed to fetch borrow requests')
  }
}
