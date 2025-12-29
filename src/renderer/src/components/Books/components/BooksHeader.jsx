import { useState } from 'react'
import { Search, Plus, FileUp, Grid3x3, List } from 'lucide-react'
import { Button } from '../../ui/button'
import ImportBooks from './ImportBooks'
import './BooksHeader.css'

function BooksHeader({
  onSearch,
  onAddBook,
  token,
  onRefresh,
  sortConfig,
  onSort,
  onViewChange,
  viewMode = 'table'
}) {
  const [showImport, setShowImport] = useState(false)

  return (
    <div className="top-label">
      <div className="header-buttons">
        <div className="title-container">
          <h1 className="title-header">Library Collection</h1>
          <span className="sub-header">Manage your books effectively</span>
        </div>
      </div>
      <div className="books-header">
        <div className="search-bar">
          <Search className="search-icon" size={18} />
          <input
            type="text"
            placeholder="Search books..."
            onChange={(e) => onSearch(e.target.value)}
            className="search-input"
            aria-label="Search books"
          />
        </div>

        {/* Sorting Dropdown */}

        <div className="btn-container">
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

          <Button variant="primary" onClick={onAddBook} aria-label="Add new book" className="gap-2">
            <Plus size={18} />
            {/* <span className="btn-text">Add New Book</span> */}
          </Button>
          <Button
            onClick={() => setShowImport(true)}
            aria-label="Import books"
            variant="secondary"
            className="gap-2"
          >
            <FileUp size={18} />
            {/* <span className="btn-text">Import Books</span> */}
          </Button>
          <div className="view-toggle">
            <button
              className={`toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => onViewChange('table')}
              title="Table View"
              aria-label="Switch to table view"
            >
              <List size={18} />
            </button>
            <button
              className={`toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => onViewChange('grid')}
              title="Grid View"
              aria-label="Switch to grid view"
            >
              <Grid3x3 size={18} />
            </button>
          </div>
        </div>
      </div>
      {showImport && (
        <ImportBooks token={token} onRefresh={onRefresh} onClose={() => setShowImport(false)} />
      )}
    </div>
  )
}

export default BooksHeader
