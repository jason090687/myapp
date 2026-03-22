import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import {
  useSearchStudents,
  useCreateStudent,
  useUpdateStudent,
  useDeleteStudent
} from './useQueries'
import { useToaster } from '../components/Toast/useToaster'

export const useStudent = (searchTerm = '', currentPage = 1) => {
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)
  const { showToast } = useToaster()

  // State management
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState({
    isOpen: false,
    studentId: null,
    studentName: ''
  })

  // TanStack Query hooks for CRUD operations
  const { data: studentsData, isLoading, refetch } = useSearchStudents(searchTerm, currentPage)
  const createStudentMutation = useCreateStudent()
  const updateStudentMutation = useUpdateStudent()
  const deleteStudentMutation = useDeleteStudent()

  // Derived data
  const students = studentsData?.results || []
  const totalPages = Math.ceil((studentsData?.count || 0) / 10)

  /**
   * Filter students based on selected status and cancellation status
   */
  const getFilteredStudents = useCallback(() => {
    const visibleStudents = students.filter((s) => !s?.cancelled)

    if (filterStatus === 'all') return visibleStudents
    if (filterStatus === 'active') return visibleStudents.filter((s) => s.active)
    if (filterStatus === 'inactive') return visibleStudents.filter((s) => !s.active)
    return visibleStudents
  }, [students, filterStatus])

  /**
   * Navigate to student details page
   */
  const handleRowClick = useCallback(
    (student) => {
      const studentPk = student?.id ?? student?.student_id ?? student?.pk
      if (!studentPk) {
        showToast('Error', 'Student record is missing an internal id', 'error')
        return
      }
      navigate(`/students/${studentPk}`)
    },
    [navigate, showToast]
  )

  /**
   * Create a new student
   */
  const handleAddStudent = useCallback(
    async (studentData) => {
      try {
        await createStudentMutation.mutateAsync(studentData)
        showToast('Success', 'Student added successfully!', 'success')
        refetch()
        return true
      } catch (error) {
        showToast('Error', error.message || 'Failed to add student', 'error')
        throw error
      }
    },
    [createStudentMutation, refetch, showToast]
  )

  /**
   * Update an existing student
   */
  const handleEditStudent = useCallback(
    async (studentData) => {
      try {
        if (!selectedStudent) return
        const studentPk = selectedStudent?.id ?? selectedStudent?.student_id ?? selectedStudent?.pk
        if (!studentPk) {
          showToast('Error', 'Student record is missing an internal id', 'error')
          return
        }
        await updateStudentMutation.mutateAsync({
          studentId: studentPk,
          updateData: studentData
        })
        showToast('Success', 'Student updated successfully!', 'success')
        setSelectedStudent(null)
        refetch()
        return true
      } catch (error) {
        showToast('Error', error.message || 'Failed to update student', 'error')
        throw error
      }
    },
    [selectedStudent, updateStudentMutation, refetch, showToast]
  )

  /**
   * Delete (soft delete) a student
   */
  const handleDeleteStudent = useCallback(async () => {
    try {
      const studentId = deleteConfirm.studentId
      if (!studentId) return

      const cancelledBy = user?.id ?? user?.user_id ?? user?.pk
      const cancelData = {
        cancelledBy,
        cancelledAt: new Date().toISOString()
      }

      await deleteStudentMutation.mutateAsync({ studentId, cancelData })

      showToast('Success', 'Student deleted successfully!', 'success')
      setDeleteConfirm({ isOpen: false, studentId: null, studentName: '' })
      refetch()
    } catch (error) {
      showToast('Error', error.message || 'Failed to delete student', 'error')
    }
  }, [deleteConfirm.studentId, user, deleteStudentMutation, refetch, showToast])

  /**
   * Export current page of students to CSV
   */
  const handleExportToCSV = useCallback(async () => {
    showToast('Info', 'Exporting current page of students...', 'info')
    try {
      const studentsToExport = students.filter((student) => !student.cancelled)

      if (studentsToExport.length === 0) {
        showToast('Warning', 'No students to export', 'warning')
        return
      }

      const headers = ['ID_NUMBER', 'RFID_NUMBER', 'NAME', 'YEAR_LEVEL', 'ACTIVE']

      const csvRows = [
        headers.join(','),
        ...studentsToExport.map((student) =>
          [
            `"${student.id_number || ''}"`,
            `"${student.rfid_number || ''}"`,
            `"${(student.name || '').replace(/"/g, '""')}"`,
            `"${student.year_level || ''}"`,
            student.active ? 'TRUE' : 'FALSE'
          ].join(',')
        )
      ]

      const csvContent = csvRows.join('\n')
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)

      link.setAttribute('href', url)
      link.setAttribute(
        'download',
        `students_export_page${currentPage}_${new Date().toISOString().split('T')[0]}.csv`
      )
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      showToast('Success', `Successfully exported ${studentsToExport.length} students`, 'success')
    } catch (error) {
      console.error('Export failed:', error)
      showToast('Error', 'Failed to export students', 'error')
    }
  }, [students, currentPage, showToast])

  /**
   * Refresh student data
   */
  const handleRefreshStudents = useCallback(async () => {
    try {
      refetch()
    } catch (error) {
      console.error('Error refreshing students:', error)
    }
  }, [refetch])

  return {
    // State
    filterStatus,
    setFilterStatus,
    selectedStudent,
    setSelectedStudent,
    deleteConfirm,
    setDeleteConfirm,

    // Data
    students,
    totalPages,
    isLoading,

    // Computed
    getFilteredStudents,

    // Handlers
    handleRowClick,
    handleAddStudent,
    handleEditStudent,
    handleDeleteStudent,
    handleExportToCSV,
    handleRefreshStudents,
    refetch
  }
}
