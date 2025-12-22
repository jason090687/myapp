import { useState } from 'react'
import { FaSearch, FaPlus, FaFileImport, FaSortAmountUp } from 'react-icons/fa'
import ImportBooks from './ImportBooks'
import './BooksHeader.css'

function BooksHeader({ onSearch, onAddBook, token, onRefresh, sortConfig, onSort, categories }) {
  const [showImport, setShowImport] = useState(false)

  return (
    <div className="top-label">
      <div className="header-buttons">
        <div className="title-container">
          <h1 className="title-header">Library Collection</h1>
          <span className="sub-header">Manage your books effectively</span>
        </div>
        <div className="btn-container">
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

        {/* Categories Filter */}
        {categories && categories.length > 0 && (
          <div className="categories-filter">
            <label htmlFor="category-select">Category:</label>
            <select
              id="category-select"
              className="category-select"
              onChange={(e) => {
                // This can be extended to filter by category
                console.log('Selected category:', e.target.value)
              }}
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Sorting Dropdown */}
        <div className="sort-container">
          <label htmlFor="sort-select">Sort By:</label>
          <select
            id="sort-select"
            className="sort-select"
            onChange={(e) => {
              onSort(e.target.value)
            }}
            value={sortConfig.column || ''}
          >
            <option value="">Default</option>
            <option value="title">Title</option>
            <option value="author">Author</option>
            <option value="year">Year</option>
            <option value="date_received">Date Received</option>
            <option value="status">Status</option>
          </select>
        </div>
      </div>
      {showImport && (
        <ImportBooks token={token} onRefresh={onRefresh} onClose={() => setShowImport(false)} />
      )}
    </div>
  )
}

export default BooksHeader
