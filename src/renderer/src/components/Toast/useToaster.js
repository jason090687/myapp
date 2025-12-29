import { useCallback } from 'react'
import toast from 'react-hot-toast'

export const useToaster = () => {
  const showToast = useCallback((title, description = '', variant = 'success', duration = 4000) => {
    toast(title, { description, type: variant, duration })
  }, [])

  return { showToast }
}
