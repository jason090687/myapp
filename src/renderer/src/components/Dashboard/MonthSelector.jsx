import React from 'react'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import './MonthSelector.css'

const MonthSelector = ({ selectedDate, onDateChange }) => {
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

  const currentDate = new Date()
  const isCurrentMonth =
    selectedDate.getMonth() === currentDate.getMonth() &&
    selectedDate.getFullYear() === currentDate.getFullYear()

  const handlePrevMonth = () => {
    const newDate = new Date(selectedDate)
    newDate.setMonth(selectedDate.getMonth() - 1)
    onDateChange(newDate)
  }

  const handleNextMonth = () => {
    const newDate = new Date(selectedDate)
    newDate.setMonth(selectedDate.getMonth() + 1)
    if (newDate <= currentDate) {
      onDateChange(newDate)
    }
  }

  return (
    <div className="month-selector">
      <button className="month-nav-btn" onClick={handlePrevMonth}>
        <FaChevronLeft />
      </button>
      <span className="month-display">
        {months[selectedDate.getMonth()]} {selectedDate.getFullYear()}
      </span>
      <button className="month-nav-btn" onClick={handleNextMonth} disabled={isCurrentMonth}>
        <FaChevronRight />
      </button>
    </div>
  )
}

export default MonthSelector
