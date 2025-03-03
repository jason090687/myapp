import { createHashRouter, Navigate } from 'react-router-dom'
import SignInPage from '../pages/SignInPage'
import SignUpPage from '../pages/SignUpPage'
import ForgotPassword from '../pages/ForgotPassword'
import Dashboard from '../pages/Dashboard'
import Books from '../pages/Books'
import Borrowed from '../pages/Borrowed'
import History from '../pages/History'
import Settings from '../pages/Settings'
import GeneralSettings from '../components/settings/GeneralSettings.jsx'
import BookManagement from '../components/settings/BookManagement.jsx'
import NotificationsSettings from '../components/settings/NotificationsSettings.jsx'
import SecuritySettings from '../components/settings/SecuritySettings.jsx'
import BackupSettings from '../components/settings/BackupSettings.jsx'
import Help from '../pages/Help'
import CreateNewPassword from '../pages/CreateNewPassword.jsx'
import AccountActivation from '../pages/AccountActivation.jsx'
import ProfilePage from '../pages/ProfilePage.jsx'

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
    path: '/activate',
    element: <AccountActivation />
  },
  {
    path: '/create-new-password/',
    element: <CreateNewPassword />
  },
  {
    path: '/dashboard',
    element: <Dashboard />
  },
  {
    path: '/books',
    element: <Books />
  },
  {
    path: '/borrowed',
    element: <Borrowed />
  },
  {
    path: '/history',
    element: <History />
  },
  {
    path: '/profile',
    element: <ProfilePage />
  },
  {
    path: '/settings',
    element: <Settings />,
    children: [
      {
        index: true, // Add this
        element: <GeneralSettings />
      },
      {
        path: 'general',
        element: <GeneralSettings />
      },
      {
        path: 'books',
        element: <BookManagement />
      },
      {
        path: 'notifications',
        element: <NotificationsSettings />
      },
      {
        path: 'security',
        element: <SecuritySettings />
      },
      {
        path: 'backup',
        element: <BackupSettings />
      }
    ]
  },
  {
    path: '/settings/*',
    element: <Navigate to="/settings" replace />
  },
  {
    path: '/help',
    element: <Help />
  }
])

export default router
