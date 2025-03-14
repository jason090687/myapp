import React, { useEffect, useState } from 'react'
import { FaTimes, FaEdit, FaTrash, FaBook } from 'react-icons/fa'
import { formatDate } from '../utils/bookUtils'
import { fetchBookDetails } from '../../../Features/api' // Updated import path
import { useSelector } from 'react-redux'
import './BookDetailsModal.css'

const BookDetailsModal = ({ book, isOpen, onClose, onEdit, onDelete }) => {
  const [bookDetails, setBookDetails] = useState(null)
  const [imageLoading, setImageLoading] = useState(true)
  const [isClosing, setIsClosing] = useState(false) // Add this state
  const { token } = useSelector((state) => state.auth)

  useEffect(() => {
    const getBookDetails = async () => {
      if (isOpen && book?.id) {
        try {
          const details = await fetchBookDetails(token, book.id)
          setBookDetails(details)
        } catch (error) {
          console.error('Error fetching book details:', error)
        }
      }
    }

    getBookDetails()
  }, [isOpen, book?.id, token])

  if (!isOpen || !book) return null

  const renderBookCover = (coverUrl) => (
    <div className="book-cover-container" style={{ display: 'flex', justifyContent: 'center' }}>
      {coverUrl ? (
        <>
          {imageLoading && <div className="book-cover-skeleton pulse" />}
          <img
            src={
              coverUrl.startsWith('http')
                ? coverUrl
                : `http://countmein.pythonanywhere.com${coverUrl}`
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
          <FaBook size={24} />
        </div>
      )}
    </div>
  )

  const details = [
    {
      label: 'Book Cover',
      value: renderBookCover(bookDetails?.book_cover || book.book_cover),
      isComponent: true
    },
    { label: 'Title', value: book.title },
    { label: 'Author', value: book.author },
    { label: 'Place of Publication', value: book.placeOfPublication },
    { label: 'Year', value: book.year },
    { label: 'Edition', value: book.edition },
    { label: 'Volume', value: book.volume },
    { label: 'Physical Description', value: book.physicalDescription },
    { label: 'ISBN', value: book.isbn },
    { label: 'Accession Number', value: book.accessionNo },
    {
      label: 'Copy Number',
      value: (() => {
        const copyNum = book.copy_number.toString().split(' of ')[0]
        const totalCopies = parseInt(book.copies)
        return totalCopies ? `${copyNum} of ${totalCopies}` : copyNum
      })()
    },
    { label: 'Barcode', value: book.barcode },
    { label: 'Date Received', value: formatDate(book.dateReceived) },
    { label: 'Subject', value: book.subject },
    { label: 'Date Processed', value: formatDate(book.dateProcessed) },
    { label: 'Processed By', value: book.processedBy }
  ]

  const handleDelete = async (id) => {
    setIsClosing(true)
    // Reduce timeout to make it feel snappier
    setTimeout(() => {
      onDelete(id)
      onClose()
      setIsClosing(false)
    }, 200)
  }

  return (
    <div className="book-details-overlay" onClick={onClose}>
      <div
        className={`book-details-content ${isClosing ? 'modal-exit' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="book-details-header">
          <div className="header-content">
            <h2>Book Details</h2>
            <span className={`status-tag ${book.status?.toLowerCase()}`}>{book.status}</span>
          </div>
          <button className="close-button" onClick={onClose}>
            <FaTimes />
          </button>
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
          <button className="action-button edit" onClick={() => onEdit(book)}>
            <FaEdit /> Edit
          </button>
          <button className="action-button delete" onClick={() => handleDelete(book.id)}>
            <FaTrash /> Delete
          </button>
        </div>
      </div>
    </div>
  )
}

export default BookDetailsModal
