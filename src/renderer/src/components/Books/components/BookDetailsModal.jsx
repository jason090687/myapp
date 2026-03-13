import React, { useEffect, useState, useCallback, useRef } from 'react'
import { X, Edit2, Trash2, BookOpen } from 'lucide-react'
import { formatDate } from '../utils/bookUtils'
import { fetchBookDetails } from '../../../Features/api'
import { useSelector } from 'react-redux'
import '../styles/BookDetailsModal.css'
import { Button } from '../../ui/button'

const BookDetailsModal = ({ book, isOpen, onClose, onEdit, onDelete }) => {
  const [bookDetails, setBookDetails] = useState(null)
  const [imageLoading, setImageLoading] = useState(true)
  const [isClosing, setIsClosing] = useState(false)
  const [isLoadingDetails, setIsLoadingDetails] = useState(false)
  const { token } = useSelector((state) => state.auth)
  // Ref to block the first click that opened the modal from immediately closing it
  const justOpenedRef = useRef(false)

  useEffect(() => {
    setBookDetails(null)
    setImageLoading(true)
    setIsClosing(false)
  }, [book?.id])

  // When modal opens, mark it as "just opened" so the triggering click doesn't close it
  useEffect(() => {
    if (isOpen) {
      justOpenedRef.current = true
      // Allow overlay clicks to close after one event loop tick
      const t = setTimeout(() => {
        justOpenedRef.current = false
      }, 0)
      return () => clearTimeout(t)
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen || !book?.id || !token) return

    const getBookDetails = async () => {
      try {
        setIsLoadingDetails(true)
        const details = await fetchBookDetails(token, book.id)
        setBookDetails(details)
      } catch (error) {
        console.error('Error fetching book details:', error)
      } finally {
        setIsLoadingDetails(false)
      }
    }

    getBookDetails()
  }, [isOpen, book?.id, token])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const handleClose = useCallback(
    (e) => {
      e?.stopPropagation()
      // Block the click that triggered the modal from closing it
      if (justOpenedRef.current) return
      setIsClosing(true)
      setTimeout(() => {
        onClose()
        setIsClosing(false)
      }, 200)
    },
    [onClose]
  )

  const handleDelete = useCallback(
    (id) => {
      setIsClosing(true)
      setTimeout(() => {
        onDelete(id, book?.title)
        onClose()
        setIsClosing(false)
      }, 200)
    },
    [onDelete, onClose, book?.title]
  )

  const handleEdit = useCallback(() => {
    onEdit(book)
  }, [onEdit, book])

  const renderBookCover = useCallback(
    (coverUrl) => {
      if (!coverUrl) {
        return (
          <div className="book-cover-container">
            <div className="default-book-cover">
              <BookOpen size={48} strokeWidth={1.5} />
            </div>
          </div>
        )
      }

      const fullUrl = coverUrl.startsWith('http')
        ? coverUrl
        : `http://192.168.0.145:8000${coverUrl}`

      return (
        <div className="book-cover-container">
          {imageLoading && <div className="book-cover-skeleton pulse" />}
          <img
            src={fullUrl}
            alt={`Cover of ${book?.title}`}
            className={`book-cover-image ${imageLoading ? 'hidden' : ''}`}
            onLoad={() => setImageLoading(false)}
            onError={(e) => {
              setImageLoading(false)
              e.target.style.display = 'none'
              e.target.parentNode.innerHTML = `<div class="default-book-cover"><svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg></div>`
            }}
          />
        </div>
      )
    },
    [imageLoading, book?.title]
  )

  const displayData = bookDetails || book

  const details = book
    ? [
        {
          label: 'Book Cover',
          value: renderBookCover(displayData?.book_cover),
          isComponent: true
        },
        { label: 'Title', value: book.title },
        { label: 'Author', value: book.author },
        { label: 'Series Title', value: book.series_title },
        { label: 'Publisher', value: book.publisher },
        { label: 'Place of Publication', value: book.place_of_publication },
        { label: 'Year', value: book.year },
        { label: 'Edition', value: book.edition },
        { label: 'Volume', value: book.volume },
        { label: 'Physical Description', value: book.physical_description },
        { label: 'ISBN', value: book.isbn },
        { label: 'Accession Number', value: book.accession_number },
        { label: 'Call Number', value: book.call_number },
        {
          label: 'Copy Number',
          value: (() => {
            const copyNum = book.copy_number?.toString()?.split(' of ')[0] || '1'
            const totalCopies = parseInt(book.copies) || 1
            return totalCopies > 1 ? `${copyNum} of ${totalCopies}` : copyNum
          })()
        },
        { label: 'Barcode', value: book.barcode },
        { label: 'Date Received', value: formatDate(book.date_received) },
        { label: 'Subject', value: book.subject },
        { label: 'Additional Author', value: book.additional_author },
        { label: 'Status', value: book.status },
        { label: 'Date Processed', value: formatDate(book.date_processed) },
        { label: 'Processed By', value: book.name },
        { label: 'Description', value: book.description }
      ]
    : []

  if (!isOpen || !book) return null

  return (
    <div className="book-details-overlay" onClick={handleClose}>
      <div
        className={`book-details-content ${isClosing ? 'modal-exit' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="book-details-header">
          <div className="header-content">
            <h2>Book Details</h2>
            <span className={`status-tag ${book.status?.toLowerCase()}`}>{book.status}</span>
          </div>
          <Button variant="ghost" onClick={handleClose} aria-label="Close modal">
            <X size={20} />
          </Button>
        </div>

        {/* Body */}
        <div className="book-details-body">
          {isLoadingDetails ? (
            <div className="book-details-loading">
              <div className="book-details-spinner" />
              <span>Loading details...</span>
            </div>
          ) : (
            <div className="details-grid">
              {details.map(
                ({ label, value, isComponent }) =>
                  value !== null &&
                  value !== undefined &&
                  value !== '' && (
                    <div key={label} className="detail-item">
                      <span className="detail-label">{label}</span>
                      {isComponent ? value : <span className="detail-value">{value}</span>}
                    </div>
                  )
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="book-details-footer">
          <Button variant="primary" onClick={handleEdit}>
            <Edit2 size={16} /> Edit
          </Button>
          <Button variant="secondary" onClick={() => handleDelete(book.id)}>
            <Trash2 size={16} /> Delete
          </Button>
        </div>
      </div>
    </div>
  )
}

export default React.memo(BookDetailsModal)
