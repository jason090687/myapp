import { useState } from 'react'
import PropTypes from 'prop-types'
import { Search, Plus, FileUp, FileDown, Grid3x3, List, Filter } from 'lucide-react'
import { Button } from '../../ui/button'
import ImportBooks from './ImportBooks'
import './BooksHeader.css'

function BooksHeader({
  onSearch,
  onAddBook,
  token,
  onRefresh,
  onCategoryChange,
  selectedCategory,
  onViewChange,
  viewMode = 'table',
  onExport
}) {
  const [showImport, setShowImport] = useState(false)

  return (
    <div className="top-label">
      <div className="header-buttons">
        {/* <div className="title-container">
          <h1 className="title-header">Library Collection</h1>
          <span className="sub-header">Manage your books effectively</span>
        </div> */}
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

        {/* Categories Filter */}

        <div className="btn-container">
          <div className="sort-container">
            <Filter
              size={16}
              style={{
                position: 'absolute',
                left: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#64748b',
                pointerEvents: 'none',
                zIndex: 1
              }}
            />
            {/* <label htmlFor="category-select">Category:</label> */}
            <select
              id="category-select"
              className="sort-select"
              onChange={(e) => {
                onCategoryChange(e.target.value)
              }}
              value={selectedCategory || ''}
            >
              <option value="">All Categories</option>
              <option value="Fiction">Fiction</option>
              <option value="Non-Fiction">Non-Fiction</option>
              <option value="Science">Science</option>
              <option value="History">History</option>
              <option value="Biography">Biography</option>
              <option value="Reference">Reference</option>
              <option value="Children">Children</option>
              <option value="Education">Education</option>
            </select>
          </div>

          <Button
            variant="primary"
            onClick={onAddBook}
            aria-label="Add new book"
            className="gap-2"
            title="Add New Book"
          >
            <Plus size={18} />
            {/* <span className="btn-text">Add New Book</span> */}
          </Button>
          <Button
            onClick={() => setShowImport(true)}
            aria-label="Import books"
            variant="secondary"
            className="gap-2"
            title="Import Books"
          >
            <FileUp size={18} />
            {/* <span className="btn-text">Import Books</span> */}
          </Button>
          <Button
            onClick={onExport}
            aria-label="Export books to CSV"
            variant="secondary"
            className="gap-2"
            title="Export CSV"
          >
            <FileDown size={18} />
            {/* <span className="btn-text">Export CSV</span> */}
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

BooksHeader.propTypes = {
  onSearch: PropTypes.func.isRequired,
  onAddBook: PropTypes.func.isRequired,
  token: PropTypes.string.isRequired,
  onRefresh: PropTypes.func.isRequired,
  onCategoryChange: PropTypes.func.isRequired,
  selectedCategory: PropTypes.string,
  onViewChange: PropTypes.func.isRequired,
  viewMode: PropTypes.string,
  onExport: PropTypes.func.isRequired
}

export default BooksHeader
