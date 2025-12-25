import toast from 'react-hot-toast'

export const useToaster = () => {
  const showToast = (title, description = '', variant = 'success', duration = 4000) => {
    toast(title, { description, type: variant, duration })
  }

  return { showToast }
}
