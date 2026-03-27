import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api, { getToken, multipartConfig } from '../api/axios'

// ==================== BOOK QUERIES ====================

// Fetch all books with pagination
export const useBooks = (page = 1, search = "", action = "", copiesFilter = "") => {
  return useQuery({
    queryKey: ["books", page, search, action, copiesFilter],
    queryFn: async () => {
      const token = getToken();
      let url = `/marc/search/?page=${page}&page_size=10`;

      if (search) url += `&search=${encodeURIComponent(search)}`;
      if (action) url += `&action=${encodeURIComponent(action)}`; // only if backend supports action filtering
      if (copiesFilter) url += `&copies__gt=${copiesFilter}`;

      const response = await api.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
    keepPreviousData: true,
  });
};

// Fetch all books across all pages
export const useAllBooks = (search = '') => {
  return useQuery({
    queryKey: ['books', 'all', search],
    queryFn: async () => {
      const token = getToken()
      let allBooks = []
      let nextPage = 1
      let hasMore = true

      while (hasMore) {
        const response = await api.get(
          `/marc/search/?page=${nextPage}&search=${encodeURIComponent(search)}`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        allBooks = [...allBooks, ...response.data.results]
        hasMore = response.data.next !== null
        nextPage += 1
      }

      return allBooks
    },
    staleTime: 5 * 60 * 1000
  })
}

// Fetch single book details
export const useBookDetails = (bookId) => {
  return useQuery({
    queryKey: ['book', bookId],
    queryFn: async () => {
      const token = getToken()
      const response = await api.get(`/marc/record/${bookId}/`, {
        ...multipartConfig,
        headers: { ...multipartConfig.headers, Authorization: `Bearer ${token}` }
      })
      return response.data
    },
    enabled: !!bookId,
    staleTime: 5 * 60 * 1000
  })
}

// Add new book
export const useAddBook = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (bookData) => {
      const token = getToken()
      const response = await api.post(`/marc/record/`, bookData, {
        ...multipartConfig,
        headers: { ...multipartConfig.headers, Authorization: `Bearer ${token}` }
      })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] })
      queryClient.invalidateQueries({ queryKey: ['book'] })
    }
  })
}

// Update book
export const useUpdateBook = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ bookId, bookData }) => {
      const token = getToken()
      const response = await api.patch(`/marc/record/${bookId}/`, bookData, {
        ...multipartConfig,
        headers: { ...multipartConfig.headers, Authorization: `Bearer ${token}` }
      })
      return response.data
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['books'] })
      queryClient.invalidateQueries({ queryKey: ['book', variables.bookId] })
    }
  })
}

// Delete book (soft delete)
export const useDeleteBook = () => {
  return useMutation({
    mutationFn: async ({ bookId, cancelData }) => {
      const token = getToken()
      await api.patch(
        `/marc/record/${bookId}/`,
        {
          cancelled: true,
          cancelled_by: cancelData.cancelledBy,
          cancelled_at: cancelData.cancelledAt
        },
        {
          ...multipartConfig,
          headers: { ...multipartConfig.headers, Authorization: `Bearer ${token}` }
        }
      )
      return true
    }
  })
}

// ==================== BORROW QUERIES ====================

// Fetch borrowed books
export const useBorrowedBooks = (page = 1, searchTerm = '') => {
  return useQuery({
    queryKey: ['borrowed', page, searchTerm],
    queryFn: async () => {
      const token = getToken()
      const response = await api.get(
        `/borrow/list/?page=${page}&search=${searchTerm}&ordering=return_status,-returned_date`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      return response.data
    },
    staleTime: 2 * 60 * 1000,
    keepPreviousData: true
  })
}

// Borrow a book
export const useBorrowBook = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (borrowData) => {
      const token = getToken()
      const response = await api.post(`/borrow/`, borrowData, {
        headers: { Authorization: `Bearer ${token}` }
      })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['borrowed'] })
      queryClient.invalidateQueries({ queryKey: ['borrowRequests'] })
    }
  })
}

// Return book
export const useReturnBook = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ bookId, returnData }) => {
      const token = getToken()
      const response = await api.patch(
        `/borrow/return/${bookId}/`,
        {
          is_returned: true,
          returned_date: returnData.returned_date || new Date().toISOString().split('T')[0],
          status: returnData.status || 'returned'
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['borrowed'] })
    }
  })
}

// Renew book
export const useRenewBook = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ borrowId, renewData }) => {
      const token = getToken()
      const response = await api.patch(
        `/borrow/renew/${borrowId}/`,
        {
          due_date: renewData.due_date,
          renewed_count: renewData.renewed_count
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      return response.data
    },
    onSuccess: () => {
      // queryClient.invalidateQueries({ queryKey: ['borrowed'] })
      queryClient.invalidateQueries({ queryKey: ['borrowedBooks'] })
    }
  })
}

// Process overdue payment
export const useProcessOverduePayment = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ borrowId, paymentData }) => {
      const token = getToken()
      const response = await api.patch(
        `/borrow/fines/${borrowId}/`,
        {
          ...paymentData,
          paid: true,
          paid_at: paymentData.paid_at,
          is_returned: paymentData.is_returned || false,
          returned_date: paymentData.is_returned ? new Date().toISOString().split('T')[0] : null,
          or_number: paymentData.or_number
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['borrowed'] })
    }
  })
}

// Fetch borrow requests
export const useBorrowRequests = (status = 'pending') => {
  return useQuery({
    queryKey: ['borrowRequests', status],
    queryFn: async () => {
      const token = getToken()
      const response = await api.get(`/borrow/requests/?status=pending&is_read=true`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      return response.data
    },
    staleTime: 2 * 60 * 1000
  })
}

// Approve borrow request
export const useApproveBorrowRequest = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ requestId, approvalData }) => {
      const token = getToken()
      const response = await api.post(
        `/borrow/requests/${requestId}/respond/`,
        {
          action: 'approve',
          student_id: approvalData.student_id,
          response_notes: approvalData.response_notes || ''
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['borrowRequests'] })
      queryClient.invalidateQueries({ queryKey: ['borrowed'] })
    }
  })
}

// Reject borrow request
export const useRejectBorrowRequest = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ requestId, rejectionData }) => {
      const token = getToken()
      const response = await api.post(
        `/borrow/requests/${requestId}/respond/`,
        {
          action: 'reject',
          response_notes: rejectionData.response_notes || ''
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['borrowRequests'] })
    }
  })
}

// Mark request as read
export const useMarkRequestAsRead = () => {
  return useMutation({
    mutationFn: async (requestId) => {
      const token = getToken()
      const response = await api.post(
        `/borrow/requests/${requestId}/mark-read/`,
        { is_read: true },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      return response.data
    }
  })
}

// Get notifications count
export const useNotificationsCount = () => {
  return useQuery({
    queryKey: ['notificationsCount'],
    queryFn: async () => {
      const token = getToken()
      const response = await api.get(`/borrow/requests/notifications/count/`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      return response.data
    },
    staleTime: 1 * 60 * 1000
  })
}

// Fetch overdue borrowed books
export const useOverdueBorrowedBooks = (borrowedId) => {
  return useQuery({
    queryKey: ['overdue', borrowedId],
    queryFn: async () => {
      const token = getToken()
      const response = await api.get(`/borrow/fines/${borrowedId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      return response.data
    },
    enabled: !!borrowedId
  })
}

// ==================== STUDENT QUERIES ====================

// Fetch students
export const useStudents = (page = 1, searchTerm = '') => {
  return useQuery({
    queryKey: ['students', page, searchTerm],
    queryFn: async () => {
      const token = getToken()
      const response = await api.get(`/students/?page=${page}&search=${encodeURIComponent(searchTerm)}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      return response.data
    },
    staleTime: 5 * 60 * 1000,
    keepPreviousData: true
  })
}

// Fetch all students
export const useAllStudents = () => {
  return useQuery({
    queryKey: ['students', 'all'],
    queryFn: async () => {
      const token = getToken()
      const response = await api.get(`/students/`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      return response.data.results || []
    },
    staleTime: 5 * 60 * 1000
  })
}

// Fetch students with borrow count
export const useStudentsWithBorrowCount = () => {
  return useQuery({
    queryKey: ['students', 'withBorrowCount'],
    queryFn: async () => {
      const token = getToken()
      const firstResponse = await api.get(`/students/`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const totalPages = Math.ceil(firstResponse.data.count / 10)

      const pagePromises = Array.from({ length: totalPages }, (_, i) =>
        api.get(`/students/?page=${i + 1}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      )

      const pages = await Promise.all(pagePromises)
      const allStudents = pages.flatMap((response) => response.data.results)

      return allStudents
        .filter((student) => student.borrowed_books_count >= 1)
        .sort((a, b) => b.borrowed_books_count - a.borrowed_books_count)
    },
    staleTime: 5 * 60 * 1000
  })
}

// ==================== DASHBOARD QUERIES ====================

// Fetch dashboard stats
export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      const token = getToken()
      const [booksRes, borrowedRes, returnedRes, overdueRes] = await Promise.all([
        api.get(`/marc/search/`, { headers: { Authorization: `Bearer ${token}` } }),
        api.get(`/borrow/list/`, { headers: { Authorization: `Bearer ${token}` } }),
        api.get(`/borrow/list/?is_returned=true`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        api.get(`/borrow/list/?is_overdue=true`, { headers: { Authorization: `Bearer ${token}` } })
      ])

      return {
        totalBooks: booksRes.data.count,
        borrowed: borrowedRes.data.count,
        returned: returnedRes.data.count,
        overdue: overdueRes.data.count
      }
    },
    staleTime: 2 * 60 * 1000
  })
}

// Fetch top books
export const useTopBooks = () => {
  return useQuery({
    queryKey: ['topBooks'],
    queryFn: async () => {
      const token = getToken()
      const response = await api.get(`/borrow/top-books/`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      return response.data.book_borrowing_frequencies || []
    },
    staleTime: 10 * 60 * 1000
  })
}

// Fetch new books
export const useNewBooks = () => {
  return useQuery({
    queryKey: ['newBooks'],
    queryFn: async () => {
      const token = getToken()
      const response = await api.get(`/marc/search/?ordering=-date_added`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      return response.data
    },
    staleTime: 5 * 60 * 1000
  })
}

// Fetch recent checkouts
export const useRecentCheckouts = (limit = 5) => {
  return useQuery({
    queryKey: ['recentCheckouts', limit],
    queryFn: async () => {
      const token = getToken()
      const response = await api.get(`/borrow/list/`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      return response.data.results.slice(0, limit)
    },
    staleTime: 2 * 60 * 1000
  })
}

// Fetch borrowed books stats (optimized - uses API counts instead of client-side processing)
export const useBorrowedBooksStats = () => {
  return useQuery({
    queryKey: ['borrowedStats'],
    queryFn: async () => {
      const token = getToken()
      // Use API counts instead of fetching all records
      const [borrowedRes, overdueRes] = await Promise.all([
        api.get(`/borrow/list/?status=Borrowed`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        api.get(`/borrow/list/?status=Overdue`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ])

      // Calculate pending fees from overdue records (need to fetch a limited number)
      const overdueResponse = await api.get(`/borrow/list/?status=Overdue&page_size=100`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const totalFees = (overdueResponse.data.results || []).reduce(
        (total, book) => total + (parseFloat(book.amount) || 0),
        0
      )

      return {
        borrowed: borrowedRes.data.count || 0,
        overdue: overdueRes.data.count || 0,
        pendingFees: totalFees
      }
    },
    staleTime: 2 * 60 * 1000
  })
}

// ==================== USER QUERIES ====================

// Fetch user details
export const useUserDetails = () => {
  return useQuery({
    queryKey: ['userDetails'],
    queryFn: async () => {
      const token = getToken()
      const response = await api.get(`/accounts/auth/users/me/`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      return response.data
    },
    staleTime: 10 * 60 * 1000
  })
}

// Update user profile
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
      queryClient.invalidateQueries({ queryKey: ['userDetails'] })
    }
  })
}

// Fetch all users
export const useUsers = (searchTerm = '', page = 1) => {
  return useQuery({
    queryKey: ['users', page, searchTerm],
    queryFn: async () => {
      const token = getToken()
      const response = await api.get(`/accounts/auth/users/?page=${page}&search=${encodeURIComponent(searchTerm)}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      return response.data
    },
    staleTime: 5 * 60 * 1000
  })
}

// Create user
export const useCreateUser = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload) => {
      const token = getToken()
      const response = await api.post(`/accounts/auth/users/`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    }
  })
}

// Change password
export const useChangePassword = () => {
  return useMutation({
    mutationFn: async (passwordData) => {
      const token = getToken()
      const response = await api.post(`/accounts/auth/users/set_password/`, passwordData, {
        headers: { Authorization: `Bearer ${token}` }
      })
      return response.data
    }
  })
}

// ==================== ADDITIONAL DASHBOARD QUERIES ====================

// Fetch returned books count
export const useReturnedBooksCount = () => {
  return useQuery({
    queryKey: ['returnedBooksCount'],
    queryFn: async () => {
      const token = getToken()
      const response = await api.get(`/borrow/returned-books/`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      return {
        returnedCount: response.data.returned_books_count || 0
      }
    },
    staleTime: 2 * 60 * 1000
  })
}

// Fetch all borrowed records (optimized - uses API counts)
export const useAllBorrowedRecords = () => {
  return useQuery({
    queryKey: ['allBorrowedRecords'],
    queryFn: async () => {
      const token = getToken()
      // Use parallel API calls with counts instead of fetching all records
      const [borrowedRes, returnedRes, overdueRes, paidRes] = await Promise.all([
        api.get(`/borrow/list/?is_returned=false`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        api.get(`/borrow/list/?is_returned=true`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        api.get(`/borrow/list/?is_overdue=true`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        api.get(`/borrow/list/?paid=true&page_size=100`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ])

      // Calculate total paid amount from the records (limit to 100 for performance)
      const totalAmount = (paidRes.data.results || []).reduce(
        (sum, record) => sum + (parseFloat(record.amount) || 0),
        0
      )

      return {
        borrowed: borrowedRes.data.results || [],
        returned: returnedRes.data.results || [],
        overdue: overdueRes.data.results || [],
        amount: totalAmount,
        total: (borrowedRes.data.count || 0) + (returnedRes.data.count || 0)
      }
    },
    staleTime: 2 * 60 * 1000
  })
}

// Fetch monthly student stats
export const useMonthlyStudentStats = () => {
  return useQuery({
    queryKey: ['monthlyStudentStats'],
    queryFn: async () => {
      const token = getToken()
      const response = await api.get(`/marc/monthly-report/`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      return response.data
    },
    staleTime: 10 * 60 * 1000
  })
}

// Fetch new arrivals
export const useNewArrivals = () => {
  return useQuery({
    queryKey: ['newArrivals'],
    queryFn: async () => {
      const token = getToken()
      const response = await api.get(`/marc/new-arrivals/`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      return response.data.results || []
    },
    staleTime: 10 * 60 * 1000
  })
}

// Fetch active users
export const useActiveUsers = () => {
  return useQuery({
    queryKey: ['activeUsers'],
    queryFn: async () => {
      const token = getToken()
      const response = await api.get(`/accounts/auth/users/`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      return {
        total: response.data.count,
        users: response.data.results
      }
    },
    staleTime: 5 * 60 * 1000
  })
}

// Fetch total penalties
export const useTotalPenalties = () => {
  return useQuery({
    queryKey: ['totalPenalties'],
    queryFn: async () => {
      const token = getToken()
      const response = await api.get(`/borrow/fines/`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      const totalPenalties = response.data.total_penalties
      const overdueCount = response.data.overdue_count

      const isValidTotalPenalties =
        typeof totalPenalties === 'number' && totalPenalties >= 0 && totalPenalties < 1000000
      const isValidOverdueCount =
        typeof overdueCount === 'number' && overdueCount >= 0 && overdueCount < 10000

      return {
        totalPenalties: isValidTotalPenalties ? totalPenalties : 0,
        overdueCount: isValidOverdueCount ? overdueCount : 0,
        overdueBooks: Array.isArray(response.data.overdue_books) ? response.data.overdue_books : []
      }
    },
    staleTime: 2 * 60 * 1000
  })
}

// Fetch book statuses
export const useBookStatuses = () => {
  return useQuery({
    queryKey: ['bookStatuses'],
    queryFn: async () => {
      const token = getToken()
      const response = await api.get(`/borrow/status/`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      return Object.entries(response.data).map(([value, label]) => ({
        value,
        label
      }))
    },
    staleTime: 10 * 60 * 1000
  })
}

// ==================== STUDENT MUTATIONS ====================

// Create student
export const useCreateStudent = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (studentData) => {
      const token = getToken()
      const response = await api.post(`/students/`, studentData, {
        headers: { Authorization: `Bearer ${token}` }
      })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] })
    }
  })
}

// Update student
export const useUpdateStudent = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ studentId, updateData }) => {
      const token = getToken()
      const response = await api.patch(`/students/${studentId}/`, updateData, {
        headers: { Authorization: `Bearer ${token}` }
      })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] })
    }
  })
}

// Delete student
export const useDeleteStudent = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ studentId, cancelData }) => {
      const token = getToken()
      const cancelledAt = cancelData?.cancelledAt ?? new Date().toISOString()
      const payload = {
        cancelled: true,
        cancelled_at: cancelledAt
      }

      if (cancelData?.cancelledBy !== undefined && cancelData?.cancelledBy !== null) {
        payload.cancelled_by = cancelData.cancelledBy
      }

      const response = await api.patch(`/students/${studentId}/`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] })
    }
  })
}

// Search students
export const useSearchStudents = (searchTerm, page = 1) => {
  return useQuery({
    queryKey: ['students', 'search', searchTerm, page],
    queryFn: async () => {
      const token = getToken()
      const response = await api.get(
        `/students/?search=${encodeURIComponent(searchTerm || '')}&page=${page}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      return response.data
    },
    enabled: true, // Always enabled to allow initial load and export
    staleTime: 2 * 60 * 1000
  })
}

// Fetch student details by id_number (returns only active status for borrow validation)
// export const useStudentDetails = (studentId) => {
//   return useQuery({
//     queryKey: ['student', studentId],
//     queryFn: async () => {
//       const token = getToken()
//       // Search for student by id_number since /students/{id}/ may not be available
//       const response = await api.get(`/students/?search=${studentId}&page_size=1`, {
//         headers: { Authorization: `Bearer ${token}` }
//       })
//       const students = response.data.results || []
//       if (students.length === 0) {
//         throw new Error('Student not found')
//       }
//       const student = students[0]
//       // Return only necessary fields for borrow validation
//       return {
//         active: student.active,
//         first_name: student.first_name,
//         last_name: student.last_name,
//         id_number: student.id_number
//       }
//     },
//     enabled: !!studentId,
//     staleTime: 5 * 60 * 1000
//   })
// }

export const useStudentDetails = (studentId) => {
  return useQuery({
    queryKey: ['student', studentId],
    queryFn: async () => {
      const token = getToken()
      const response = await api.get(`/students/${studentId}/`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      return response.data
    },
    enabled: !!studentId,
    staleTime: 5 * 60 * 1000
  })
}

// ==================== FETCH EMPLOYEES ====================
export const useEmployees = (searchTerm, page = 1) => {
  return useQuery({
    queryKey: ['employees', page, searchTerm],
    queryFn: async () => {
      const token = getToken()
      const response = await api.get(`/students/employees/?page=${page}&search=${encodeURIComponent(searchTerm)}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      return response.data
    },
    staleTime: 0
  })
}

// ==================== CREATE ====================
export const useCreateEmployee = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (employeeData) => {
      const token = getToken()
      const response = await api.post(`/students/`, employeeData, {
        headers: { Authorization: `Bearer ${token}` }
      })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['students'])
    }
  })
}

// ==================== UPDATE ====================
export const useUpdateEmployee = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ employeeId, updateData, userId }) => {
      const token = getToken()

      const payload = {
        ...updateData,
        updated_by: userId
      }

      const response = await api.patch(
        `/students/${employeeId}/`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )

      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['employees'])
    }
  })
}

// ==================== DELETE (SOFT DELETE) ====================
export const useDeleteEmployee = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ employeeId, cancelData, userId }) => {
      const token = getToken()

      const payload = {
        cancelled: true,
        cancelled_at: cancelData?.cancelledAt || new Date().toISOString(),
        cancelled_by: userId
      }

      const response = await api.patch(
        `/students/${employeeId}/`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )

      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['employees'])
    }
  })
}

// ==================== EMPLOYEE DETAILS ====================
export const useEmployeeDetails = (employeeId) => {
  return useQuery({
    queryKey: ['employee', employeeId],
    queryFn: async () => {
      const token = getToken()

      // ✅ FIXED ENDPOINT HERE
      const response = await api.get(`/students/${employeeId}/`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      return response.data
    },
    enabled: !!employeeId,
    staleTime: 0
  })
}

// ==================== UTILITY FUNCTIONS FOR SERVICES ====================
// These are async functions (not hooks) for use in service files

// Fetch books for search service
export const fetchBooksUtil = async (token, page = 1, search = '', subject = '') => {
  try {
    let url = `/marc/search/?page=${page}&page_size=10&search=${encodeURIComponent(search)}`
    if (subject) {
      url += `&subject=${encodeURIComponent(subject)}`
    }
    const response = await api.get(url, {
      headers: { Authorization: `Bearer ${token}` }
    })
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch books')
  }
}

// Search students for search service
export const searchStudentsUtil = async (token, searchTerm, page = 1) => {
  try {
    const response = await api.get(
      `/students/?search=${encodeURIComponent(searchTerm)}&page=${page}`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    )
    return response.data
  } catch (error) {
    console.error('Search students error:', error)
    throw new Error(error.response?.data?.message || 'Failed to search students')
  }
}

// Fetch employees for search service
export const fetchEmployeesUtil = async (token) => {
  try {
    const response = await api.get(`/students/employees/`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    return response.data
  } catch (error) {
    console.error('Error fetching employees:', error)
    throw new Error(error.response?.data?.message || 'Failed to fetch employees')
  }
}

// Fetch borrowed books for search service (from api/borrow)
export const fetchBorrowedBooksUtil = async (page = 1, searchTerm = '') => {
  try {
    const token = getToken()
    const response = await api.get(
      `/borrow/list/?page=${page}&search=${searchTerm}&ordering=return_status,-returned_date`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    )
    return response.data
  } catch (error) {
    console.error('Error fetching borrowed books:', error)
    throw new Error(error.response?.data?.message || 'Failed to fetch borrowed books')
  }
}
