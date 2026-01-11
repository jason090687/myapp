import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { FaGraduationCap, FaBook, FaEdit } from 'react-icons/fa'
import { ArrowLeft } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import { Button } from '../components/ui/button'
import './StudentDetailsPage.css'
import { fetchStudentDetails, updateStudentDetails } from '../Features/api'
import EditStudentModal from '../components/EditStudentModal'
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

const StudentDetailsPage = () => {
  const [student, setStudent] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const { studentId } = useParams()
  const navigate = useNavigate()
  const { token } = useSelector((state) => state.auth)
  const { showToast } = useToaster()

  useEffect(() => {
    const loadStudentDetails = async () => {
      try {
        const data = await fetchStudentDetails(token, studentId)
        setStudent(data)
      } catch (error) {
        console.error('Error loading student details:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadStudentDetails()
  }, [token, studentId])

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
      const data = await updateStudentDetails(token, studentId, updatedData)

      setStudent(data)
      setIsEditModalOpen(false)
      // Show success toast
      window.showToast('Success', 'Student updated successfully!', 'success', 4000)
    } catch (error) {
      console.error('Error updating student:', error)
      window.showToast('Error', error.message || 'Failed to update student', 'error', 4000)
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
            onClick={() => navigate('/students')}
            className="gap-2"
            style={{ marginBottom: '1.5rem' }}
          >
            <ArrowLeft size={18} />
            Back to Students
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
                        <h1>{student?.name}</h1>
                        <button className="edit-button" onClick={handleEditClick}>
                          <FaEdit />
                        </button>
                      </div>
                      <div className="student-identifiers">
                        <p className="student-id">ID Number: {student?.id_number}</p>
                        <p className="student-id">RFID Number: {student?.rfid_number}</p>
                      </div>
                    </div>
                  </div>
                  <div className="student-stats">
                    <div className="stat-item">
                      <span className="stat-label">Year Level</span>
                      <span className="stat-value">{student?.year_level}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Borrowed Books</span>
                      <span className="stat-value">{student?.borrowed_books_count}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Status</span>
                      <span className={`status-badge ${student?.active ? 'active' : 'inactive'}`}>
                        {student?.active ? 'Active' : 'Inactive'}
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
                  {student?.borrowed_books?.length > 0 ? (
                    student.borrowed_books.map((book, index) => (
                      <div
                        key={index}
                        className={`book-card ${
                          !book.paid && book.amount > 0
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

      {student && (
        <EditStudentModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSubmit={handleEditSubmit}
          student={student}
        />
      )}
    </div>
  )
}

export default StudentDetailsPage
