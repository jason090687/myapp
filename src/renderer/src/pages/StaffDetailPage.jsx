import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { FaGraduationCap, FaBook, FaEdit } from 'react-icons/fa'
import { ArrowLeft } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import { Button } from '../components/ui/button'
import './styles/StudentDetailsPage.css'
import EditStaffModal from '../components/EditStaffModal'
import { useEmployeeDetails, useUpdateEmployee } from '../hooks'
import { useToaster } from '../components/Toast/useToaster'

const SkeletonLoader = () => (
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

const StaffDetailPage = () => {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const { staffId } = useParams()
  const navigate = useNavigate()
  const { showToast } = useToaster()

  // Fetch staff details using TanStack Query
  const { data: staff, isLoading, refetch } = useEmployeeDetails(staffId)
  const updateEmployeeMutation = useUpdateEmployee()

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const handleEditClick = () => {
    setIsEditModalOpen(true)
  }

  const handleEditSubmit = async (updatedData) => {
    try {
      await updateEmployeeMutation.mutateAsync({
        employeeId: staffId,
        updateData: updatedData
      })
      showToast('Success', 'Staff member updated successfully!', 'success')
      setIsEditModalOpen(false)
      await refetch()
    } catch (error) {
      console.error('Error updating staff:', error)
      showToast('Error', error.message || 'Failed to update staff member', 'error')
      throw error
    }
  }

  return (
    <div className="wrapper">
      <Sidebar isCollapsed={isCollapsed} onToggle={() => setIsCollapsed(!isCollapsed)} />
      <main className="main">
        <div className="student-details-container">
          <Button
            variant="secondary"
            onClick={() => navigate('/staff')}
            className="gap-2"
            style={{ marginBottom: '1.5rem' }}
          >
            <ArrowLeft size={18} />
            Back to Staff
          </Button>

          {isLoading ? (
            <SkeletonLoader />
          ) : (
            <>
              <div className="student-info-card">
                <div className="student-header">
                  <div className="student-header-left">
                    <FaGraduationCap className="student-icon" />
                    <div className="student-main-info">
                      <div className="student-title">
                        <h1>{staff?.name}</h1>
                        <button className="edit-button" onClick={handleEditClick}>
                          <FaEdit />
                        </button>
                      </div>
                      <p className="student-id">Employee ID: {staff?.id_number}</p>
                    </div>
                  </div>
                  <div className="student-stats">
                    <div className="stat-item">
                      <span className="stat-label">Borrowed Books</span>
                      <span className="stat-value">{staff?.borrowed_books_count}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Status</span>
                      <span className={`status-badge ${staff?.active ? 'active' : 'inactive'}`}>
                        {staff?.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="borrowed-books-section">
                <h2>
                  <FaBook /> Book Records
                </h2>
                <div className="books-grid">
                  {staff?.borrowed_books?.length > 0 ? (
                    staff.borrowed_books.map((book, index) => (
                      <div
                        key={index}
                        className={`book-card ${!book.paid && book.amount > 0
                            ? 'unpaid-book'
                            : book.status?.toLowerCase() === 'borrowed'
                              ? 'borrowed-book'
                              : book.status?.toLowerCase() === 'returned'
                                ? 'returned-book'
                                : ''
                          }`}
                      >
                        <div className="book-content">
                          <h3 className="book-title">{book.title}</h3>
                          <p className="book-author">{book.author || 'No author specified'}</p>
                          <div className="book-details">
                            <div className="detail-group">
                              <div className="detail-item">
                                <span className="detail-label">Borrowed:</span>
                                <span className="detail-value">{formatDate(book.borrow_date)}</span>
                              </div>
                              <div className="detail-item">
                                <span className="detail-label">Due Date:</span>
                                <span className="detail-value">{formatDate(book.due_date)}</span>
                              </div>
                              {book.return_date && (
                                <div className="detail-item">
                                  <span className="detail-label">Return Date:</span>
                                  <span className="detail-value">
                                    {formatDate(book.return_date)}
                                  </span>
                                </div>
                              )}
                            </div>

                            <div className="detail-group payment-details">
                              <div className="detail-item">
                                <span className="detail-label">Status:</span>
                                <span className={`detail-status ${book.status?.toLowerCase()}`}>
                                  {book.status}
                                </span>
                              </div>
                              <div className="detail-item">
                                <span className="detail-label">Amount:</span>
                                <span className="detail-value amount">
                                  ₱{book.amount ? book.amount.toFixed(2) : '0.00'}
                                </span>
                              </div>
                              <div className="detail-item">
                                <span className="detail-label">Payment:</span>
                                <span className={`detail-payment ${book.paid ? 'paid' : 'unpaid'}`}>
                                  {book.paid ? 'Paid' : 'Unpaid'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="no-books-message">
                      <FaBook size={48} color="#CBD5E1" />
                      <h3>No Books Borrowed</h3>
                      <p>This student hasn't borrowed any books yet.</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      <EditStaffModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        studentData={staff}
        onSubmit={handleEditSubmit}
      />
    </div>
  )
}

export default StaffDetailPage
