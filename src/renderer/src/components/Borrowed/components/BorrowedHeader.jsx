import { FaSearch, FaPlus } from 'react-icons/fa'

const BorrowedHeader = ({ searchTerm, onSearchChange, onBorrowClick }) => (
  <div className="borrowed-header">
    <div className="search-bar">
      <FaSearch className="search-icon" />
      <input
        type="text"
        placeholder="Search by student or book..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="search-input"
      />
    </div>
    <button className="borrow-book-btn" onClick={onBorrowClick}>
      <FaPlus /> Borrow Book
    </button>
  </div>
)

export default BorrowedHeader
