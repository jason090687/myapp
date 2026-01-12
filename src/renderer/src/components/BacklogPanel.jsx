import { useState, useMemo, useEffect } from 'react'
import {
  Trash2,
  X,
  BookOpen,
  Users,
  AlertCircle,
  Bell,
  Check,
  XCircle,
  Eye,
  Mail
} from 'lucide-react'
import { useActivity } from '../context/ActivityContext'
import RequestBorrowModal from './RequestBorrowModal'
import {
  approveBorrowRequest,
  rejectBorrowRequest,
  markRequestAsRead,
  fetchBorrowRequests,
  fetchUserDetails
} from '../Features/api'
import { useSelector } from 'react-redux'
import { useToaster } from './Toast/useToaster'
import './BacklogPanel.css'

function BacklogPanel({ isOpen, onClose, onRequestUpdate }) {
  const { activities, clearActivities } = useActivity()
  const [filterType, setFilterType] = useState('all')
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [borrowRequests, setBorrowRequests] = useState([])
  const [requestsCleared, setRequestsCleared] = useState(false)
  const [userData, setUserData] = useState(null)
  const { token } = useSelector((state) => state.auth)
  const { showToast } = useToaster()

  const keepPendingOnly = (results) =>
    (results || []).filter((request) => request.status === 'pending')

  useEffect(() => {
    if (!isOpen) {
      setRequestsCleared(false)
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen || !token || requestsCleared) return

    const fetchRequests = async () => {
      try {
        const response = await fetchBorrowRequests(token, 'pending')
        setBorrowRequests(keepPendingOnly(response.results))
      } catch (error) {
        console.error('Error fetching borrow requests:', error)
      }
    }

    fetchRequests()
    const interval = setInterval(fetchRequests, 30000)
    return () => clearInterval(interval)
  }, [isOpen, token, requestsCleared])

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const response = await fetchUserDetails(token)
        setUserData(response)
      } catch (error) {
        console.error('Error fetching user details:', error)
      }
    }
    loadUserData()
  }, [token])

  const handleClearAll = () => {
    clearActivities()
    setBorrowRequests([])
    setRequestsCleared(true)
    setIsRequestModalOpen(false)
    setSelectedRequest(null)
    showToast('Success', 'Notifications cleared', 'success')
    if (onRequestUpdate) onRequestUpdate()
  }

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
      case 'borrow_request':
        return 'request'
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
      case 'borrow_request':
        return 'request'
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
      overdue: '⏰ Overdue Book',
      borrow_request: '�️ Mark as Read'
    }
    return labels[type] || type
  }

  const allActivities = useMemo(() => {
    const requestActivities = borrowRequests.map((request) => ({
      id: `request-${request.id}`,
      type: 'borrow_request',
      timestamp: new Date(request.created_at || Date.now()),
      description: `Borrow request for "${request.book_title || 'Unknown Book'}"`,
      data: {
        id: request.id,
        bookId: request.book,
        bookTitle: request.book_title,
        student: request.student,
        studentId: request.student,
        studentName: request.student_name,
        requestDate: request.request_date,
        notes: request.notes,
        responseNotes: request.response_notes,
        responseAt: request.response_at,
        responseBy: request.response_by === userData?.id,
        isRead: request.is_read === true,
        status: request.status == 'approved' ? 'approved' : 'pending'
      }
    }))

    return [...requestActivities, ...activities].sort(
      (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
    )
  }, [borrowRequests, activities, userData])

  const filteredActivities = useMemo(() => {
    if (filterType === 'all') return allActivities
    return allActivities.filter((activity) => activity.type === filterType)
  }, [allActivities, filterType])

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

  // const handleActivityClick = (activity) => {
  //   if (activity.type === 'borrow_request' && activity.data) {
  //     setSelectedRequest(activity.data)
  //     onClose()

  //     setTimeout(() => {
  //       setIsRequestModalOpen(true)
  //     }, 150)
  //   }
  // }

  const handleMarkAsRead = async (requestId, e) => {
    e.stopPropagation()
    try {
      await markRequestAsRead(token, requestId)

      setBorrowRequests((prevRequests) =>
        prevRequests.map((request) =>
          request.id === requestId ? { ...request, is_read: true } : request
        )
      )

      showToast('Success', 'Request marked as read', 'info')
      if (onRequestUpdate) onRequestUpdate()
    } catch (error) {
      console.error('Error marking request as read:', error)
      showToast('Error', 'Failed to mark request as read', 'error')
    }
  }

  const handleApproveRequest = async (approvalData) => {
    try {
      await approveBorrowRequest(token, approvalData.id, approvalData)

      setBorrowRequests((prevRequests) =>
        prevRequests.filter((request) => request.id !== approvalData.id)
      )

      showToast('Success', 'Borrow request approved successfully!', 'success')
      setIsRequestModalOpen(false)
      setSelectedRequest(null)
      if (onRequestUpdate) onRequestUpdate()
    } catch (error) {
      console.error('Error approving request:', error)
      showToast('Error', 'Failed to approve request', 'error')
      throw error
    }
  }

  const handleRejectRequest = async (requestId, e) => {
    e.stopPropagation()
    try {
      await rejectBorrowRequest(token, requestId, { response_notes: 'Request rejected' })

      setBorrowRequests((prevRequests) =>
        prevRequests.filter((request) => request.id !== requestId)
      )

      showToast('Success', 'Borrow request rejected', 'info')
      if (onRequestUpdate) onRequestUpdate()
    } catch (error) {
      console.error('Error rejecting request:', error)
      showToast('Error', 'Failed to reject request', 'error')
    }
  }

  const handleQuickApprove = async (activity, e) => {
    e.stopPropagation()
    setSelectedRequest(activity.data)
    onClose()

    setTimeout(() => {
      setIsRequestModalOpen(true)
    }, 150)
  }

  const handleRequestUpdate = (requestId, updates) => {
    setBorrowRequests((prevRequests) =>
      prevRequests.map((request) =>
        request.id === requestId ? { ...request, ...updates } : request
      )
    )

    if (updates.status === 'rejected' || updates.status === 'approved') {
      setBorrowRequests((prevRequests) =>
        prevRequests.filter((request) => request.id !== requestId)
      )
    }
  }

  return (
    <>
      <div
        className={`backlog-overlay ${isOpen ? 'open' : ''}`}
        onClick={onClose}
        aria-hidden={!isOpen}
      />
      <div className={`backlog-panel ${isOpen ? 'open' : ''}`}>
        <div className="backlog-header">
          <h2>Activity Log</h2>
          <div className="header-actions">
            {(activities.length > 0 || borrowRequests.length > 0) && (
              <button className="clear-btn" onClick={handleClearAll} title="Clear all activities">
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
            <span className="stat-value">{allActivities.length}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Requests</span>
            <span className="stat-value">{borrowRequests.length}</span>
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
          <button
            className={`filter-btn ${filterType === 'borrow_request' ? 'active' : ''}`}
            onClick={() => setFilterType('borrow_request')}
          >
            Request
          </button>
        </div>

        {/* Activities List */}
        <div className="activities-section">
          {filteredActivities.length > 0 ? (
            filteredActivities.map((activity) => (
              <div
                key={activity.id}
                className={`activity-item ${activity.type} ${activity.type === 'borrow_request' && activity.data?.isRead === false ? 'unread' : ''}`}
              >
                <div className="activity-icon-wrapper">
                  <div className={`activity-icon ${getActivityColor(activity.type)}`}>
                    {getActivityIcon(activity.type) === 'book' && <BookOpen size={16} />}
                    {getActivityIcon(activity.type) === 'users' && <Users size={16} />}
                    {getActivityIcon(activity.type) === 'alert' && <AlertCircle size={16} />}
                    {getActivityIcon(activity.type) === 'request' && <Bell size={16} />}
                  </div>
                </div>
                <div className="activity-content">
                  <div className="activity-title">
                    {getActivityLabel(activity.type)}
                    {activity.type === 'borrow_request' && activity.data?.isRead === false && (
                      <span className="unread-badge">New</span>
                    )}
                  </div>
                  <div className="activity-description">{activity.description}</div>
                  <div className="activity-time">{formatTime(activity.timestamp)}</div>
                </div>
                {activity.type === 'borrow_request' && (
                  <div className="activity-actions">
                    {!activity.data?.isRead && !activity.data?.is_read ? (
                      <button
                        className="action-btn mark-read-btn"
                        onClick={(e) => handleMarkAsRead(activity.data.id, e)}
                        title="Mark as read"
                      >
                        <Mail size={14} />
                      </button>
                    ) : (
                      <>
                        <button
                          className="action-btn approve-btn"
                          onClick={(e) => handleQuickApprove(activity, e)}
                          title="Approve request"
                        >
                          <Check size={14} />
                        </button>
                        <button
                          className="action-btn reject-btn"
                          onClick={(e) => handleRejectRequest(activity.data.id, e)}
                          title="Reject request"
                        >
                          <XCircle size={14} />
                        </button>
                      </>
                    )}
                  </div>
                )}
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
      <RequestBorrowModal
        isOpen={isRequestModalOpen}
        onClose={() => {
          setIsRequestModalOpen(false)
          setSelectedRequest(null)
        }}
        onApprove={handleApproveRequest}
        onRequestUpdate={handleRequestUpdate}
        borrowRequest={selectedRequest}
      />
    </>
  )
}

export default BacklogPanel
