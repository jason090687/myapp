import './BookGridSkeleton.css'

const BookGridSkeleton = ({ count = 4 }) => {
  return (
    <div className="book-grid-container">
      <div className="grid-skeleton-loading">
        {[...Array(count)].map((_, index) => (
          <div key={index} className="skeleton-card">
            <div className="skeleton-cover"></div>
            <div className="skeleton-content">
              <div className="skeleton-title"></div>
              <div className="skeleton-author"></div>
              <div className="skeleton-info"></div>
              <div className="skeleton-info short"></div>
            </div>
            <div className="skeleton-actions">
              <div className="skeleton-button"></div>
              <div className="skeleton-button"></div>
              <div className="skeleton-button"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default BookGridSkeleton
