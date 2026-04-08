import axios from 'axios'

// const API_URL = 'http://192.168.0.145:8000/api/v1'
// const API_URL = 'http://countmein.pythonanywhere.com/api/v1'
const API_URL = 'http://192.168.2.175:8000/api/v1'
// const API_URL = 'http://127.0.0.1:8000/api/v1'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Get token from localStorage (for initial load before Redux hydrates)
export const getToken = () => {
  return localStorage.getItem('authToken') || ''
}

// Set auth token - accepts both string token and function to get token
export const setAuthToken = (tokenOrGetter) => {
  const token = typeof tokenOrGetter === 'function' ? tokenOrGetter() : tokenOrGetter
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
  } else {
    delete api.defaults.headers.common['Authorization']
  }
}

// Note: Token is now managed dynamically in TanStack Query hooks
// For legacy code, use setAuthToken(token) after Redux hydration
// The hooks get token dynamically via getToken() in each request

export const multipartConfig = {
  headers: {
    'Content-Type': 'multipart/form-data'
  }
}

export default api
