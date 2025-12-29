import React from 'react'
import './DashboardSkeletons.css'

export const CardsSkeleton = () => (
  <div className="cards-skeleton-grid">
    {Array(7)
      .fill(null)
      .map((_, index) => (
        <div key={index} className="skeleton-card">
          <div className="skeleton-card-icon" />
          <div className="skeleton-card-content">
            <div className="skeleton-card-title" />
            <div className="skeleton-card-value" />
          </div>
        </div>
      ))}
  </div>
)

export const ChartSkeleton = () => (
  <div className="chart-skeleton">
    <div className="chart-skeleton-header" />
    <div className="chart-skeleton-body" />
  </div>
)

export const TableSkeleton = ({ rows = 5, columns = 5 }) => (
  <div className="table-skeleton">
    <div className="table-skeleton-header">
      {Array(columns)
        .fill(null)
        .map((_, i) => (
          <div key={i} className="table-skeleton-cell" style={{ flex: 1 }} />
        ))}
    </div>
    {Array(rows)
      .fill(null)
      .map((_, i) => (
        <div key={i} className="table-skeleton-row" style={{ '--row-index': i }}>
          {Array(columns)
            .fill(null)
            .map((_, j) => (
              <div key={j} className="table-skeleton-cell" style={{ flex: 1 }} />
            ))}
        </div>
      ))}
  </div>
)

export const BooksSkeleton = ({ count = 3 }) => (
  <div className="books-skeleton">
    {Array(count)
      .fill(null)
      .map((_, index) => (
        <div key={index} className="book-skeleton-card">
          <div className="book-skeleton-title" />
          <div className="book-skeleton-author" />
          <div className="book-skeleton-status" />
        </div>
      ))}
  </div>
)

export const TopBorrowersSkeleton = () => (
  <div className="top-borrowers-skeleton">
    <div className="top-borrowers-header">
      <div className="top-borrowers-title"></div>
    </div>
    {Array(5)
      .fill(null)
      .map((_, index) => (
        <div key={index} className="table-skeleton-row" style={{ '--row-index': index }}>
          <div className="table-skeleton-cell" style={{ flex: 2 }}></div>
          <div className="table-skeleton-cell" style={{ flex: 1 }}></div>
        </div>
      ))}
  </div>
)

export const RecentCheckoutsSkeleton = () => (
  <div className="recent-checkouts-skeleton">
    <div className="checkouts-header">
      <div className="checkout-title"></div>
      <div className="view-all-link"></div>
    </div>
    <TableSkeleton rows={5} columns={5} />
  </div>
)

export const TopBooksSkeleton = () => (
  <div className="top-books-skeleton">
    <div className="books-filter-buttons">
      <div className="filter-button"></div>
      <div className="filter-button"></div>
    </div>
    {/* Book cards or no books message */}
    <div className="books-grid">
      {Array(3)
        .fill(null)
        .map((_, index) => (
          <div key={index} className="book-card" style={{ '--card-index': index }}>
            <div className="book-skeleton-title"></div>
            <div className="book-skeleton-author"></div>
            <div className="book-skeleton-status"></div>
          </div>
        ))}
    </div>
  </div>
)

export const NoBooksSkeleton = () => (
  <div className="no-books-skeleton">
    <div className="no-books-message"></div>
  </div>
)
