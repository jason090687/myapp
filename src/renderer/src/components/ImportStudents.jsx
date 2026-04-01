import { useState, useRef } from 'react'
import { FaTimes, FaCloudUploadAlt, FaFile, FaTrash } from 'react-icons/fa'
import Papa from 'papaparse'
import { useToaster } from './Toast/useToaster'
import './styles/ImportStudents.css'
import { Button } from './ui/button'
import { useCreateStudent } from '../hooks'

function ImportStudents({ onClose, onRefresh }) {
  const [importing, setImporting] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [progress, setProgress] = useState({ current: 0, total: 0 })
  const [selectedFile, setSelectedFile] = useState(null)
  const [parsedData, setParsedData] = useState(null)
  const [isCancelling, setIsCancelling] = useState(false)
  const cancelRef = useRef(false)
  const { showToast } = useToaster()

  const loadingMessages = [
    { text: 'Analyzing student records...', icon: '👥' },
    { text: 'Validating student entries...', icon: '✅' },
    { text: 'Building student database...', icon: '📊' },
    { text: 'Organizing student data...', icon: '🗃️' },
    { text: 'Finalizing import...', icon: '✨' }
  ]

  const createStudentMutation = useCreateStudent()

  const [currentLoadingState, setCurrentLoadingState] = useState(loadingMessages[0])

  const normalizeHeader = (value) =>
    (value ?? '')
      .toString()
      .replace(/^\uFEFF/, '')
      .trim()
      .toLowerCase()

  const parseStudentsCsv = (rows) => {
    const header = rows[0]
    const headerIndex = new Map()
    header.forEach((h, idx) => {
      const key = normalizeHeader(h)
      if (key) headerIndex.set(key, idx)
    })
    const get = (row, key) => {
      const idx = headerIndex.get(key)
      if (idx === undefined) return ''
      return (row[idx] ?? '').toString().trim()
    }
    return rows
      .slice(1)
      .filter((row) => Array.isArray(row) && row.some((cell) => (cell ?? '').toString().trim()))
      .map((row) => ({
        id_number: get(row, 'id_number'),
        rfid_number: get(row, 'rfid_number'),
        name: get(row, 'name'),
        year_level: get(row, 'year_level'),
        active:
          get(row, 'active') === 'TRUE' ||
          get(row, 'active') === 'true' ||
          get(row, 'active') === '1'
      }))
      .filter((student) => student.id_number && student.name)
  }

  const uploadStudents = async (students) => {
    setProgress({ current: 0, total: students.length })
    let successCount = 0
    let errorCount = 0
    try {
      for (const student of students) {
        if (cancelRef.current) {
          showToast('Info', `Import cancelled. ${successCount} students were imported.`, 'info')
          return
        }
        try {
          await createStudentMutation.mutateAsync(student)
          successCount++
        } catch (error) {
          if (cancelRef.current) return
          console.error(`Failed to import student: ${student.name}`, error)
          errorCount++
        }
        if (cancelRef.current) return
        setProgress((prev) => ({ ...prev, current: prev.current + 1 }))
        const percentage = ((successCount + errorCount) / students.length) * 100
        setCurrentLoadingState(loadingMessages[Math.min(Math.floor(percentage / 20), 4)])
      }
      if (successCount > 0) {
        showToast(
          'Success',
          `Successfully imported ${successCount} students${errorCount > 0 ? `, ${errorCount} failed` : ''}`,
          'success'
        )
        setTimeout(() => {
          onRefresh()
          onClose()
        }, 500)
      } else {
        showToast('Error', 'No students were imported successfully', 'error')
      }
    } catch (error) {
      if (!cancelRef.current) showToast('Error', 'Import failed: ' + error.message, 'error')
    }
  }

  const processFile = async (file) => {
    try {
      if (!file) return
      setSelectedFile(file)
      Papa.parse(file, {
        skipEmptyLines: true,
        complete: (results) => {
          try {
            if (results.errors.length > 0) throw new Error('Error parsing CSV file')
            const rows = results.data
            if (!Array.isArray(rows) || rows.length === 0) throw new Error('CSV file is empty')
            const students = parseStudentsCsv(rows)
            if (students.length === 0)
              throw new Error('No valid students found. CSV must have ID_NUMBER and NAME columns.')
            setParsedData(students)
          } catch (error) {
            showToast('Error', error?.message || 'Invalid CSV file format', 'error')
          }
        },
        error: () => showToast('Error', 'Error reading file', 'error')
      })
    } catch (error) {
      console.error('Error processing file:', error)
    }
  }

  const handleSubmit = async () => {
    if (!parsedData) return
    setImporting(true)
    cancelRef.current = false
    try {
      await uploadStudents(parsedData)
    } catch (error) {
      if (!cancelRef.current) showToast('Error', 'Upload failed', 'error')
    } finally {
      if (!cancelRef.current) setImporting(false)
    }
  }

  const removeFile = () => {
    setSelectedFile(null)
    setProgress({ current: 0, total: 0 })
    setParsedData(null)
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true)
    else if (e.type === 'dragleave') setDragActive(false)
  }

  const handleDrop = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    const file = e.dataTransfer.files[0]
    if (file) await processFile(file)
  }

  const handleCancelImport = () => {
    cancelRef.current = true
    setIsCancelling(true)
    setTimeout(() => {
      onRefresh()
      setImporting(false)
      setIsCancelling(false)
      onClose()
    }, 500)
  }

  const progressPct = progress.total > 0 ? (progress.current / progress.total) * 100 : 0

  return (
    <div
      className="import-modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget && !importing) onClose()
      }}
    >
      <div className="import-modal-wrapper">
        {/* Header */}
        <div className="import-modal-header">
          <div className="import-modal-title">
            <FaCloudUploadAlt className="import-title-icon" />
            <div>
              <h2>Import Students</h2>
              <p>Upload a CSV file to bulk import students into your library system</p>
            </div>
          </div>
          <button
            className="import-modal-close"
            onClick={onClose}
            disabled={importing}
            type="button"
            aria-label="Close"
          >
            <FaTimes />
          </button>
        </div>

        {/* Body */}
        <div className="import-modal-body">
          {importing ? (
            /* ── Progress State ── */
            <div className="import-progress-state">
              <div className="import-progress-icon">
                {isCancelling ? '🛑' : currentLoadingState.icon}
              </div>
              <h3 className="import-progress-message">
                {isCancelling ? 'Cancelling import...' : currentLoadingState.text}
              </h3>

              <div className="import-progress-track-wrap">
                <div className="import-progress-track">
                  <div className="import-progress-fill" style={{ width: `${progressPct}%` }} />
                </div>
                <div className="import-progress-meta">
                  <span className="import-progress-count">
                    {progress.current} / {progress.total}
                  </span>
                  <span className="import-progress-pct">{Math.round(progressPct)}%</span>
                </div>
              </div>

              {!isCancelling && (
                <Button variant="secondary" onClick={handleCancelImport}>
                  Cancel Import
                </Button>
              )}
            </div>
          ) : selectedFile ? (
            /* ── File Selected ── */
            <>
              <div className="import-file-card">
                <div className="import-file-icon">
                  <FaFile />
                </div>
                <div className="import-file-details">
                  <p className="import-file-name">{selectedFile.name}</p>
                  <p className="import-file-size">{(selectedFile.size / 1024).toFixed(2)} KB</p>
                </div>
                <Button variant="ghost" onClick={removeFile} title="Remove file">
                  <FaTrash />
                </Button>
              </div>

              {parsedData && (
                <>
                  <div className="import-preview-header">
                    <h3>Preview</h3>
                    <span className="import-preview-badge">{parsedData.length} students found</span>
                  </div>

                  <div className="import-preview-table-wrap">
                    <table>
                      <thead>
                        <tr>
                          {['ID Number', 'RFID Number', 'Name', 'Year Level', 'Active'].map((h) => (
                            <th key={h}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {parsedData.map((student, i) => (
                          <tr key={i}>
                            <td>{student.id_number}</td>
                            <td>{student.rfid_number}</td>
                            <td>{student.name}</td>
                            <td>{student.year_level}</td>
                            <td>{student.active ? 'Yes' : 'No'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </>
          ) : (
            /* ── Upload Area ── */
            <div
              className={`import-upload-area ${dragActive ? 'active' : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="import-upload-icon">
                <FaCloudUploadAlt />
              </div>
              <h3>Drop your CSV file here</h3>
              <p>or click below to browse your files</p>
              <label className="import-upload-btn">
                <input
                  type="file"
                  accept=".csv,.txt"
                  onChange={(e) => processFile(e.target.files[0])}
                  hidden
                />
                Choose File
              </label>
            </div>
          )}
        </div>

        {/* Footer */}
        {!importing && selectedFile && parsedData && (
          <div className="import-modal-footer">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSubmit}>
              <FaCloudUploadAlt />
              Import {parsedData.length} Students
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default ImportStudents
