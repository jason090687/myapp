import { FaSearch, FaPlus } from 'react-icons/fa'
import './BooksHeader.css'

function BooksHeader({ onSearch, onAddBook }) {
  return (
    <div className="books-header">
      <div className="search-bar">
        <FaSearch className="search-icon" />
        <input
          type="text"
          placeholder="Search books..."
          onChange={(e) => onSearch(e.target.value)}
          className="search-input"
          aria-label="Search books"
        />
      </div>
      <button className="add-book-btn" onClick={onAddBook} aria-label="Add new book">
        <FaPlus /> <span className="btn-text">Add New Book</span>
      </button>
    </div>
  )
}

export default BooksHeader
