import { BookCard } from '../ui/book-card'
import { BooksSkeleton } from './DashboardSkeletons'
import './TopBooks.css'

const TopBooks = ({ activeBookFilter, onFilterToggle, loadingStates, topBooks, newBooks }) => {
  return (
    <div className="top-books-container">
      <div className="top-books-header">
        <div>
          <h3 className="top-books-title">Popular & New</h3>
          <p className="top-books-subtitle">Featured library collection</p>
        </div>
      </div>

      <div className="book-filters">
        <button
          className={`book-filter-btn ${activeBookFilter === 'top' ? 'active' : 'inactive'}`}
          onClick={() => onFilterToggle('top')}
        >
          Top Books
        </button>
        <button
          className={`book-filter-btn ${activeBookFilter === 'new' ? 'active' : 'inactive'}`}
          onClick={() => onFilterToggle('new')}
        >
          New Arrivals
        </button>
      </div>

      {loadingStates ? (
        <BooksSkeleton count={3} />
      ) : (
        <div className="books-list">
          {activeBookFilter === 'new' ? (
            newBooks && newBooks.length > 0 ? (
              newBooks.map((book) => (
                <BookCard key={book.id} title={book.title} author={book.author} isNew={true} />
              ))
            ) : (
              <div className="no-books">No new arrivals found</div>
            )
          ) : (
            topBooks.map((book) => (
              <BookCard
                key={book.id}
                title={book.title}
                author={book.author || 'Unknown Author'}
                borrowCount={book.borrow_count}
              />
            ))
          )}
          {(activeBookFilter === 'top' ? topBooks : newBooks).length === 0 && (
            <div className="no-books">No books found</div>
          )}
        </div>
      )}
    </div>
  )
}

export default TopBooks
