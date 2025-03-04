import React from 'react'
import { FaTimes, FaEdit, FaTrash } from 'react-icons/fa'
import { formatDate } from '../utils/bookUtils'
import './BookDetailsModal.css'

const BookDetailsModal = ({ book, isOpen, onClose, onEdit, onDelete }) => {
  if (!isOpen || !book) return null

  const bookDetails = [
    { label: 'Title', value: book.title },
    { label: 'Author', value: book.author },
    { label: 'Series Title', value: book.seriesTitle },
    { label: 'Publisher', value: book.publisher },
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
        // Remove any existing "of" format and extract just the number
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

  return (
    <div className="book-details-overlay" onClick={onClose}>
      <div className="book-details-content" onClick={(e) => e.stopPropagation()}>
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
            {bookDetails.map(
              ({ label, value }) =>
                value && (
                  <div key={label} className="detail-item">
                    <span className="detail-label">{label}</span>
                    <span className="detail-value">{value}</span>
                  </div>
                )
            )}
          </div>
        </div>

        <div className="book-details-footer">
          <button className="action-button edit" onClick={() => onEdit(book)}>
            <FaEdit /> Edit
          </button>
          <button className="action-button delete" onClick={() => onDelete(book.id)}>
            <FaTrash /> Delete
          </button>
        </div>
      </div>
    </div>
  )
}

export default BookDetailsModal
