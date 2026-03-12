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

export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
  } else {
    delete api.defaults.headers.common['Authorization']
  }
}

export const multipartConfig = {
  headers: {
    'Content-Type': 'multipart/form-data'
  }
}

export default api
