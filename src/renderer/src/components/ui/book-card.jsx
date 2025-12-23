import './book-card.css'

const BookCard = ({ title, author, borrowCount = null, isNew = false }) => {
  return (
    <div className={`book-card ${isNew ? 'new-book' : ''}`}>
      {isNew && <span className="new-badge">NEW</span>}
      <h4>{title}</h4>
      <p className="book-author">{author}</p>
      {borrowCount !== null && (
        <div className="borrow-count">
          <span>{borrowCount} Borrows</span>
        </div>
      )}
    </div>
  )
}

export { BookCard }
