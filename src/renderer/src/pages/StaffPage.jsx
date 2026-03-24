import { useState } from 'react'
import Sidebar from '../components/Sidebar'
import './StudentsPage.css'
import AddStaffBookModal from '../components/AddStaffBookModal'
import EditStaffModal from '../components/EditStaffModal'
import { useStaff } from '../hooks'
import EmployeeHeader from '../components/Employees/EmployeeHeader'
import EmployeeTable from '../components/Employees/EmployeeTable'
import EmployeeConfirmDeleteModal from '../components/Employees/EmployeeConfirmDeleteModal'

const StaffPage = () => {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  // Destructure all needed values from useStaff hook
  const {
    staff,
    isLoading,
    refetch,
    filterStatus,
    setFilterStatus,
    selectedStaff,
    setSelectedStaff,
    deleteConfirm,
    handleRowClick,
    handleAddStaff,
    handleEditStaff,
    handleDeleteStaff,
    confirmDeleteStaff,
    cancelDelete
  } = useStaff()

  const handleAddStaffClick = async (staffData) => {
    try {
      await handleAddStaff(staffData)
      setIsAddModalOpen(false)
    } catch (error) {
      console.error('Error adding staff:', error)
    }
  }

  const handleEditStaffClick = async (staffData) => {
    try {
      await handleEditStaff(staffData)
      setIsEditModalOpen(false)
      setSelectedStaff(null)
    } catch (error) {
      console.error('Error editing staff:', error)
    }
  }

  return (
    <div className="wrapper">
      <Sidebar isCollapsed={isCollapsed} onToggle={() => setIsCollapsed(!isCollapsed)} />
      <main className="main">
        <div className="students-container">
          <EmployeeHeader
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
            setIsAddModalOpen={setIsAddModalOpen}
          />

          <EmployeeTable
            staff={staff}
            isLoading={isLoading}
            handleRowClick={handleRowClick}
            setSelectedStaff={setSelectedStaff}
            setIsEditModalOpen={setIsEditModalOpen}
            confirmDeleteStaff={confirmDeleteStaff}
          />

          <AddStaffBookModal
            isOpen={isAddModalOpen}
            onClose={() => setIsAddModalOpen(false)}
            onSubmit={handleAddStaffClick}
          />

          {selectedStaff && (
            <EditStaffModal
              isOpen={isEditModalOpen}
              onClose={() => {
                setIsEditModalOpen(false)
                setSelectedStaff(null)
              }}
              onSubmit={handleEditStaffClick}
              studentData={selectedStaff}
            />
          )}

          {deleteConfirm.isOpen && (
            <EmployeeConfirmDeleteModal
              deleteConfirm={deleteConfirm}
              cancelDelete={cancelDelete}
              handleDeleteStaff={handleDeleteStaff}
            />
          )}
        </div>
      </main>
    </div>
  )
}

export default StaffPage
