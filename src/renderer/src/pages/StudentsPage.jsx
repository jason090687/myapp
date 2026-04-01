import { useState } from 'react'
import { useToaster } from '../components/Toast/useToaster'
import Sidebar from '../components/Sidebar'
import AddStudentModal from '../components/Student/AddStudentModal'
import EditStudentModal from '../components/Student/EditStudentModal'
import ImportStudents from '../components/ImportStudents'
import StudentHeader from '../components/Student/StudentHeader'
import StudentTable from '../components/Student/StudentTable'
import './styles/StudentsPage.css'
import { useStudent } from '../hooks'
import StudentConfirmDeleteModal from '../components/Student/StudentConfirmDeleteModal'

const StudentsPage = () => {
  const { showToast } = useToaster()
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)

  // Use custom student management hook
  const {
    filterStatus,
    setFilterStatus,
    selectedStudent,
    setSelectedStudent,
    deleteConfirm,
    setDeleteConfirm,
    totalPages,
    isLoading,
    getFilteredStudents,
    handleRowClick,
    handleAddStudent,
    handleEditStudent,
    handleDeleteStudent,
    handleExportToCSV,
    handleRefreshStudents
  } = useStudent(searchTerm, currentPage)

  return (
    <div className="wrapper">
      <Sidebar isCollapsed={isCollapsed} onToggle={() => setIsCollapsed(!isCollapsed)} />
      <main className="main">
        <div className="students-container">
          <StudentHeader
            searchTerm={searchTerm}
            onSearchChange={(e) => setSearchTerm(e.target.value)}
            filterStatus={filterStatus}
            onFilterChange={setFilterStatus}
            onExport={handleExportToCSV}
            onImport={() => setShowImportModal(true)}
            onAdd={() => setIsAddModalOpen(true)}
          />

          <StudentTable
            students={getFilteredStudents()}
            isLoading={isLoading}
            currentPage={currentPage}
            totalPages={totalPages}
            onRowClick={handleRowClick}
            onEdit={(student) => {
              setSelectedStudent(student)
              setIsEditModalOpen(true)
            }}
            onDelete={setDeleteConfirm}
            onPageChange={setCurrentPage}
            showToast={showToast}
          />

          <AddStudentModal
            isOpen={isAddModalOpen}
            onClose={() => setIsAddModalOpen(false)}
            onSubmit={handleAddStudent}
          />

          {selectedStudent && (
            <EditStudentModal
              isOpen={isEditModalOpen}
              onClose={() => {
                setIsEditModalOpen(false)
                setSelectedStudent(null)
              }}
              onSubmit={handleEditStudent}
              student={selectedStudent}
            />
          )}

          {deleteConfirm.isOpen && (
            <StudentConfirmDeleteModal
              deleteConfirm={deleteConfirm}
              setDeleteConfirm={setDeleteConfirm}
              handleDeleteStudent={handleDeleteStudent}
            />
          )}

          {/* Import Modal */}
          {showImportModal && (
            <ImportStudents
              onClose={() => setShowImportModal(false)}
              onRefresh={handleRefreshStudents}
            />
          )}
        </div>
      </main>
    </div>
  )
}

export default StudentsPage
