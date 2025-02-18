import { useEffect, useState } from 'react'
import { FaSearch, FaPlus } from 'react-icons/fa'
import Sidebar from '../components/Sidebar'
import './Books.css'
import { fetchBooks } from '../Features/api'

function Books() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setLoading] = useState(false)
  const [books, setBooks] = useState([])

  useEffect(() => {
    setLoading(true)
    const fetchBookData = async () => {
      try {
        const booksData = await fetchBooks(token)
        setBooks(booksData)
        console.log(booksData)
      } catch (error) {
        console.error('Error fetching books', error)
      } finally {
        setLoading(false)
      }
    }

    fetchBookData()
  }, [token])

  const handleSidebarToggle = () => {
    setIsCollapsed(!isCollapsed)
  }

  const handleSearch = (e) => {
    setSearchTerm(e.target.value.toLowerCase())
  }

  const filteredBooks = books.filter((book) =>
    Object.values(book).some((value) => value.toString().toLowerCase().includes(searchTerm))
  )

  const handleAddBook = () => {
    // Add new book logic here
    console.log('Add new book')
  }

  const handleSort = (columnIndex) => {
    // Add sorting logic here
    console.log('Sort by column:', columnIndex)
  }

  return (
    <div className="app-wrapper">
      <Sidebar isCollapsed={isCollapsed} onToggle={handleSidebarToggle} />

      <div className={`books-container ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="books-content">
          <div className="books-header">
            <div className="search-bar">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search books..."
                onChange={handleSearch}
                className="search-input"
              />
            </div>
            <button className="add-book-btn" onClick={handleAddBook}>
              <FaPlus /> Add New Book
            </button>
          </div>

          <div className="table-container">
            <table className="books-table">
              <thead>
                <tr>
                  <th onClick={() => handleSort(0)}>TITLE</th>
                  <th onClick={() => handleSort(1)}>AUTHOR</th>
                  <th onClick={() => handleSort(2)}>SERIES TITLE</th>
                  <th onClick={() => handleSort(3)}>PUBLISHER</th>
                  <th onClick={() => handleSort(4)}>PLACE OF PUBLICATION</th>
                  <th onClick={() => handleSort(5)}>YEAR</th>
                  <th onClick={() => handleSort(6)}>EDITION</th>
                  <th onClick={() => handleSort(7)}>VOLUME</th>
                  <th onClick={() => handleSort(8)}>PHYSICAL DESCRIPTION</th>
                  <th onClick={() => handleSort(9)}>ISBN</th>
                  <th onClick={() => handleSort(10)}>ACCESSION NO.</th>
                  <th onClick={() => handleSort(11)}>BARCODE</th>
                  <th onClick={() => handleSort(12)}>DATE RECEIVED</th>
                  <th onClick={() => handleSort(13)}>SUBJECT</th>
                  <th onClick={() => handleSort(14)}>DATE PROCESSED</th>
                  <th onClick={() => handleSort(15)}>PROCESSED BY</th>
                  <th onClick={() => handleSort(16)}>STATUS</th>
                  <th className="action">ACTION</th>
                </tr>
              </thead>
              <tbody>
                {filteredBooks.map((book, index) => (
                  <tr key={index}>
                    <td>{book.title}</td>
                    <td>{book.author}</td>
                    <td>{book.seriesTitle}</td>
                    <td>{book.publisher}</td>
                    <td>{book.placeOfPublication}</td>
                    <td>{book.year}</td>
                    <td>{book.edition}</td>
                    <td>{book.volume}</td>
                    <td>{book.physicalDescription}</td>
                    <td>{book.isbn}</td>
                    <td>{book.accessionNo}</td>
                    <td>{book.barcode}</td>
                    <td>{book.dateReceived}</td>
                    <td>{book.subject}</td>
                    <td>{book.dateProcessed}</td>
                    <td>{book.processedBy}</td>
                    <td>{book.status}</td>
                    <td className="action">
                      <button className="action-btn edit">Edit</button>
                      <button className="action-btn delete">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Books
