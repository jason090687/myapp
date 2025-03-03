import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL

export const fetchUserDetails = async (token) => {
  try {
    const response = await axios.get(`${API_URL}/api/users/me/`, {
      headers: { Authorization: `JWT ${token}` }
    })
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch user details')
  }
}

export const updateUserDetails = async (token, userData) => {
  try {
    const response = await axios.patch(`${API_URL}/api/users/me/`, userData, {
      headers: { Authorization: `JWT ${token}` }
    })
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update user details')
  }
}
