import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useEmployees, useCreateEmployee, useUpdateEmployee, useDeleteEmployee } from './useQueries'
import { useToaster } from '../components/Toast/useToaster'

export const useStaff = () => {
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)
  const { showToast } = useToaster()

  // State management
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedStaff, setSelectedStaff] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState({
    isOpen: false,
    staffId: null,
    staffName: ''
  })

  // TanStack Query hooks for CRUD operations
  const { data: staffData, isLoading, refetch } = useEmployees()
  const createStaffMutation = useCreateEmployee()
  const updateStaffMutation = useUpdateEmployee()
  const deleteStaffMutation = useDeleteEmployee()

  // Derived data - format employees list
  const staff = Array.isArray(staffData?.results)
    ? staffData.results
    : Array.isArray(staffData)
      ? staffData
      : []

  /**
   * Filter staff based on selected status and cancellation status
   */
  const getFilteredStaff = useCallback(() => {
    const visibleStaff = staff.filter((s) => !s?.cancelled)

    if (filterStatus === 'all') return visibleStaff
    if (filterStatus === 'active') return visibleStaff.filter((s) => s.active)
    if (filterStatus === 'inactive') return visibleStaff.filter((s) => !s.active)
    return visibleStaff
  }, [staff, filterStatus])

  /**
   * Navigate to staff details page to view/edit staff details
   */
  const handleRowClick = useCallback(
    (employee) => {
      const staffPk = employee?.id_number ?? employee?.employee_id ?? employee?.pk
      if (!staffPk) {
        showToast('Error', 'Staff record is missing an internal id', 'error')
        return
      }
      navigate(`/staff/${staffPk}`)
    },
    [navigate, showToast]
  )

  /**
   * Create a new staff member
   */
  const handleAddStaff = useCallback(
    async (staffData) => {
      try {
        await createStaffMutation.mutateAsync(staffData)
        showToast('Success', 'Staff member added successfully!', 'success')
        await refetch()
        return true
      } catch (error) {
        showToast('Error', error.message || 'Failed to add staff member', 'error')
        throw error
      }
    },
    [createStaffMutation, refetch, showToast]
  )

  /**
   * Update an existing staff member
   */
  const handleEditStaff = useCallback(
    async (staffData) => {
      try {
        if (!selectedStaff) return
        const staffPk = selectedStaff?.id ?? selectedStaff?.employee_id ?? selectedStaff?.pk
        if (!staffPk) {
          showToast('Error', 'Staff record is missing an internal id', 'error')
          return
        }
        await updateStaffMutation.mutateAsync({
          employeeId: staffPk,
          updateData: staffData
        })
        showToast('Success', 'Staff member updated successfully!', 'success')
        setSelectedStaff(null)
        await refetch()
        return true
      } catch (error) {
        showToast('Error', error.message || 'Failed to update staff member', 'error')
        throw error
      }
    },
    [selectedStaff, updateStaffMutation, refetch, showToast]
  )

  /**
   * Delete (soft delete) a staff member
   */
  const handleDeleteStaff = useCallback(async () => {
    try {
      const staffId = deleteConfirm.staffId
      if (!staffId) return

      const cancelledBy = user?.id ?? user?.user_id ?? user?.pk
      const cancelData = {
        cancelledBy,
        cancelledAt: new Date().toISOString()
      }

      await deleteStaffMutation.mutateAsync({ employeeId: staffId, cancelData })

      showToast('Success', 'Staff member deleted successfully!', 'success')
      setDeleteConfirm({ isOpen: false, staffId: null, staffName: '' })
      await refetch()
    } catch (error) {
      showToast('Error', error.message || 'Failed to delete staff member', 'error')
    }
  }, [deleteConfirm.staffId, user, deleteStaffMutation, refetch, showToast])

  /**
   * Handle delete confirmation
   */
  const confirmDeleteStaff = (staffId, staffName) => {
    setDeleteConfirm({
      isOpen: true,
      staffId,
      staffName
    })
  }

  /**
   * Cancel delete operation
   */
  const cancelDelete = () => {
    setDeleteConfirm({ isOpen: false, staffId: null, staffName: '' })
  }

  return {
    staff: getFilteredStaff(),
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
  }
}
