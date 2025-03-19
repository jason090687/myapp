import React from 'react'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'

function TopBorrowerMonthSelector({ currentMonth, currentYear, onMonthChange }) {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const handlePrevMonth = () => {
    const newDate = new Date(currentYear, currentMonth - 1)
    onMonthChange(newDate.getMonth(), newDate.getFullYear())
  }

  const handleNextMonth = () => {
    const newDate = new Date(currentYear, currentMonth + 1)
    onMonthChange(newDate.getMonth(), newDate.getFullYear())
  }

  return (
    <div className="borrower-month-selector" style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '0.9rem',
      backgroundColor: '#f5f5f5',
      padding: '4px 8px',
      borderRadius: '4px'
    }}>
      <button
        onClick={handlePrevMonth}
        style={{
          border: 'none',
          background: 'none',
          cursor: 'pointer',
          padding: '2px',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <FaChevronLeft size={12} />
      </button>
      <span style={{ fontWeight: '500' }}>
        {months[currentMonth]} {currentYear}
      </span>
      <button
        onClick={handleNextMonth}
        style={{
          border: 'none',
          background: 'none',
          cursor: 'pointer',
          padding: '2px',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <FaChevronRight size={12} />
      </button>
    </div>
  )
}

export default TopBorrowerMonthSelector
