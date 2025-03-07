import { createHashRouter, Navigate } from 'react-router-dom'
import SignInPage from '../pages/SignInPage'
import SignUpPage from '../pages/SignUpPage'
import ForgotPassword from '../pages/ForgotPassword'
import Dashboard from '../pages/Dashboard'
import Books from '../pages/Books'
import Borrowed from '../pages/Borrowed'
import Settings from '../pages/Settings'
import BackupSettings from '../components/settings/BackupSettings.jsx'
import Help from '../pages/Help'
import CreateNewPassword from '../pages/CreateNewPassword.jsx'
import ProfilePage from '../pages/ProfilePage.jsx'
import SoftwareUpdate from '../components/settings/SoftwareUpdate.jsx'
import OtpVerification from '../pages/OtpVerification'
import ActivationSuccess from '../pages/ActivationSuccess.jsx'

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
    path: '/profile',
    element: <ProfilePage />
  },
  {
    path: '/settings',
    element: <Settings />,
    children: [
      {
        index: true,
        element: <BackupSettings />
      },
      {
        path: 'software-update',
        element: <SoftwareUpdate />
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
  },
  {
    path: '/otp-verification',
    element: <OtpVerification />
  },
  {
    path: '/activation-success',
    element: <ActivationSuccess />
  }
])

export default router
