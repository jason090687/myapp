import React from 'react'
import { useTheme } from '../context/ThemeContext'
import './ThemeToggle.css'

const ThemeToggle = ({ className = '' }) => {
  const { theme, setTheme } = useTheme()

  return (
    <select
      value={theme}
      onChange={(e) => setTheme(e.target.value)}
      className={`theme-toggle-dropdown ${className}`}
      aria-label="Select theme"
    >
      <option value="light">Light</option>
      <option value="system">System</option>
      <option value="dark">Dark</option>
    </select>
  )
}

export default ThemeToggle
