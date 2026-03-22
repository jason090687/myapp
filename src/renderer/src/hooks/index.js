// Barrel export for all TanStack Query hooks

// Book hooks
export {
  useBooks,
  useAllBooks,
  useBookDetails,
  useAddBook,
  useUpdateBook,
  useDeleteBook
} from './useQueries'

// Borrow hooks
export {
  useBorrowedBooks,
  useBorrowBook,
  useReturnBook,
  useRenewBook,
  useProcessOverduePayment,
  useBorrowRequests,
  useApproveBorrowRequest,
  useRejectBorrowRequest,
  useMarkRequestAsRead,
  useNotificationsCount,
  useOverdueBorrowedBooks
} from './useQueries'

// Student hooks
export {
  useStudents,
  useAllStudents,
  useStudentsWithBorrowCount,
  useCreateStudent,
  useUpdateStudent,
  useDeleteStudent,
  useSearchStudents,
  useStudentDetails
} from './useQueries'

// Custom student management hook
export { useStudent } from './useStudent'

// Dashboard hooks
export {
  useDashboardStats,
  useTopBooks,
  useNewBooks,
  useRecentCheckouts,
  useBorrowedBooksStats,
  useReturnedBooksCount,
  useAllBorrowedRecords,
  useMonthlyStudentStats,
  useNewArrivals,
  useActiveUsers,
  useTotalPenalties,
  useBookStatuses
} from './useQueries'

// Employee hooks
export {
  useEmployees,
  useCreateEmployee,
  useUpdateEmployee,
  useDeleteEmployee,
  useEmployeeDetails
} from './useQueries'

// Custom staff management hook
export { useStaff } from './useStaff'

// User hooks
export {
  useUserDetails,
  useUpdateUserProfile,
  useUsers,
  useCreateUser,
  useChangePassword
} from './useQueries'

// Auth hooks
export {
  useLogin,
  useRegister,
  useActivate,
  useResetPassword,
  useResetPasswordConfirm,
  useVerifyOtp,
  useResendOtp,
  useRequestPasswordResetOtp,
  useResetPasswordWithOtp,
  useLogout
} from './useAuth'
