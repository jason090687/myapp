import api from './axios'

export const fetchStudents = async () => {
  try {
    const response = await api.get(`/students/`)
    return response.data.results || []
  } catch (error) {
    console.error('Error fetching students:', error)
    throw new Error(error.response?.data?.message || 'Failed to fetch students')
  }
}
