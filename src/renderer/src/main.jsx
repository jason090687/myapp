import React, { useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import router from './router'
import './index.css'
import { Provider, useSelector, useDispatch } from 'react-redux'
import { persistor, store } from './app/store'
import { PersistGate } from 'redux-persist/integration/react'
import './styles/global.css'
import './styles/theme.css'
import { Toaster } from 'react-hot-toast'
import { logout } from './Features/authSlice' // Import the logout action
import { ActivityProvider } from './context/ActivityContext'
import './i18n/config'

// Theme removed: force app to always use light mode.
if (typeof document !== 'undefined') {
  const root = document.documentElement
  root.classList.remove('dark')
  root.classList.add('light')
  root.setAttribute('data-theme', 'light')
}

const SessionProvider = ({ children }) => {
  const dispatch = useDispatch()
  const { token } = useSelector((state) => state.auth)

  useEffect(() => {
    let inactivityTimer

    const resetTimer = () => {
      if (token) {
        clearTimeout(inactivityTimer)
        inactivityTimer = setTimeout(
          () => {
            dispatch(logout())
            window.location.href = '/'
          },
          15 * 60 * 1000
        ) // 15 minutes in milliseconds
      }
    }

    const handleActivity = () => {
      resetTimer()
    }

    if (token) {
      window.addEventListener('mousemove', handleActivity)
      window.addEventListener('keydown', handleActivity)
      window.addEventListener('click', handleActivity)
      window.addEventListener('scroll', handleActivity)
      resetTimer() // Start initial timer
    }

    // Cleanup
    return () => {
      if (token) {
        clearTimeout(inactivityTimer)
        window.removeEventListener('mousemove', handleActivity)
        window.removeEventListener('keydown', handleActivity)
        window.removeEventListener('click', handleActivity)
        window.removeEventListener('scroll', handleActivity)
      }
    }
  }, [token, dispatch])

  return children
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <ActivityProvider>
        <SessionProvider>
          <Toaster position="bottom-right" reverseOrder={false} />
          <RouterProvider router={router} />
        </SessionProvider>
      </ActivityProvider>
    </PersistGate>
  </Provider>
)
