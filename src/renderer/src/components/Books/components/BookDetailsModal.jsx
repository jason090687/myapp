import React, { useEffect, useState, useCallback } from 'react'
import { X, Edit2, Trash2, BookOpen } from 'lucide-react'
import { formatDate } from '../utils/bookUtils'
import { fetchBookDetails } from '../../../Features/api'
import { useSelector } from 'react-redux'
import './BookDetailsModal.css'
import { Button } from '../../ui/button'

const BookDetailsModal = ({ book, isOpen, onClose, onEdit, onDelete }) => {
  const [bookDetails, setBookDetails] = useState(null)
  const [imageLoading, setImageLoading] = useState(true)
  const [isClosing, setIsClosing] = useState(false)
  const { token } = useSelector((state) => state.auth)

  // Reset state when modal mounts
  useEffect(() => {
    setBookDetails(null)
    setImageLoading(true)
    setIsClosing(false)

    return () => {
      setBookDetails(null)
      setImageLoading(true)
      setIsClosing(false)
    }
  }, [book?.id])

  const handleClose = useCallback(
    (e) => {
      e?.stopPropagation()
      setIsClosing(true)
      const timer = setTimeout(() => {
        onClose()
        setIsClosing(false)
      }, 200)
      return () => clearTimeout(timer)
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

  useEffect(() => {
    if (!isOpen || !book?.id) return

    const getBookDetails = async () => {
      try {
        const details = await fetchBookDetails(token, book.id)
        setBookDetails(details)
      } catch (error) {
        console.error('Error fetching book details:', error)
      }
    }

    getBookDetails()
  }, [isOpen, book?.id, token])

  const renderBookCover = useCallback(
    (coverUrl) => (
      <div className="book-cover-container" style={{ display: 'flex', justifyContent: 'start' }}>
        {coverUrl ? (
          <>
            {imageLoading && <div className="book-cover-skeleton pulse" />}
            <img
              src={
                coverUrl.startsWith('http') ? coverUrl : `http://192.168.0.145:8000${coverUrl}` // Fixed URL format
              }
              alt={`Cover of ${book.title}`}
              className={`book-cover-image ${imageLoading ? 'hidden' : ''}`}
              onLoad={() => setImageLoading(false)}
              onError={(e) => {
                setImageLoading(false)
                e.target.onerror = null
                e.target.parentNode.innerHTML = `<div class="default-book-cover">
                <FaBook size={24} />
              </div>`
              }}
            />
          </>
        ) : (
          <div className="default-book-cover">
            <BookOpen size={48} strokeWidth={1.5} />
          </div>
        )}
      </div>
    ),
    [imageLoading, book?.title]
  )

  const details = book
    ? [
        {
          label: 'Book Cover',
          value: renderBookCover(bookDetails?.book_cover || book.book_cover),
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

  if (!isOpen || !book) {
    return null
  }

  return (
    <div className="book-details-overlay" onClick={handleClose}>
      <div
        className={`book-details-content ${isClosing ? 'modal-exit' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="book-details-header">
          <div className="header-content">
            <h2>Book Details</h2>
            <span className={`status-tag ${book.status?.toLowerCase()}`}>{book.status}</span>
          </div>
          <Button variant="ghost" onClick={handleClose} aria-label="Close modal">
            <X size={20} />
          </Button>
        </div>

        <div className="book-details-body">
          <div className="details-grid">
            {details.map(
              ({ label, value, isComponent }) =>
                value && (
                  <div key={label} className="detail-item">
                    <span className="detail-label">{label}</span>
                    {isComponent ? value : <span className="detail-value">{value}</span>}
                  </div>
                )
            )}
          </div>
        </div>

        <div className="book-details-footer">
          <Button variant="primary" onClick={() => onEdit(book)}>
            <Edit2 size={18} /> Edit
          </Button>
          <Button variant="secondary" onClick={() => handleDelete(book.id)}>
            <Trash2 size={18} /> Delete
          </Button>
        </div>
      </div>
    </div>
  )
}

export default React.memo(BookDetailsModal)
