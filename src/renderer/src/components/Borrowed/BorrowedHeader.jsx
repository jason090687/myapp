import { Search, X, Filter, RefreshCw, Plus } from 'lucide-react'
import { Button } from '../ui/button'
import '../../pages/Borrowed.css'

const BorrowedHeader = ({
  searchTerm,
  handleSearch,
  setSearchTerm,
  filterStatus,
  setFilterStatus,
  fetchBorrowedData,
  pagination,
  handleBorrowBook
}) => {
  return (
    <div className="borrowed-header">
      {/* Search */}
      <div className="search-bar">
        <Search className="search-icon" size={18} />

        <input
          type="text"
          placeholder="Search students, books, dates..."
          value={searchTerm}
          onChange={handleSearch}
          className="search-input"
          aria-label="Search borrowed books"
        />

        {searchTerm && (
          <X
            size={16}
            className="search-clear"
            onClick={() => setSearchTerm('')}
            style={{
              position: 'absolute',
              right: '1rem',
              top: '50%',
              transform: 'translateY(-50%)',
              cursor: 'pointer',
              color: '#94a3b8'
            }}
          />
        )}
      </div>

      {/* Right Controls */}
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        {/* Filter */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Filter
            size={16}
            style={{
              position: 'absolute',
              left: '0.75rem',
              color: '#64748b',
              pointerEvents: 'none',
              zIndex: 1
            }}
          />

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
            style={{
              padding: '0.5rem 2.5rem 0.5rem 2.25rem',
              borderRadius: '0.5rem',
              border: '1px solid #e2e8f0',
              backgroundColor: 'white',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: '#334155',
              outline: 'none',
              transition: 'all 0.2s',
              appearance: 'none',
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2364748b' d='M6 9L1 4h10z'/%3E%3C/svg%3E\")",
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 0.75rem center'
            }}
            onMouseEnter={(e) => (e.target.style.borderColor = '#cbd5e1')}
            onMouseLeave={(e) => (e.target.style.borderColor = '#e2e8f0')}
            onFocus={(e) => {
              e.target.style.borderColor = '#3b82f6'
              e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#e2e8f0'
              e.target.style.boxShadow = 'none'
            }}
          >
            <option value="all">All Status</option>
            <option value="borrowed">Borrowed</option>
            <option value="overdue">Overdue</option>
            <option value="returned">Returned</option>
          </select>
        </div>

        {/* Refresh */}
        <Button
          variant="secondary"
          onClick={() => fetchBorrowedData(pagination.currentPage)}
          className="gap-2"
          title="Refresh"
          aria-label="Refresh data"
        >
          <RefreshCw size={18} />
        </Button>

        {/* Borrow */}
        <Button
          variant="primary"
          onClick={handleBorrowBook}
          className="gap-2"
          title="Borrow Book"
          aria-label="Borrow book"
        >
          <Plus size={18} />
          Borrow New Book
        </Button>
      </div>
    </div>
  )
}

export default BorrowedHeader
