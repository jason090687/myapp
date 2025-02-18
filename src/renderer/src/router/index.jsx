import { createHashRouter } from 'react-router-dom'
import SignInPage from '../pages/SignInPage'
import SignUpPage from '../pages/SignUpPage'
import ForgotPassword from '../pages/ForgotPassword'
import Dashboard from '../pages/Dashboard'
import Books from '../pages/Books'

const router = createHashRouter([
  {
    path: '/',
    element: <SignInPage />
  },
  {
    path: '/signup',
    element: <SignUpPage />
  },
  {
    path: '/forgot-password',
    element: <ForgotPassword />
  },
  {
    path: '/dashboard',
    element: <Dashboard />
  },
  {
    path: '/books',
    element: <Books />
  }
])

export default router
