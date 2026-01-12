import { useState, useRef } from 'react'
import { useSelector } from 'react-redux'
import { FaTimes, FaCloudUploadAlt, FaFile, FaTrash } from 'react-icons/fa'
import Papa from 'papaparse'
import { createStudent } from '../Features/api'
import { useToaster } from './Toast/useToaster'
import './ImportStudents.css'
import { Button } from './ui/button'

function ImportStudents({ onClose, onRefresh }) {
  const { token } = useSelector((state) => state.auth)
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
      const raw = row[idx]
      return (raw ?? '').toString().trim()
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
          await createStudent(token, student)
          successCount++
        } catch (error) {
          if (cancelRef.current) return
          console.error(`Failed to import student: ${student.name}`, error)
          errorCount++
        }

        if (cancelRef.current) return
        setProgress((prev) => ({ ...prev, current: prev.current + 1 }))

        // Update loading message based on progress
        const percentage = ((successCount + errorCount) / students.length) * 100
        let messageIndex = Math.min(Math.floor(percentage / 20), 4)
        setCurrentLoadingState(loadingMessages[messageIndex])
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
      if (!cancelRef.current) {
        showToast('Error', 'Import failed: ' + error.message, 'error')
      }
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
            if (results.errors.length > 0) {
              console.error('CSV Parsing Errors:', results.errors)
              throw new Error('Error parsing CSV file')
            }

            const rows = results.data

            if (!Array.isArray(rows) || rows.length === 0) {
              throw new Error('CSV file is empty')
            }

            const students = parseStudentsCsv(rows)

            if (students.length === 0) {
              throw new Error(
                'No valid students found. Make sure your CSV has the required columns: ID_NUMBER, NAME'
              )
            }

            setParsedData(students)
          } catch (error) {
            console.error('Error parsing CSV:', error)
            showToast('Error', error?.message || 'Invalid CSV file format', 'error')
          }
        },
        error: (error) => {
          console.error('Error reading file:', error)
          showToast('Error', 'Error reading file', 'error')
        }
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
      if (!cancelRef.current) {
        console.error('Error uploading students:', error)
        showToast('Error', 'Upload failed', 'error')
      }
    } finally {
      if (!cancelRef.current) {
        setImporting(false)
      }
    }
  }

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
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
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const file = e.dataTransfer.files[0]
    if (file) {
      await processFile(file)
    }
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

  const renderPreviewTable = () => {
    if (!parsedData) return null

    return (
      <div className="csv-preview">
        <div className="preview-table-wrapper">
          <table>
            <thead>
              <tr>
                <th>ID Number</th>
                <th>RFID Number</th>
                <th>Name</th>
                <th>Year Level</th>
                <th>Active</th>
              </tr>
            </thead>
            <tbody>
              {parsedData.map((student, index) => (
                <tr key={index}>
                  <td>{student.id_number || ''}</td>
                  <td>{student.rfid_number || ''}</td>
                  <td>{student.name || ''}</td>
                  <td>{student.year_level || ''}</td>
                  <td>{student.active ? 'Yes' : 'No'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  return (
    <div className="import-modal-overlay" onClick={handleOverlayClick}>
      <div className="import-modal-container" onClick={(e) => e.stopPropagation()}>
        {importing ? (
          <div className="import-loading">
            <h3 className="loading-message">
              {isCancelling ? 'Cancelling import...' : currentLoadingState.text}
            </h3>
            <div className="progress-container">
              <div className="progress-track">
                <div
                  className="progress-indicator"
                  style={{ width: `${(progress.current / progress.total) * 100}%` }}
                />
              </div>
              <p className="progress-label">
                {progress.current} of {progress.total} students imported
              </p>
            </div>
            {!isCancelling && (
              <Button variant="ghost" onClick={handleCancelImport}>
                Cancel Import
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="import-header">
              <div className="header-content">
                <h2>Import Students</h2>
                <p className="header-subtitle">
                  Upload CSV file to bulk import students into your library system
                </p>
              </div>
              <Button variant="ghost" onClick={onClose} aria-label="Close">
                <FaTimes />
              </Button>
            </div>

            <div className="import-body">
              {selectedFile ? (
                <>
                  <div className="file-selected">
                    <div className="file-info">
                      <div className="file-icon-wrapper">
                        <FaFile />
                      </div>
                      <div className="file-details">
                        <p className="file-name">{selectedFile.name}</p>
                        <p className="file-size">{(selectedFile.size / 1024).toFixed(2)} KB</p>
                      </div>
                      <Button variant="ghost" onClick={removeFile} title="Remove file">
                        <FaTrash />
                      </Button>
                    </div>
                  </div>
                  {parsedData && (
                    <>
                      <div className="preview-header">
                        <h3>Preview</h3>
                        <span className="preview-count">{parsedData.length} students found</span>
                      </div>
                      {renderPreviewTable()}
                      <div className="import-actions">
                        <Button variant="primary" type="submit" onClick={handleSubmit}>
                          <FaCloudUploadAlt />
                          Import {parsedData.length} Students
                        </Button>
                      </div>
                    </>
                  )}
                </>
              ) : (
                <>
                  <div
                    className={`upload-area ${dragActive ? 'active' : ''}`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <div className="upload-icon-wrapper">
                      <FaCloudUploadAlt />
                    </div>
                    <h3 className="upload-title">Drop your CSV file here</h3>
                    <p className="upload-subtitle">or click below to browse</p>
                    <label className="btn-upload">
                      <input
                        type="file"
                        accept=".csv,.txt"
                        onChange={(e) => processFile(e.target.files[0])}
                        hidden
                      />
                      Choose File
                    </label>
                  </div>
                  {/* <div className="format-guide">
                    <div className="guide-header">
                      <h4>CSV Format Guide</h4>
                    </div>
                    <div className="guide-content">
                      <p className="guide-description">
                        Your CSV file should contain the following columns:
                      </p>
                      <div className="columns-grid">
                        <span className="required">ID_NUMBER*</span>
                        <span>RFID_NUMBER</span>
                        <span className="required">NAME*</span>
                        <span>YEAR_LEVEL</span>
                        <span>ACTIVE (TRUE/FALSE)</span>
                      </div>
                      <p className="guide-note">* Required fields</p>
                    </div>
                  </div> */}
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default ImportStudents
