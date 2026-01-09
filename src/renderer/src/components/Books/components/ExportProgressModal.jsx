import './ExportProgressModal.css'

const ExportProgressModal = ({ isOpen, progress, currentPage, totalPages, exportedCount }) => {
  if (!isOpen) return null

  return (
    <div className="export-modal-overlay">
      <div className="export-modal-content">
        <div className="export-modal-header">
          <h3>Exporting Books</h3>
          <p className="export-modal-subtitle">Please wait while we prepare your export...</p>
        </div>

        <div className="export-progress-container">
          <div className="export-progress-bar">
            <div className="export-progress-fill" style={{ width: `${progress}%` }}>
              <div className="export-progress-shimmer"></div>
            </div>
          </div>
          <div className="export-progress-text">{Math.round(progress)}%</div>
        </div>

        <div className="export-stats">
          <div className="export-stat-item">
            <span className="export-stat-label">Page</span>
            <span className="export-stat-value">
              {currentPage} / {totalPages || '...'}
            </span>
          </div>
          <div className="export-stat-item">
            <span className="export-stat-label">Books Exported</span>
            <span className="export-stat-value">{exportedCount}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ExportProgressModal
