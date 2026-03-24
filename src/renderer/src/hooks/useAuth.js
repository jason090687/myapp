import { useMutation, useQueryClient } from '@tanstack/react-query'
import api, { setAuthToken, getToken, multipartConfig } from '../api/axios'

// ==================== AUTH MUTATIONS ====================

// Login
export const useLogin = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (userData) => {
      const response = await api.post(`/accounts/auth/jwt/create/`, userData)
      return response.data
    },
    onSuccess: (data) => {
      setAuthToken(data.access)
      localStorage.setItem('authToken', data.access)
      queryClient.invalidateQueries({ queryKey: ['userDetails'] })
    }
  })
}

// Register
export const useRegister = () => {
  return useMutation({
    mutationFn: async (userData) => {
      const response = await api.post(`/accounts/auth/users/`, userData)
      return response.data
    }
  })
}

// Activate user
export const useActivate = () => {
  return useMutation({
    mutationFn: async (userData) => {
      const response = await api.post(`/accounts/auth/users/activation/`, userData)
      return response.data
    }
  })
}

// Reset password
export const useResetPassword = () => {
  return useMutation({
    mutationFn: async (userData) => {
      const response = await api.post(`/accounts/auth/users/reset_password/`, userData)
      return response.data
    }
  })
}

// Reset password confirm
export const useResetPasswordConfirm = () => {
  return useMutation({
    mutationFn: async (userData) => {
      const response = await api.post(`/accounts/auth/users/reset_password_confirm/`, userData)
      return response.data
    }
  })
}

// Verify OTP
export const useVerifyOtp = () => {
  return useMutation({
    mutationFn: async (verifyData) => {
      const response = await api.post(`/accounts/verify-otp/`, verifyData)
      return response.data
    }
  })
}

// Resend OTP
export const useResendOtp = () => {
  return useMutation({
    mutationFn: async (email) => {
      const response = await api.post(`/accounts/resend-otp/`, { email })
      return response.data
    }
  })
}

// Request password reset OTP
export const useRequestPasswordResetOtp = () => {
  return useMutation({
    mutationFn: async (email) => {
      const response = await api.post(`/accounts/request-password-reset/`, { email })
      return response.data
    }
  })
}

// Reset password with OTP
export const useResetPasswordWithOtp = () => {
  return useMutation({
    mutationFn: async ({ email, otp, newPassword }) => {
      const response = await api.post(`/accounts/reset-password/`, {
        email,
        otp,
        new_password: newPassword
      })
      return response.data
    }
  })
}

export const useChangePassword = () => {
  return useMutation({
    mutationFn: async (passwordData) => {
      const token = getToken()
      const response = await api.post(`/accounts/auth/users/set_password/`, passwordData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      return response.data
    }
  })
}


export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (formData) => {
      const token = getToken()
      const response = await api.patch(`/accounts/auth/users/me/`, formData, {
        ...multipartConfig,
        headers: { ...multipartConfig.headers, Authorization: `Bearer ${token}` }
      })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['userDetails'] })
    }
  })
}

// Logout (clear token)
export const useLogout = () => {
  const queryClient = useQueryClient()
  return {
    mutate: () => {
      localStorage.removeItem('authToken')
      localStorage.removeItem('user')
      setAuthToken('')
      queryClient.clear()
    },
    mutateAsync: async () => {
      localStorage.removeItem('authToken')
      localStorage.removeItem('user')
      setAuthToken('')
      await queryClient.cancelQueries()
      queryClient.clear()
    }
  }
}
