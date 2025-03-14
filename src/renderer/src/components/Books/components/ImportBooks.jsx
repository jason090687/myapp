import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { FaTimes, FaCloudUploadAlt, FaFile, FaTrash } from 'react-icons/fa'
import Papa from 'papaparse'
import { uploadNewBook } from '../../../Features/api'
import { toast } from 'react-hot-toast'
import './ImportBooks.css'

function ImportBooks({ onClose, onRefresh }) {
  const { token } = useSelector((state) => state.auth)
  const [importing, setImporting] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [progress, setProgress] = useState({ current: 0, total: 0 })
  const [selectedFile, setSelectedFile] = useState(null)
  const [loadingText, setLoadingText] = useState('')
  const [parsedData, setParsedData] = useState(null)

  const loadingMessages = [
    'Uploading your books...',
    'Processing data...',
    'Almost there...',
    'Hang tight, importing...',
    'Just a moment...'
  ]

  useEffect(() => {
    if (importing) {
      const interval = setInterval(() => {
        const randomMessage = loadingMessages[Math.floor(Math.random() * loadingMessages.length)]
        setLoadingText(randomMessage)
      }, 2000)
      return () => clearInterval(interval)
    }
  }, [importing])

  const currentLoadingState = {
    icon: <div className="spinner"></div>,
    text: loadingText || 'Processing...'
  }

  const uploadBooks = async (books) => {
    setProgress({ current: 0, total: books.length })
    let successCount = 0
    let failureCount = 0

    const loadingToast = toast.loading('Uploading books...')

    try {
      for (const book of books) {
        try {
          const formData = new FormData()
          const fields = ['call_number', 'accession_number', 'author', 'title', 'copies', 'year']
          fields.forEach((field) => {
            let value = book[field]
            if (field === 'copies' || field === 'year') {
              value = value ? parseInt(value) : null
              if (isNaN(value)) {
                throw new Error(`Invalid value for ${field}: ${book[field]}`)
              }
            }
            formData.append(field, value === '' ? null : value)
          })

          await uploadNewBook(token, formData)
          successCount++
        } catch (error) {
          console.error(`Failed to upload book: ${book.title}`, error)
          failureCount++
        }
        setProgress((prev) => ({ ...prev, current: prev.current + 1 }))
      }

      toast.dismiss(loadingToast)

      if (successCount > 0) {
        toast.success(`Successfully imported ${successCount} books`)
        if (failureCount > 0) {
          toast.error(`Failed to import ${failureCount} books`)
        }
        onClose()
        onRefresh() // Refresh the books table
      } else {
        toast.error('No books were imported successfully')
      }
    } catch (error) {
      toast.dismiss(loadingToast)
      toast.error('Import failed: ' + error.message)
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
            // Find header row index and skip it
            const headerIndex = rows.findIndex((row) =>
              row.some(
                (cell) =>
                  cell?.includes('CALL NUMBER') ||
                  cell?.includes('ACC.') ||
                  cell?.includes('REFERENCE BOOKS')
              )
            )

            if (headerIndex === -1) {
              throw new Error('Could not find header row in CSV')
            }

            // Skip header and any rows before it, plus the header row itself
            const books = rows
              .slice(headerIndex + 1) // Skip the header row too
              .filter((row) => row.length >= 6)
              .map((row) => ({
                call_number: row[0]?.trim() || null,
                accession_number: row[1]?.trim() || null,
                author: row[2]?.trim() || null,
                title: row[3]?.trim() || null,
                copies: row[4]?.trim() ? parseInt(row[4].trim()) : null,
                year: row[5]?.trim() ? parseInt(row[5].trim()) : null
              }))
              .filter((book) => book.call_number || book.accession_number || book.title)

            if (books.length === 0) {
              throw new Error('No valid books found in the file')
            }

            setParsedData(books)
          } catch (error) {
            console.error('Error parsing CSV:', error)
            toast.error('Invalid CSV file format or no valid books found')
          }
        },
        error: (error) => {
          console.error('Error reading file:', error)
          toast.error('Error reading file')
        }
      })
    } catch (error) {
      console.error('Error processing file:', error)
    }
  }

  const handleSubmit = async () => {
    if (!parsedData) return
    setImporting(true)
    try {
      await uploadBooks(parsedData)
    } catch (error) {
      console.error('Error uploading books:', error)
      toast.error('Upload failed')
    } finally {
      setImporting(false)
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

  const renderPreviewTable = () => {
    if (!parsedData) return null

    return (
      <div className="csv-preview">
        <h3>Preview ({parsedData.length} books found)</h3>
        <div className="preview-table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Call Number</th>
                <th>Accession Number</th>
                <th>Author</th>
                <th>Title</th>
                <th>Copies</th>
                <th>Year</th>
              </tr>
            </thead>
            <tbody>
              {parsedData.map((book, index) => (
                <tr key={index}>
                  <td className="call-number" data-content={book.call_number}>
                    {book.call_number || '-'}
                  </td>
                  <td>{book.accession_number || '-'}</td>
                  <td>{book.author || '-'}</td>
                  <td>{book.title || '-'}</td>
                  <td>{book.copies || '-'}</td>
                  <td>{book.year || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {importing ? (
          <div className="modal-content">
            <div className="modal-header">
              <h2>Importing Books</h2>
            </div>
            <div className="upload-progress">
              <div className="loading-icon-container">{currentLoadingState.icon}</div>
              <div className="loading-status">
                <h3>{currentLoadingState.text}</h3>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${(progress.current / progress.total) * 100}%` }}
                  >
                    <span className="progress-text">
                      {progress.current} / {progress.total} books
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="modal-header">
              <h2>Import Books</h2>
              <button className="close-btn" onClick={onClose}>
                <FaTimes />
              </button>
            </div>

            <div className="import-form">
              {selectedFile ? (
                <>
                  <div className="selected-file">
                    <FaFile className="file-icon" />
                    <span className="file-name">{selectedFile.name}</span>
                    <button className="remove-file" onClick={removeFile}>
                      <FaTrash />
                    </button>
                  </div>
                  {parsedData && (
                    <>
                      {renderPreviewTable()}
                      <div className="action-buttons">
                        <button className="submit-btn" onClick={handleSubmit}>
                          Import {parsedData.length} Books
                        </button>
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div
                  className={`drop-zone ${dragActive ? 'drag-active' : ''}`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <FaCloudUploadAlt className="upload-icon" />
                  <p>Drag and drop your CSV file here</p>
                  <p>or</p>
                  <label className="file-input-label">
                    <input
                      type="file"
                      accept=".csv,.txt"
                      onChange={(e) => processFile(e.target.files[0])}
                    />
                    <span>Choose File</span>
                  </label>
                </div>
              )}
              {!selectedFile && (
                <div className="format-info">
                  <h3>Expected Format (Tab-separated):</h3>
                  <div className="format-table">
                    <div>CALL NUMBER</div>
                    <div>ACC. # (Accession Number)</div>
                    <div>AUTHOR/S</div>
                    <div>TITLE/S</div>
                    <div># OF COPIES</div>
                    <div>COPYRIGHT</div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default ImportBooks
