import { fetchBooks, fetchBorrowedBooks } from '../Features/api'

export const globalSearch = async (token, searchTerm) => {
  try {
    if (!searchTerm.trim()) return null

    const [booksResponse, borrowedResponse] = await Promise.all([
      fetchBooks(token, 1, searchTerm),
      fetchBorrowedBooks(token)
    ])

    const results = {
      books: booksResponse.results.map(book => ({
        type: 'book',
        title: book.title,
        subtitle: `by ${book.author}`,
        link: `/books?search=${encodeURIComponent(book.title)}`,
        id: book.id
      })),
      borrowed: borrowedResponse.results
        .filter(item => 
          item.book_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.student_name.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .map(item => ({
          type: 'borrowed',
          title: item.book_title,
          subtitle: `Borrowed by ${item.student_name}`,
          link: `/borrowed?id=${item.id}&highlight=true`, // Updated link format
          id: item.id,
          borrowedId: item.id // Add borrowedId for reference
        })),
      settings: [
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
    }

    return results
  } catch (error) {
    console.error('Search error:', error)
    throw error
  }
}
