import React from 'react'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import './MonthSelector.css'

const MonthSelector = ({ currentMonth, currentYear, onMonthChange }) => {
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ]

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      onMonthChange(11, currentYear - 1)
    } else {
      onMonthChange(currentMonth - 1, currentYear)
    }
  }

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      onMonthChange(0, currentYear + 1)
    } else {
      onMonthChange(currentMonth + 1, currentYear)
    }
  }

  return (
    <div className="month-selector">
      <button onClick={handlePrevMonth} className="month-nav-btn">
        <FaChevronLeft />
      </button>
      <span className="current-month">
        {months[currentMonth]} {currentYear}
      </span>
      <button onClick={handleNextMonth} className="month-nav-btn">
        <FaChevronRight />
      </button>
    </div>
  )
}

export default MonthSelector
