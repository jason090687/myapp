import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { FaTimes, FaCloudUploadAlt, FaFile, FaTrash } from 'react-icons/fa'
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

  const parseCSV = (text) => {
    try {
      // Detect delimiter (comma, semicolon, or tab)
      const delimiter = text.includes('\t') ? '\t' : text.includes(';') ? ';' : ','

      // Split by newlines and filter out empty lines
      const rows = text
        .split('\n')
        .map((row) => row.trim())
        .filter((row) => row.length > 0)
        .map((row) => row.split(delimiter))

      // Find the header row index (looking for "CALL NUMBER" or "ACC. #")
      const headerIndex = rows.findIndex((row) =>
        row.some(
          (cell) =>
            cell.includes('CALL NUMBER') ||
            cell.includes('ACC.') ||
            cell.includes('REFERENCE BOOKS')
        )
      )

      if (headerIndex === -1) {
        throw new Error('Could not find header row in CSV')
      }

      // Skip header and any rows before it
      const dataRows = rows.slice(headerIndex + 1)

      // Map the data rows to book objects
      const books = dataRows
        .filter((row) => row.length >= 6) // Ensure minimum required columns
        .map((row) => {
          // Log the row for debugging
          console.log('Processing row:', row)

          return {
            call_number: row[0]?.trim() || null,
            accession_number: row[1]?.trim() || null,
            author: row[2]?.trim() || null,
            title: row[3]?.trim() || null,
            copies: row[4]?.trim() ? parseInt(row[4].trim()) : null,
            year: row[5]?.trim() ? parseInt(row[5].trim()) : null
          }
        })
        .filter(
          (book) =>
            // Ensure at least one required field is present
            book.call_number || book.accession_number || book.title
        )

      // Log the parsed books for debugging
      console.log('Parsed books:', books)

      if (books.length === 0) {
        throw new Error('No valid books found in the file')
      }

      return books
    } catch (error) {
      console.error('CSV Parsing Error:', error)
      console.log('Raw text:', text)
      throw new Error(`CSV parsing failed: ${error.message}`)
    }
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
      setImporting(true)
      if (!file) return

      setSelectedFile(file)
      const reader = new FileReader()
      reader.onload = async (e) => {
        const content = e.target.result
        try {
          const books = parseCSV(content)
          if (books.length === 0) {
            throw new Error('No valid books found in CSV')
          }
          await uploadBooks(books)
        } catch (error) {
          console.error('Error parsing CSV:', error)
          toast.error('Invalid CSV file format or no valid books found')
        }
      }
      reader.readAsText(file)
    } finally {
      setImporting(false)
    }
  }

  const removeFile = () => {
    setSelectedFile(null)
    setProgress({ current: 0, total: 0 })
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

  return (
    <>
      <div className="import-modal-overlay" onClick={onClose}></div>
      <div className="import-books-modal">
        <button className="close-button" onClick={onClose}>
          <FaTimes />
        </button>
        <div className="modal-content">
          <h2>Import Books</h2>

          {importing && (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <div className="loading-text">{loadingText}</div>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${(progress.current / progress.total) * 100}%` }}
                ></div>
                <span>
                  {progress.current} / {progress.total}
                </span>
              </div>
            </div>
          )}

          {selectedFile ? (
            <div className="selected-file">
              <FaFile className="file-icon" />
              <span className="file-name">{selectedFile.name}</span>
              <button className="remove-file" onClick={removeFile} disabled={importing}>
                <FaTrash />
              </button>
            </div>
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
                  disabled={importing}
                />
                <span>{importing ? 'Uploading...' : 'Choose File'}</span>
              </label>
            </div>
          )}

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
        </div>
      </div>
    </>
  )
}

export default ImportBooks
