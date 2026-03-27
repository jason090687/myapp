import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  useEmployees,
  useCreateEmployee,
  useUpdateEmployee,
  useDeleteEmployee,
  useUserDetails
} from './useQueries'
import { useToaster } from '../components/Toast/useToaster'

export const useStaff = (searchTerm = '', currentPage = '') => {
  const navigate = useNavigate()
  const { showToast } = useToaster()

  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedStaff, setSelectedStaff] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState({
    isOpen: false,
    staffId: null,
    staffName: ''
  })

  const { data: staffData, isLoading, refetch } = useEmployees(searchTerm, currentPage)
  const { data: user } = useUserDetails()


  const createStaffMutation = useCreateEmployee()
  const updateStaffMutation = useUpdateEmployee()
  const deleteStaffMutation = useDeleteEmployee()

  // Normalize data
  const staff = Array.isArray(staffData?.results)
    ? staffData.results
    : Array.isArray(staffData)
      ? staffData
      : []

  const totalPages = Math.ceil((staffData?.count || 0) / 10)

  // Filter staff
  const getFilteredStaff = useCallback(() => {
    const visible = staff.filter((s) => !s?.cancelled)

    if (filterStatus === 'all') return visible
    if (filterStatus === 'active') return visible.filter((s) => s.active)
    if (filterStatus === 'inactive') return visible.filter((s) => !s.active)

    return visible
  }, [staff, filterStatus])

  // Navigate to detail
  const handleRowClick = useCallback(
    (employee) => {
      const staffPk = employee?.id

      if (!staffPk) {
        showToast('Error', 'Missing employee ID', 'error')
        return
      }

      navigate(`/staff/${staffPk}`)
    },
    [navigate, showToast]
  )

  // Create
  const handleAddStaff = useCallback(
    async (staffData) => {
      try {
        await createStaffMutation.mutateAsync(staffData)
        showToast('Success', 'Staff added successfully!', 'success')
        await refetch()
        return true
      } catch (error) {
        showToast('Error', error.message || 'Create failed', 'error')
        throw error
      }
    },
    [createStaffMutation, refetch, showToast]
  )

  // Update
  const handleEditStaff = useCallback(
    async (staffData) => {
      try {
        if (!selectedStaff?.id) return

        await updateStaffMutation.mutateAsync({
          employeeId: selectedStaff.id,
          updateData: staffData,
          userId: user?.id
        })

        showToast('Success', 'Staff updated successfully!', 'success')
        setSelectedStaff(null)
        await refetch()
        return true
      } catch (error) {
        showToast('Error', error.message || 'Update failed', 'error')
        throw error
      }
    },
    [selectedStaff, updateStaffMutation, user, refetch, showToast]
  )

  // Delete (soft delete)
  const handleDeleteStaff = useCallback(async () => {
    try {
      if (!deleteConfirm.staffId) return

      await deleteStaffMutation.mutateAsync({
        employeeId: deleteConfirm.staffId,
        userId: user?.id

      })

      showToast('Success', 'Staff deleted successfully!', 'success')

      setDeleteConfirm({
        isOpen: false,
        staffId: null,
        staffName: ''
      })

      await refetch()
    } catch (error) {
      showToast('Error', error.message || 'Delete failed', 'error')
    }
  }, [deleteConfirm, user, deleteStaffMutation, refetch, showToast])

  const confirmDeleteStaff = (staffId, staffName) => {
    setDeleteConfirm({
      isOpen: true,
      staffId,
      staffName
    })
  }

  const cancelDelete = () => {
    setDeleteConfirm({
      isOpen: false,
      staffId: null,
      staffName: ''
    })
  }

  return {
    staff: getFilteredStaff(),
    isLoading,
    refetch,
    totalPages,
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