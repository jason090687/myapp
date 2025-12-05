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
import OtpVerification from '../pages/OtpVerification'
import ActivationSuccess from '../pages/ActivationSuccess.jsx'
import ResetPasswordOtp from '../pages/ResetPasswordOtp'
import StudentsPage from '../pages/StudentsPage'
import StudentDetailsPage from '../pages/StudentDetailsPage'
import StaffPage from '../pages/StaffPage'
import ErrorBoundary from '../components/ErrorBoundary'
import StaffDetailPage from '../pages/StaffDetailPage'
import AddBook from '../components/AddBook.jsx'
import EditBook from '../pages/EditBook.jsx'
import ProtectedRoute from '../components/ProtectedRoute'

const router = createHashRouter([
  {
    path: '/',
    element: <SignInPage />,
    errorElement: <ErrorBoundary />
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
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    )
  },
  {
    path: '/books',
    element: (
      <ProtectedRoute>
        <ErrorBoundary>
          <Books />
        </ErrorBoundary>
      </ProtectedRoute>
    ),
    errorElement: <ErrorBoundary />
  },
  {
    path: '/books/add-book',
    element: (
      <ProtectedRoute>
        <AddBook />
      </ProtectedRoute>
    )
  },
  {
    path: '/books/edit-book/:id',
    element: (
      <ProtectedRoute>
        <EditBook />
      </ProtectedRoute>
    )
  },
  {
    path: '/borrowed',
    element: (
      <ProtectedRoute>
        <Borrowed />
      </ProtectedRoute>
    )
  },
  {
    path: '/profile',
    element: (
      <ProtectedRoute>
        <ProfilePage />
      </ProtectedRoute>
    )
  },
  {
    path: '/settings',
    element: (
      <ProtectedRoute>
        <Settings />
      </ProtectedRoute>
    ),
    children: [
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
    element: (
      <ProtectedRoute>
        <Help />
      </ProtectedRoute>
    )
  },
  {
    path: '/otp-verification',
    element: <OtpVerification />
  },
  {
    path: '/activation-success',
    element: <ActivationSuccess />
  },
  {
    path: '/reset-password-otp',
    element: <ResetPasswordOtp />
  },
  {
    path: '/students',
    element: (
      <ProtectedRoute>
        <StudentsPage />
      </ProtectedRoute>
    )
  },
  {
    path: '/students/:studentId',
    element: (
      <ProtectedRoute>
        <StudentDetailsPage />
      </ProtectedRoute>
    )
  },
  {
    path: '/staff',
    element: (
      <ProtectedRoute>
        <StaffPage />
      </ProtectedRoute>
    )
  },
  {
    path: '/staff/:staffId',
    element: (
      <ProtectedRoute>
        <StaffDetailPage />
      </ProtectedRoute>
    )
  }
])

export default router
