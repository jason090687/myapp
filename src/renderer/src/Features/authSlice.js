import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import authService from './authService'

// const user = JSON.parse(localStorage.getItem("user"));

const initialState = {
  user: {
    first_name: '',
    last_name: '',
    email: '',
    id_number: ''
  },
  token: '',
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: ''
}

// Utility function to handle localStorage
const setLocalStorage = (user, token) => {
  localStorage.setItem('user', JSON.stringify(user))
  localStorage.setItem('authToken', token)
}

const clearLocalStorage = () => {
  localStorage.removeItem('user')
  localStorage.removeItem('authToken')
}

// Register user
export const register = createAsyncThunk('auth/register', async (userData, thunkAPI) => {
  try {
    const response = await authService.register(userData)
    return response // Assuming { user, token } in response
  } catch (error) {
    return thunkAPI.rejectWithValue('Your account is already existed!')
  }
})

// Login user
export const login = createAsyncThunk('auth/login', async (userData, thunkAPI) => {
  try {
    const response = await authService.login(userData)
    return response // Assuming { user, token } in response
  } catch (error) {
    return thunkAPI.rejectWithValue('Invalid email or password. Please try again.')
  }
})

// Logout user
export const logout = createAsyncThunk('auth/logout', async () => {
  authService.logout()
  clearLocalStorage()
})

// Activate user account
export const activate = createAsyncThunk('auth/activate', async (userData, thunkAPI) => {
  try {
    const response = await authService.activate(userData)
    return response
  } catch (error) {
    return thunkAPI.rejectWithValue('Failed to activate')
  }
})

// Reset password
export const resetPassword = createAsyncThunk('auth/resetPassword', async (userData, thunkAPI) => {
  try {
    const response = await authService.requestResetPassword(userData)
    return response
  } catch (error) {
    return thunkAPI.rejectWithValue('Failed to reset password')
  }
})

// Confirm password reset
export const resetPasswordConfirm = createAsyncThunk(
  'auth/resetPasswordConfirm',
  async (userData, thunkAPI) => {
    try {
      const response = await authService.confirmResetPassword(userData)
      return response
    } catch (error) {
      return thunkAPI.rejectWithValue('Failed to reset the new password')
    }
  }
)

// Fetch current user's details
export const userDetails = createAsyncThunk('auth/userDetails', async (_, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.token
    const response = await authService.userDetails(token)
    return response
  } catch (error) {
    return thunkAPI.rejectWithValue('User is not found!')
  }
})

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false
      state.isError = false
      state.isSuccess = false
      state.message = ''
    },
    storeToken: (state, action) => {
      state.token = action.payload
    },
    storeUser: (state, action) => {
      state.user = action.payload
      state.isAuthenticated = true
    },
    removeUser: (state) => {
      state.token = ''
      state.user = {
        first_name: '',
        last_name: '',
        email: '',
        id_number: ''
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(register.pending, (state) => {
        state.isLoading = true
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false
        state.isSuccess = true
        state.user = action.payload.user
        state.token = action.payload.token
        setLocalStorage(action.payload.user, action.payload.token)
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false
        state.isError = true
        state.message = action.payload
      })

      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false
        state.isSuccess = true
        state.user = action.payload.user
        state.token = action.payload.token
        setLocalStorage(action.payload.user, action.payload.token)
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false
        state.isError = true
        state.message = action.payload
      })

      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null
        state.token = null
      })

      // Activate
      .addCase(activate.pending, (state) => {
        state.isLoading = true
      })
      .addCase(activate.fulfilled, (state) => {
        state.isLoading = false
        state.isSuccess = true
      })
      .addCase(activate.rejected, (state, action) => {
        state.isLoading = false
        state.isError = true
        state.message = action.payload
      })

      // Reset Password
      .addCase(resetPassword.pending, (state) => {
        state.isLoading = true
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.isLoading = false
        state.isSuccess = true
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.isLoading = false
        state.isError = true
        state.message = action.payload
      })

      // Reset Password Confirm
      .addCase(resetPasswordConfirm.pending, (state) => {
        state.isLoading = true
      })
      .addCase(resetPasswordConfirm.fulfilled, (state) => {
        state.isLoading = false
        state.isSuccess = true
      })
      .addCase(resetPasswordConfirm.rejected, (state, action) => {
        state.isLoading = false
        state.isError = true
        state.message = action.payload
      })
  }
})

export const { reset, storeToken, storeUser, removeUser } = authSlice.actions

export default authSlice.reducer
