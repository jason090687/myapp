import { useState } from 'react'
import { FaSearch, FaPlus, FaFileImport } from 'react-icons/fa'
import ImportBooks from './ImportBooks'
import './BooksHeader.css'

function BooksHeader({ onSearch, onAddBook, token, onRefresh }) {
  const [showImport, setShowImport] = useState(false)

  return (
    <>
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
        <div className="header-buttons">
          <button className="add-book-btn" onClick={onAddBook} aria-label="Add new book">
            <FaPlus /> <span className="btn-text">Add New Book</span>
          </button>
          <button
            className="add-book-btn import-btn"
            onClick={() => setShowImport(true)}
            aria-label="Import books"
          >
            <FaFileImport /> <span className="btn-text">Import Books</span>
          </button>
        </div>
      </div>
      {showImport && (
        <ImportBooks token={token} onRefresh={onRefresh} onClose={() => setShowImport(false)} />
      )}
    </>
  )
}

export default BooksHeader
