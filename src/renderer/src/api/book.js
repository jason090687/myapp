import api, { multipartConfig } from './axios'

export const fetchAllBooks = async (search = '') => {
  try {
    let allBooks = []
    let nextPage = 1
    let hasMore = true

    while (hasMore) {
      const response = await api.get(
        `/marc/search/?page=${nextPage}&search=${encodeURIComponent(search)}`
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

export const addNewBook = async (bookData) => {
  try {
    const response = await api.post(`/marc/record/`, bookData, multipartConfig)
    return response.data
  } catch (error) {
    console.error('API Error:', error.response?.data || error.message)
    throw error
  }
}

export const updateBook = async (bookId, bookData) => {
  try {
    const response = await api.patch(`/marc/record/${bookId}/`, bookData, multipartConfig)
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update book')
  }
}

export const deleteBook = async (bookId, cancelData = {}) => {
  try {
    await api.patch(
      `/marc/record/${bookId}/`,
      {
        cancelled: true,
        cancelled_by: cancelData.cancelledBy,
        cancelled_at: cancelData.cancelledAt
      },
      multipartConfig
    )
    return true
  } catch (error) {
    const errorDetail =
      error.response?.data?.detail || error.response?.data?.message || error.message
    throw new Error(errorDetail || 'Failed to delete book')
  }
}

export const fetchBookDetails = async (bookId) => {
  try {
    const response = await api.get(`/marc/record/${bookId}/`)
    return response.data
  } catch (error) {
    console.error('Error fetching book details:', error)
    throw new Error(error.response?.data?.message || 'Failed to fetch book details')
  }
}
