import React from 'react'
import './SkeletonLoader.css'

export const CardSkeleton = () => (
  <div className="skeleton-card">
    <div className="skeleton-icon"></div>
    <div className="skeleton-content">
      <div className="skeleton-title"></div>
      <div className="skeleton-value"></div>
    </div>
  </div>
)

export const ChartSkeleton = () => (
  <div className="skeleton-chart wave-loading">
    <div className="skeleton-chart-header">
      <div className="skeleton-cell" style={{ width: '200px' }}></div>
      <div className="skeleton-cell" style={{ width: '100px' }}></div>
    </div>
    <div className="skeleton-chart-body"></div>
  </div>
)

export const TableSkeleton = ({ rows = 5 }) => (
  <div className="skeleton-table">
    <div className="skeleton-row header">
      {Array(5)
        .fill(null)
        .map((_, i) => (
          <div key={i} className="skeleton-cell"></div>
        ))}
    </div>
    {Array(rows)
      .fill(null)
      .map((_, i) => (
        <div key={i} className="skeleton-row wave-loading">
          {Array(5)
            .fill(null)
            .map((_, j) => (
              <div key={j} className="skeleton-cell"></div>
            ))}
        </div>
      ))}
  </div>
)

export const BookCardSkeleton = () => (
  <div className="skeleton-book">
    <div className="skeleton-book-title"></div>
    <div className="skeleton-book-author"></div>
    <div className="skeleton-book-status"></div>
  </div>
)

export const ProfileHeaderSkeleton = () => (
  <div className="profile-header skeleton-loading">
    <div className="profile-avatar-skeleton"></div>
    <div className="profile-title-skeleton"></div>
    <div className="profile-role-skeleton"></div>
  </div>
)

export const ProfileInfoSkeleton = () => (
  <div className="profile-section skeleton-loading">
    <div className="section-header-skeleton">
      <div className="title-skeleton"></div>
      <div className="button-skeleton"></div>
    </div>
    <div className="info-grid-skeleton">
      {[1, 2, 3].map((i) => (
        <div key={i} className="info-item-skeleton">
          <div className="icon-skeleton"></div>
          <div className="content-skeleton">
            <div className="label-skeleton"></div>
            <div className="value-skeleton"></div>
          </div>
        </div>
      ))}
    </div>
  </div>
)

export const SecuritySkeleton = () => (
  <div className="profile-section skeleton-loading">
    <div className="section-header-skeleton">
      <div className="title-skeleton"></div>
    </div>
    <div className="security-options-skeleton">
      <div className="security-button-skeleton"></div>
    </div>
  </div>
)
