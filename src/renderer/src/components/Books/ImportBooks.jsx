import { useState, useEffect, useRef } from 'react'
import { FaTimes, FaCloudUploadAlt, FaFile, FaTrash } from 'react-icons/fa'
import Papa from 'papaparse'
import { toast } from 'react-hot-toast'
import './styles/ImportBooks.css'
import { Button } from '../ui/button'
import { useAddBook, useUserDetails } from '../../hooks'

function ImportBooks({ onClose, onRefresh }) {
  const [importing, setImporting] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [progress, setProgress] = useState({ current: 0, total: 0 })
  const [selectedFile, setSelectedFile] = useState(null)
  const [parsedData, setParsedData] = useState(null)
  const [isCancelling, setIsCancelling] = useState(false)
  const cancelRef = useRef(false)


  const loadingMessages = [
    { text: 'Analyzing library collection...', icon: '📚' },
    { text: 'Validating book entries...', icon: '📖' },
    { text: 'Building your digital catalog...', icon: '📑' },
    { text: 'Organizing metadata...', icon: '🗃️' },
    { text: 'Finalizing import...', icon: '✨' }
  ]

  const [currentLoadingState, setCurrentLoadingState] = useState(loadingMessages[0])

  const { data: users } = useUserDetails()
  const { mutateAsync: uploadNewBook } = useAddBook()

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
      return (row[idx] ?? '').toString().trim()
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
      .slice(2)
      .filter((row) => {
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
    if (importing && progress.total > 0) {
      const percentage = (progress.current / progress.total) * 100
      let messageIndex = 0
      if (percentage < 20) messageIndex = 0
      else if (percentage < 40) messageIndex = 1
      else if (percentage < 60) messageIndex = 2
      else if (percentage < 80) messageIndex = 3
      else messageIndex = 4
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
              if (isNaN(value)) throw new Error(`Invalid value for ${field}: ${book[field]}`)
            }
            formData.append(field, value === null ? '' : value)
          })
          formData.append('date_received', new Date().toISOString())
          formData.append('processed_by', users?.id || '')
          formData.append('date_processed', new Date().toISOString())
          formData.append('created_at', new Date().toISOString())
          formData.append('status', 'available')
          await uploadNewBook(formData)
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
        onRefresh()
        onClose()
      } else {
        toast.error('No books were imported successfully')
      }
    } catch (error) {
      if (!cancelRef.current) toast.error('Import failed: ' + error.message)
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
            let books = looksLikeExportedBooksCsv(rows)
              ? parseExportedBooksCsv(rows)
              : parseLegacyBooksCsv(rows)
            if (books.length === 0) throw new Error('No valid books found in the CSV file.')
            setParsedData(books)
          } catch (error) {
            toast.error(error?.message || 'Invalid CSV file format')
          }
        },
        error: () => toast.error('Error reading file')
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
      if (!cancelRef.current) toast.error('Upload failed')
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
              <h2>Import Books</h2>
              <p>Upload a CSV file to bulk import books into your library</p>
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
                    <span className="import-preview-badge">{parsedData.length} books found</span>
                  </div>

                  <div className="import-preview-table-wrap">
                    <table>
                      <thead>
                        <tr>
                          {[
                            'Title',
                            'Author',
                            'Series Title',
                            'Publisher',
                            'Place of Pub.',
                            'Year',
                            'Edition',
                            'Volume',
                            'Physical Desc.',
                            'ISBN',
                            'Accession #',
                            'Call Number',
                            'Barcode',
                            'Subject',
                            'Description',
                            'Additional Author',
                            'Copies'
                          ].map((h) => (
                            <th key={h}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {parsedData.map((book, i) => (
                          <tr key={i}>
                            <td>{book.title}</td>
                            <td>{book.author}</td>
                            <td>{book.series_title}</td>
                            <td>{book.publisher}</td>
                            <td>{book.place_of_publication}</td>
                            <td>{book.year}</td>
                            <td>{book.edition}</td>
                            <td>{book.volume}</td>
                            <td>{book.physical_description}</td>
                            <td>{book.isbn}</td>
                            <td>{book.accession_number}</td>
                            <td>{book.call_number}</td>
                            <td>{book.barcode}</td>
                            <td>{book.subject}</td>
                            <td>{book.description}</td>
                            <td>{book.additional_author}</td>
                            <td>{book.copies}</td>
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
              Import {parsedData.length} Books
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default ImportBooks
