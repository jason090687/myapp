export const useBookModals = () => {
  const showToast = (title, description, variant = 'success', duration = 4000) => {
    if (typeof window !== 'undefined' && window.showToast) {
      window.showToast(title, description, variant, duration)
    }
  }

  return {
    showToast
  }
}
