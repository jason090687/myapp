import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { FaGraduationCap, FaBook, FaEdit } from 'react-icons/fa'
import { ArrowLeft } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import { Button } from '../components/ui/button'
import './styles/StudentDetailsPage.css'
import { useStudentDetails, useUpdateStudent } from '../hooks'
import EditStudentModal from '../components/Student/EditStudentModal'
import { useToaster } from '../components/Toast/useToaster'
import StudentSkeletonLoader from '../components/StudentSkeletonLoader'

const StudentDetailsPage = () => {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const { studentId } = useParams()
  const navigate = useNavigate()
  const { showToast } = useToaster()

  const { data: student, isLoading, refetch } = useStudentDetails(studentId)
  const updateStudentMutation = useUpdateStudent()

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
      await updateStudentMutation.mutateAsync({ studentId, updateData: updatedData })
      setIsEditModalOpen(false)
      showToast('Success', 'Student updated successfully!', 'success', 4000)
      refetch()
    } catch (error) {
      console.error('Error updating student:', error)
      showToast('Error', error.message || 'Failed to update student', 'error', 4000)
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
            <StudentSkeletonLoader />
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
