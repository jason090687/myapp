import { useState, useMemo } from 'react'
import { Trash2, X, BookOpen, Users, AlertCircle } from 'lucide-react'
import { useActivity } from '../context/ActivityContext'
import './BacklogPanel.css'

function BacklogPanel({ isOpen, onClose }) {
  const { activities, clearActivities } = useActivity()
  const [filterType, setFilterType] = useState('all')

  const getActivityIcon = (type) => {
    switch (type) {
      case 'book_added':
      case 'book_updated':
      case 'book_deleted':
      case 'book_borrowed':
        return 'book'
      case 'student_added':
      case 'staff_added':
        return 'users'
      case 'overdue':
        return 'alert'
      default:
        return 'book'
    }
  }

  const getActivityColor = (type) => {
    switch (type) {
      case 'book_added':
        return 'success'
      case 'book_updated':
        return 'info'
      case 'book_deleted':
        return 'danger'
      case 'book_borrowed':
        return 'primary'
      case 'student_added':
      case 'staff_added':
        return 'success'
      case 'overdue':
        return 'warning'
      default:
        return 'default'
    }
  }

  const getActivityLabel = (type) => {
    const labels = {
      book_added: '📚 Book Added',
      book_updated: '✏️ Book Updated',
      book_deleted: '🗑️ Book Deleted',
      book_borrowed: '📤 Book Borrowed',
      student_added: '👨‍🎓 Student Added',
      staff_added: '👨‍💼 Staff Added',
      overdue: '⏰ Overdue Book'
    }
    return labels[type] || type
  }

  const filteredActivities = useMemo(() => {
    if (filterType === 'all') return activities
    return activities.filter((activity) => activity.type === filterType)
  }, [activities, filterType])

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now - date

    // Less than a minute
    if (diff < 60000) return 'Just now'

    // Less than an hour
    if (diff < 3600000) {
      const minutes = Math.floor(diff / 60000)
      return `${minutes}m ago`
    }

    // Less than a day
    if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000)
      return `${hours}h ago`
    }

    // Format as date
    return date.toLocaleDateString()
  }

  return (
    <div className={`backlog-panel ${isOpen ? 'open' : ''}`}>
      <div className="backlog-header">
        <h2>Activity Log</h2>
        <div className="header-actions">
          {activities.length > 0 && (
            <button className="clear-btn" onClick={clearActivities} title="Clear all activities">
              <Trash2 size={16} />
            </button>
          )}
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="backlog-quick-stats">
        <div className="stat">
          <span className="stat-label">Total</span>
          <span className="stat-value">{activities.length}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Today</span>
          <span className="stat-value">
            {
              activities.filter((a) => {
                const date = new Date(a.timestamp)
                const today = new Date()
                return date.toLocaleDateString() === today.toLocaleDateString()
              }).length
            }
          </span>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="activity-filters">
        <button
          className={`filter-btn ${filterType === 'all' ? 'active' : ''}`}
          onClick={() => setFilterType('all')}
        >
          All
        </button>
        <button
          className={`filter-btn ${filterType === 'book_added' ? 'active' : ''}`}
          onClick={() => setFilterType('book_added')}
        >
          Books
        </button>
        <button
          className={`filter-btn ${filterType === 'student_added' ? 'active' : ''}`}
          onClick={() => setFilterType('student_added')}
        >
          Users
        </button>
      </div>

      {/* Activities List */}
      <div className="activities-section">
        {filteredActivities.length > 0 ? (
          filteredActivities.map((activity) => (
            <div key={activity.id} className={`activity-item ${activity.type}`}>
              <div className="activity-icon-wrapper">
                <div className={`activity-icon ${getActivityColor(activity.type)}`}>
                  {getActivityIcon(activity.type) === 'book' && <BookOpen size={16} />}
                  {getActivityIcon(activity.type) === 'users' && <Users size={16} />}
                  {getActivityIcon(activity.type) === 'alert' && <AlertCircle size={16} />}
                </div>
              </div>
              <div className="activity-content">
                <div className="activity-title">{getActivityLabel(activity.type)}</div>
                <div className="activity-description">{activity.description}</div>
                <div className="activity-time">{formatTime(activity.timestamp)}</div>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-message">
            {filterType === 'all'
              ? 'No activities yet'
              : `No ${filterType.split('_')[0]} activities`}
          </div>
        )}
      </div>
    </div>
  )
}

export default BacklogPanel
