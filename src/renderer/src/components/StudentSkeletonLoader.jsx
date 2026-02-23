import React from 'react'

const StudentSkeletonLoader = () => {
  return (
    <>
      <div className="student-info-card skeleton">
        <div className="student-header">
          <div className="student-icon-skeleton"></div>
          <div className="student-info-skeleton">
            <div className="name-skeleton"></div>
            <div className="id-skeleton"></div>
          </div>
          <div className="student-stats-skeleton">
            {[1, 2, 3].map((i) => (
              <div key={i} className="stat-skeleton">
                <div className="stat-label-skeleton"></div>
                <div className="stat-value-skeleton"></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="borrowed-books-section skeleton">
        <div className="section-header-skeleton"></div>
        <div className="books-grid">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="book-card-skeleton">
              <div className="book-title-skeleton"></div>
              <div className="book-author-skeleton"></div>
              <div className="book-details-skeleton">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="detail-skeleton"></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

export default StudentSkeletonLoader
