import { FaSearch, FaPlus } from 'react-icons/fa'

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
        />
      </div>
      <button className="add-book-btn" onClick={onAddBook}>
        <FaPlus /> Add New Book
      </button>
    </div>
  )
}

export default BooksHeader
