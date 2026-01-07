import { fetchBooks, fetchBorrowedBooks, searchStudents, fetchEmployees } from '../Features/api'

export const globalSearch = async (token, searchTerm) => {
  if (!searchTerm.trim()) return null

  const settings = [
    { id: 'general', title: 'General Settings', path: '/settings/general' },
    { id: 'books', title: 'Book Management', path: '/settings/books' },
    { id: 'security', title: 'Security Settings', path: '/settings/security' }
  ]
    .filter((item) => item.title.toLowerCase().includes(searchTerm.toLowerCase()))
    .map((item) => ({
      type: 'setting',
      title: item.title,
      subtitle: 'Settings',
      link: item.path,
      id: item.id
    }))

  // If we don't have a token (e.g., initial load), still allow settings search.
  if (!token) {
    return { books: [], borrowed: [], students: [], staff: [], settings }
  }

  const [booksResult, borrowedResult, studentsResult, staffResult] = await Promise.allSettled([
    fetchBooks(token, 1, searchTerm),
    fetchBorrowedBooks(token),
    searchStudents(token, searchTerm, 1),
    fetchEmployees(token)
  ])

  const booksResponse = booksResult.status === 'fulfilled' ? booksResult.value : null
  const borrowedResponse = borrowedResult.status === 'fulfilled' ? borrowedResult.value : null
  const studentsResponse = studentsResult.status === 'fulfilled' ? studentsResult.value : null
  const staffResponse = staffResult.status === 'fulfilled' ? staffResult.value : null

  if (
    booksResult.status === 'rejected' ||
    borrowedResult.status === 'rejected' ||
    studentsResult.status === 'rejected' ||
    staffResult.status === 'rejected'
  ) {
    const err =
      booksResult.status === 'rejected'
        ? booksResult.reason
        : borrowedResult.status === 'rejected'
          ? borrowedResult.reason
          : studentsResult.status === 'rejected'
            ? studentsResult.reason
            : staffResult.status === 'rejected'
              ? staffResult.reason
              : null
    console.error('Search error:', err)
  }

  const books = Array.isArray(booksResponse?.results)
    ? booksResponse.results
    : Array.isArray(booksResponse)
      ? booksResponse
      : []

  const borrowed = Array.isArray(borrowedResponse?.results)
    ? borrowedResponse.results
    : Array.isArray(borrowedResponse)
      ? borrowedResponse
      : []

  const students = Array.isArray(studentsResponse?.results)
    ? studentsResponse.results
    : Array.isArray(studentsResponse)
      ? studentsResponse
      : []

  const staff = Array.isArray(staffResponse?.results)
    ? staffResponse.results
    : Array.isArray(staffResponse)
      ? staffResponse
      : []

  const results = {
    books: books.map((book) => ({
      type: 'book',
      title: book.title,
      subtitle: `by ${book.author}`,
      link: `/books?search=${encodeURIComponent(book.title)}`,
      id: book.id
    })),
    borrowed: borrowed
      .filter(
        (item) =>
          String(item.book_title || '')
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          String(item.student_name || '')
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      )
      .map((item) => ({
        type: 'borrowed',
        title: item.book_title,
        subtitle: `Borrowed by ${item.student_name}`,
        link: `/borrowed?id=${item.id}&highlight=true`, // Updated link format
        id: item.id,
        borrowedId: item.id // Add borrowedId for reference
      })),
    students: students.map((student) => {
      const studentPk = student?.id ?? student?.student_id ?? student?.pk
      return {
        type: 'student',
        title: student?.name || 'Student',
        subtitle: student?.id_number ? `Student • ${student.id_number}` : 'Student',
        link: studentPk ? `/students/${studentPk}` : '/students',
        id: studentPk ?? student?.id_number ?? student?.name
      }
    }),
    staff: staff
      .filter((employee) => {
        const q = searchTerm.toLowerCase()
        return (
          String(employee?.name || '')
            .toLowerCase()
            .includes(q) ||
          String(employee?.id_number || '')
            .toLowerCase()
            .includes(q)
        )
      })
      .map((employee) => {
        const employeePk = employee?.id ?? employee?.employee_id ?? employee?.pk
        return {
          type: 'staff',
          title: employee?.name || 'Staff',
          subtitle: employee?.id_number ? `Staff • ${employee.id_number}` : 'Staff',
          link: employeePk ? `/staff/${employeePk}` : '/staff',
          id: employeePk ?? employee?.id_number ?? employee?.name
        }
      }),
    settings
  }

  return results
}
