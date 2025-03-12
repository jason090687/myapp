// ...existing code...

export const API_ENDPOINTS = {
  // ...existing endpoints...
  BOOK_DETAILS: (id) => `${BASE_URL}/api/v1/marc/record/${id}/`
}

// ...existing code...

export const fetchBookDetails = async (token, id) => {
  try {
    const response = await fetch(API_ENDPOINTS.BOOK_DETAILS(id), {
      method: 'GET',
      headers: {
        Authorization: `Token ${token}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error('Failed to fetch book details')
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching book details:', error)
    throw error
  }
}
