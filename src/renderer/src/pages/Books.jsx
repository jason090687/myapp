import { useEffect, useState } from 'react'
import { FaSearch, FaPlus, FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import Sidebar from '../components/Sidebar'
import './Books.css'
import { fetchBooks } from '../Features/api'
import { useSelector } from 'react-redux'

function Books() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setLoading] = useState(false)
  const [books, setBooks] = useState([])
  const [pagination, setPagination] = useState({
    count: 0,
    next: null,
    previous: null,
    currentPage: 1
  })

  const { token } = useSelector((state) => state.auth)

  const fetchBooksData = async (page = 1) => {
    setLoading(true)
    try {
      const response = await fetchBooks(token, page)
      if (response) {
        const booksData = response.results.map((book) => ({
          title: book.title,
          author: book.author,
          seriesTitle: book.series_title,
          publisher: book.publisher,
          placeOfPublication: book.place_of_publication,
          year: book.year,
          edition: book.edition,
          volume: book.volume,
          physicalDescription: book.physical_description,
          isbn: book.isbn,
          accessionNo: book.accession_number,
          barcode: book.barcode,
          dateReceived: book.date_received,
          subject: book.subject,
          dateProcessed: book.date_processed,
          processedBy: book.processed_by,
          status: book.status
        }))
        setBooks(booksData)
        setPagination({
          count: response.count,
          next: response.next,
          previous: response.previous,
          currentPage: page
        })
      }
    } catch (error) {
      console.error('Error fetching books', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBooksData()
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

  const handlePageChange = (newPage) => {
    fetchBooksData(newPage)
  }

  const totalPages = Math.ceil(pagination.count / 10) // Assuming 10 items per page

  return (
    <div className="app-wrapper">
      <Sidebar isCollapsed={isCollapsed} onToggle={handleSidebarToggle} />
      <div className={`books-container ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="books-content">
          {/* Header */}
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

          {/* Table Container */}
          <div className="table-container">
            <div className="books-table-wrapper">
              <table className="books-table">
                <thead>
                  <tr>
                    <th className="col-title">TITLE</th>
                    <th className="col-author">AUTHOR</th>
                    <th className="col-series">SERIES TITLE</th>
                    <th className="col-publisher">PUBLISHER</th>
                    <th className="col-place">PLACE OF PUBLICATION</th>
                    <th className="col-year">YEAR</th>
                    <th className="col-edition">EDITION</th>
                    <th className="col-volume">VOLUME</th>
                    <th className="col-physical">PHYSICAL DESCRIPTION</th>
                    <th className="col-isbn">ISBN</th>
                    <th className="col-accession">ACCESSION NO.</th>
                    <th className="col-barcode">BARCODE</th>
                    <th className="col-date">DATE RECEIVED</th>
                    <th className="col-subject">SUBJECT</th>
                    <th className="col-processed-date">DATE PROCESSED</th>
                    <th className="col-processor">PROCESSED BY</th>
                    <th className="col-status">STATUS</th>
                    <th className="col-action">ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBooks.map((book, index) => (
                    <tr key={index}>
                      <td className="col-title" data-content={book.title}>
                        {book.title}
                      </td>
                      <td className="col-author" data-content={book.author}>
                        {book.author}
                      </td>
                      <td className="col-series" data-content={book.seriesTitle}>
                        {book.seriesTitle}
                      </td>
                      <td className="col-publisher" data-content={book.publisher}>
                        {book.publisher}
                      </td>
                      <td className="col-place" data-content={book.placeOfPublication}>
                        {book.placeOfPublication}
                      </td>
                      <td className="col-year" data-content={book.year}>
                        {book.year}
                      </td>
                      <td className="col-edition" data-content={book.edition}>
                        {book.edition}
                      </td>
                      <td className="col-volume" data-content={book.volume}>
                        {book.volume}
                      </td>
                      <td className="col-physical" data-content={book.physicalDescription}>
                        {book.physicalDescription}
                      </td>
                      <td className="col-isbn" data-content={book.isbn}>
                        {book.isbn}
                      </td>
                      <td className="col-accession" data-content={book.accessionNo}>
                        {book.accessionNo}
                      </td>
                      <td className="col-barcode" data-content={book.barcode}>
                        {book.barcode}
                      </td>
                      <td className="col-date" data-content={book.dateReceived}>
                        {book.dateReceived}
                      </td>
                      <td className="col-subject" data-content={book.subject}>
                        {book.subject}
                      </td>
                      <td className="col-processed-date" data-content={book.dateProcessed}>
                        {book.dateProcessed}
                      </td>
                      <td className="col-processor" data-content={book.processedBy}>
                        {book.processedBy}
                      </td>
                      <td className="col-status" data-content={book.status}>
                        {book.status}
                      </td>
                      <td className="col-action">
                        <div className="action-buttons-container">
                          <button className="action-btn edit">Edit</button>
                          <button className="action-btn delete">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pagination">
              <button
                className="pagination-btn"
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={!pagination.previous}
              >
                <FaChevronLeft />
              </button>

              <span className="pagination-info">
                Page {pagination.currentPage} of {totalPages}
                <span className="pagination-total">(Total: {pagination.count})</span>
              </span>

              <button
                className="pagination-btn"
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={!pagination.next}
              >
                <FaChevronRight />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Books
