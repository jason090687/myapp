import React, { useEffect, useState, useCallback, useRef } from 'react'
import { ArrowLeft, BookOpen, Edit2, Trash2, Calendar } from 'lucide-react'
import { formatDate } from '../../hooks/bookUtils'
import { useSelector } from 'react-redux'
import './styles/BookDetailsModal.css'
import { Button } from '../ui/button'
import { useBookDetails } from '../../hooks'

const BookDetailsModal = ({ book, isOpen, onClose, onEdit, onDelete }) => {
  const [imageLoading, setImageLoading] = useState(true)
  const [isClosing, setIsClosing] = useState(false)
  const justOpenedRef = useRef(false)

  useEffect(() => {
    setImageLoading(true)
    setIsClosing(false)
  }, [book?.id])

  useEffect(() => {
    if (isOpen) {
      justOpenedRef.current = true
      const t = setTimeout(() => {
        justOpenedRef.current = false
      }, 0)
      return () => clearTimeout(t)
    }
  }, [isOpen])

  const { data: bookDetails, isLoading: isLoadingDetails } = useBookDetails(book?.id)

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const handleClose = useCallback(
    (e) => {
      e?.stopPropagation()
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

  const handleEdit = useCallback(() => onEdit(book), [onEdit, book])

  if (!isOpen || !book) return null

  const displayData = bookDetails || book

  const coverUrl = displayData?.book_cover

  const fullCoverUrl = coverUrl
    ? coverUrl.startsWith('http')
      ? coverUrl
      : `http://192.168.0.145:8000${coverUrl}`
    : null

  const finalCover = fullCoverUrl || '/no-cover.png'

  /* ── COPY LABEL ───────────────────────────── */
  const copyLabel = (() => {
    const n = book.copy_number?.toString()?.split(' of ')[0] || '1'
    const total = parseInt(book.copies) || 1
    return total > 1 ? `${n} of ${total}` : n
  })()

  /* Fields for the info grid */
  const infoFields = [
    { label: 'Publisher', value: book.publisher },
    { label: 'Place of Publication', value: book.place_of_publication },
    { label: 'Year', value: book.year },
    { label: 'Edition', value: book.edition },
    { label: 'Volume', value: book.volume },
    { label: 'Physical Desc.', value: book.physical_description },
    { label: 'ISBN', value: book.isbn },
    { label: 'Accession No.', value: book.accession_number },
    { label: 'Call Number', value: book.call_number },
    { label: 'Copy Number', value: copyLabel },
    { label: 'Barcode', value: book.barcode },
    { label: 'Series Title', value: book.series_title },
    { label: 'Date Received', value: formatDate(book.date_received) },
    { label: 'Date Processed', value: formatDate(book.date_processed) },
    { label: 'Processed By', value: book.name },
    { label: 'Additional Author', value: book.additional_author }
  ].filter((f) => f.value !== null && f.value !== undefined && f.value !== '')

  const statusKey = book.status?.toLowerCase()

  /* ── render ──────────────────────────────────────────────── */
  return (
    <div className="book-details-overlay" onClick={handleClose}>
      <div
        className={`book-details-content ${isClosing ? 'modal-exit' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Top nav bar ───────────────────────────────────── */}
        <div className="book-details-topbar">
          <button className="book-details-back-btn" onClick={handleClose}>
            <ArrowLeft size={15} />
            Go back
          </button>
        </div>

        {/* ── Scrollable body ───────────────────────────────── */}
        <div className="book-details-body">
          {isLoadingDetails ? (
            <div className="book-details-loading">
              <div className="book-details-spinner" />
              <span>Loading details…</span>
            </div>
          ) : (
            <>
              {/* ── Hero: cover + meta ────────────────────── */}
              <div className="book-details-hero">
                {/* Cover thumbnail */}
                <div className="book-details-cover">
                  {fullCoverUrl ? (
                    <>
                      {imageLoading && <div className="book-cover-skeleton" />}
                      <img
                        src={finalCover}
                        alt={`Cover of ${book.title}`}
                        className={imageLoading ? 'hidden' : ''}
                        onLoad={() => setImageLoading(false)}
                        onError={(e) => {
                          e.target.onerror = null
                          e.target.src = '/no-cover.png'
                          setImageLoading(false)
                        }}
                      />
                    </>
                  ) : (
                    <div className="default-book-cover">
                      <BookOpen size={36} strokeWidth={1.5} />
                      <span className="default-book-cover-label">No Cover</span>
                    </div>
                  )}
                </div>

                {/* Meta */}
                <div className="book-details-meta">
                  {book.date_processed && (
                    <div className="book-meta-created">
                      <Calendar size={13} />
                      Created at: &nbsp;{formatDate(book.date_processed)}
                    </div>
                  )}

                  <h2 className="book-meta-title">{book.title}</h2>

                  {book.author && <p className="book-meta-author">By {book.author}</p>}

                  {book.subject && (
                    <div className="book-meta-tags">
                      {book.subject.split(',').map((s) => (
                        <span key={s} className="book-meta-tag">
                          {s.trim()}
                        </span>
                      ))}
                    </div>
                  )}

                  {book.status && (
                    <span className={`book-meta-status ${statusKey}`}>{book.status}</span>
                  )}

                  <div className="book-meta-actions">
                    <Button variant="primary" onClick={handleEdit} className="book-meta-edit-btn">
                      <Edit2 size={14} />
                      Edit Book
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => handleDelete(book.id)}
                      className="book-meta-delete-btn"
                    >
                      <Trash2 size={15} /> Delete
                    </Button>
                  </div>
                </div>
              </div>

              {/* ── Content ───────────────────────────────── */}
              <div className="book-details-single-col">
                {/* Description / Summary */}
                {book.description && (
                  <section>
                    <p className="book-section-title">Summary</p>
                    <p className="book-description-text">{book.description}</p>
                  </section>
                )}

                {/* Info grid */}
                {infoFields.length > 0 && (
                  <section>
                    <p className="book-section-title">Book Information</p>
                    <div className="book-info-grid">
                      {infoFields.map(({ label, value }) => (
                        <div key={label} className="book-info-item">
                          <span className="book-info-label">{label}</span>
                          <span className="book-info-value">{value}</span>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default React.memo(BookDetailsModal)
