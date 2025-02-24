import React, { useState, useEffect, useRef } from 'react'
import { FaBars, FaSearch, FaBell, FaUserCircle } from 'react-icons/fa'
import PropTypes from 'prop-types'
import { useSelector } from 'react-redux'
import { globalSearch } from '../services/searchService'
import SearchResults from './SearchResults'
import './Sidebar.css' // Change from Sidebar.css to Navbar.css
import './SkeletonLoader.css'

const Navbar = ({ isCollapsed, onToggle, userDetails, isLoading }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState(null)
  const [isSearching, setIsSearching] = useState(false)
  const searchRef = useRef(null)
  const { token } = useSelector((state) => state.auth)

  // Handle click outside search results
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchResults(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchTerm.trim()) {
        setIsSearching(true)
        try {
          const results = await globalSearch(token, searchTerm)
          setSearchResults(results)
        } catch (error) {
          console.error('Search error:', error)
        } finally {
          setIsSearching(false)
        }
      } else {
        setSearchResults(null)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchTerm, token])

  const renderUserProfile = () => {
    if (isLoading) {
      return (
        <div className="nav-item user-profile">
          <div className="skeleton skeleton-wave skeleton-icon"></div>
          <div className="skeleton skeleton-wave skeleton-user"></div>
        </div>
      )
    }

    return (
      <div className="nav-item user-profile">
        <FaUserCircle className="user-avatar" />
        <span>{userDetails?.first_name || 'User'}</span>
      </div>
    )
  }

  return (
    <nav className={`navbar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="navbar-left">
        <button onClick={onToggle} className="sidebar-toggle">
          <FaBars />
        </button>
        <div className="search-container" ref={searchRef}>
          <div className="search-box">
            <FaSearch className={isSearching ? 'searching' : ''} />
            <input
              type="text"
              placeholder="Search ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {searchResults && Object.values(searchResults).some((arr) => arr.length > 0) && (
            <SearchResults
              results={searchResults}
              onResultClick={() => {
                setSearchResults(null)
                setSearchTerm('')
              }}
            />
          )}
        </div>
      </div>

      <div className="navbar-right">
        <div className="nav-item">
          <FaBell />
        </div>
        {renderUserProfile()}
      </div>
    </nav>
  )
}

Navbar.propTypes = {
  isCollapsed: PropTypes.bool,
  onToggle: PropTypes.func,
  userDetails: PropTypes.object,
  isLoading: PropTypes.bool
}

Navbar.defaultProps = {
  isCollapsed: false,
  userDetails: {},
  isLoading: false
}

export default Navbar
