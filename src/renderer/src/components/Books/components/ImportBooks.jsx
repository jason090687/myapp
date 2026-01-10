import { useState, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import { FaTimes, FaCloudUploadAlt, FaFile, FaTrash } from 'react-icons/fa'
import Papa from 'papaparse'
import { fetchUserDetails, uploadNewBook } from '../../../Features/api'
import { toast } from 'react-hot-toast'
import './ImportBooks.css'
import { Button } from '../../ui/button'

function ImportBooks({ onClose, onRefresh }) {
  const { token } = useSelector((state) => state.auth)
  const [importing, setImporting] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [progress, setProgress] = useState({ current: 0, total: 0 })
  const [selectedFile, setSelectedFile] = useState(null)
  const [parsedData, setParsedData] = useState(null)
  const [isCancelling, setIsCancelling] = useState(false)
  const cancelRef = useRef(false)
  const [loading, setLoading] = useState(true)
  const [customUser, setCustomUser] = useState(null)

  const loadingMessages = [
    { text: 'Analyzing library collection...', icon: '📚' },
    { text: 'Validating book entries...', icon: '📖' },
    { text: 'Building your digital catalog...', icon: '📑' },
    { text: 'Organizing metadata...', icon: '🗃️' },
    { text: 'Finalizing import...', icon: '✨' }
  ]

  const [currentLoadingState, setCurrentLoadingState] = useState(loadingMessages[0])

  const normalizeHeader = (value) =>
    (value ?? '')
      .toString()
      .replace(/^\uFEFF/, '')
      .trim()
      .toLowerCase()

  const toIntOrEmpty = (value) => {
    const text = (value ?? '').toString().trim()
    if (!text) return ''
    const n = parseInt(text, 10)
    return Number.isNaN(n) ? '' : n
  }

  const looksLikeExportedBooksCsv = (rows) => {
    if (!Array.isArray(rows) || rows.length === 0) return false
    const header = rows[0]
    if (!Array.isArray(header)) return false

    const normalized = header.map(normalizeHeader)
    return (
      normalized.includes('title') &&
      normalized.includes('author') &&
      normalized.includes('isbn') &&
      normalized.includes('copies')
    )
  }

  const parseExportedBooksCsv = (rows) => {
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
        title: get(row, 'title'),
        author: get(row, 'author'),
        series_title: get(row, 'series_title'),
        publisher: get(row, 'publisher'),
        place_of_publication: get(row, 'place_of_publication'),
        year: toIntOrEmpty(get(row, 'year')),
        edition: get(row, 'edition'),
        volume: get(row, 'volume'),
        physical_description: get(row, 'physical_description'),
        isbn: get(row, 'isbn'),
        accession_number: get(row, 'accession_number'),
        call_number: get(row, 'call_number'),
        barcode: get(row, 'barcode'),
        subject: get(row, 'subject'),
        description: get(row, 'description'),
        additional_author: get(row, 'additional_author'),
        copies: toIntOrEmpty(get(row, 'copies'))
      }))
      .filter((book) => book.call_number || book.accession_number || book.title)
  }

  const parseLegacyBooksCsv = (rows) => {
    return rows
      .slice(2) // Start from row 3 (legacy format)
      .filter((row) => {
        // Skip rows containing header-like content or all dashes
        const isHeaderRow = row.some(
          (cell) =>
            cell?.includes('TITLE/S') ||
            cell?.includes('AUTHOR/S') ||
            cell?.includes('ACC.') ||
            cell === '-'
        )
        const isAllDashes = row.every((cell) => cell === '-')
        return !isHeaderRow && !isAllDashes
      })
      .filter((row) => row.length >= 19)
      .map((row) => ({
        title: row[1]?.trim() || '',
        author: row[2]?.trim() || '',
        series_title: row[3]?.trim() || '',
        publisher: row[4]?.trim() || '',
        place_of_publication: row[5]?.trim() || '',
        year: row[6]?.trim() ? parseInt(row[6].trim(), 10) : '',
        edition: row[7]?.trim() || '',
        volume: row[8]?.trim() || '',
        physical_description: row[9]?.trim() || '',
        isbn: row[10]?.trim() || '',
        accession_number: row[11]?.trim() || '',
        call_number: row[12]?.trim() || '',
        barcode: row[13]?.trim() || '',
        subject: row[15]?.trim() || '',
        description: row[16]?.trim() || '',
        additional_author: row[17]?.trim() || '',
        copies: row[18]?.trim() ? parseInt(row[18].trim(), 10) : ''
      }))
      .filter((book) => book.call_number || book.accession_number || book.title)
  }

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const response = await fetchUserDetails(token)
        setCustomUser(response)
      } catch (error) {
        console.error('Error fetching user details:', error)
      } finally {
        setLoading(false)
      }
    }
    loadUserData()
  }, [token])

  // Update loading message based on progress
  useEffect(() => {
    if (importing && progress.total > 0) {
      const percentage = (progress.current / progress.total) * 100
      let messageIndex = 0

      if (percentage < 20) {
        messageIndex = 0 // Analyzing library collection...
      } else if (percentage < 40) {
        messageIndex = 1 // Validating book entries...
      } else if (percentage < 60) {
        messageIndex = 2 // Building your digital catalog...
      } else if (percentage < 80) {
        messageIndex = 3 // Organizing metadata...
      } else {
        messageIndex = 4 // Finalizing import...
      }

      setCurrentLoadingState(loadingMessages[messageIndex])
    }
  }, [importing, progress])

  const uploadBooks = async (books) => {
    setProgress({ current: 0, total: books.length })
    let successCount = 0

    try {
      for (const book of books) {
        if (cancelRef.current) {
          toast.success(`Import cancelled. ${successCount} books were imported.`)
          return
        }

        try {
          const formData = new FormData()
          const fields = [
            'title',
            'author',
            'series_title',
            'publisher',
            'place_of_publication',
            'year',
            'edition',
            'volume',
            'physical_description',
            'isbn',
            'accession_number',
            'call_number',
            'barcode',
            'subject',
            'description',
            'additional_author',
            'copies'
          ]
          fields.forEach((field) => {
            let value = book[field]
            if (field === 'copies' || field === 'year') {
              value = value ? parseInt(value) : ''
              if (isNaN(value)) {
                throw new Error(`Invalid value for ${field}: ${book[field]}`)
              }
            }
            if (field === 'date_received') {
              if (value && value.trim()) {
                try {
                  const date = new Date(value)
                  if (!isNaN(date.getTime())) {
                    value = date.toISOString().split('T')[0]
                  } else {
                    value = null
                  }
                } catch (e) {
                  value = null
                }
              } else {
                value = null
              }
            }
            formData.append(field, value === null ? '' : value)
          })

          formData.append('date_received', new Date().toISOString())
          formData.append('processed_by', customUser?.id || '')
          formData.append('date_processed', new Date().toISOString())
          formData.append('created_at', new Date().toISOString())
          formData.append('status', 'available')

          await uploadNewBook(token, formData)
          successCount++
        } catch (error) {
          if (cancelRef.current) return
          console.error(`Failed to upload book: ${book.title}`, error)
        }
        if (cancelRef.current) return
        setProgress((prev) => ({ ...prev, current: prev.current + 1 }))
      }

      if (successCount > 0) {
        toast.success(`Successfully imported ${successCount} books`)
        // Add a small delay before closing and refreshing
        setTimeout(() => {
          onRefresh() // Refresh the books table first
          onClose() // Then close the modal
        }, 500)
      } else {
        toast.error('No books were imported successfully')
      }
    } catch (error) {
      if (!cancelRef.current) {
        toast.error('Import failed: ' + error.message)
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

            // Preferred: accept the CSV exported by this app (header-based)
            let books = []
            if (looksLikeExportedBooksCsv(rows)) {
              books = parseExportedBooksCsv(rows)
            } else {
              // Fallback: legacy positional format
              books = parseLegacyBooksCsv(rows)
            }

            if (books.length === 0) {
              throw new Error(
                'No valid books found. Make sure you are importing a CSV exported from the app or a CSV that matches the required format.'
              )
            }

            setParsedData(books)
          } catch (error) {
            console.error('Error parsing CSV:', error)
            toast.error(error?.message || 'Invalid CSV file format or no valid books found')
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
    cancelRef.current = false
    try {
      await uploadBooks(parsedData)
    } catch (error) {
      if (!cancelRef.current) {
        console.error('Error uploading books:', error)
        toast.error('Upload failed')
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
      onRefresh() // Refresh the table before closing
      setImporting(false)
      setIsCancelling(false)
      onClose()
    }, 500)
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
                <th>Title</th>
                <th>Author</th>
                <th>Series Title</th>
                <th>Publisher</th>
                <th>Place of Pub.</th>
                <th>Year</th>
                <th>Edition</th>
                <th>Volume</th>
                <th>Physical Desc.</th>
                <th>ISBN</th>
                <th>Accession #</th>
                <th>Call Number</th>
                <th>Barcode</th>
                <th>Subject</th>
                <th>Description</th>
                <th>Additional Author</th>
                <th>Copies</th>
              </tr>
            </thead>
            <tbody>
              {parsedData.map((book, index) => (
                <tr key={index}>
                  <td>{book.title || ''}</td>
                  <td>{book.author || ''}</td>
                  <td>{book.series_title || ''}</td>
                  <td>{book.publisher || ''}</td>
                  <td>{book.place_of_publication || ''}</td>
                  <td>{book.year || ''}</td>
                  <td>{book.edition || ''}</td>
                  <td>{book.volume || ''}</td>
                  <td>{book.physical_description || ''}</td>
                  <td>{book.isbn || ''}</td>
                  <td>{book.accession_number || ''}</td>
                  <td className="call-number" data-content={book.call_number}>
                    {book.call_number || ''}
                  </td>
                  <td>{book.barcode || ''}</td>
                  <td>{book.subject || ''}</td>
                  <td>{book.description || ''}</td>
                  <td>{book.additional_author || ''}</td>
                  <td>{book.copies || ''}</td>
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
                {progress.current} of {progress.total} books imported
              </p>
            </div>
            {!isCancelling && (
              <Button varinat="ghost" onClick={handleCancelImport}>
                Cancel Import
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="import-header">
              <div className="header-content">
                <h2>Import Books</h2>
                <p className="header-subtitle">
                  Upload CSV file to bulk import books into your library
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
                        <span className="preview-count">{parsedData.length} books found</span>
                      </div>
                      {renderPreviewTable()}
                      <div className="import-actions">
                        <Button variant="primary" type="submit" onClick={handleSubmit}>
                          <FaCloudUploadAlt />
                          Import {parsedData.length} Books
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
                  <div className="format-guide">
                    <div className="guide-header">
                      <h4>CSV Format Guide</h4>
                    </div>
                    <div className="guide-content">
                      <p className="guide-description">
                        Your CSV file should contain the following 19 columns in order:
                      </p>
                      <div className="columns-grid">
                        <span>Title</span>
                        <span>Author</span>
                        <span>Series Title</span>
                        <span>Publisher</span>
                        <span>Place of Publication</span>
                        <span>Year</span>
                        <span>Edition</span>
                        <span>Volume</span>
                        <span>Physical Description</span>
                        <span>ISBN</span>
                        <span>Accession Number</span>
                        <span>Call Number</span>
                        <span>Barcode</span>
                        <span>Subject</span>
                        <span>Description</span>
                        <span>Additional Author</span>
                        <span>Copies</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default ImportBooks
