import React, { useState, useEffect, useRef } from 'react'
import { FaBars, FaSearch, FaUserCircle } from 'react-icons/fa'
import PropTypes from 'prop-types'
import { useSelector } from 'react-redux'
import { globalSearch } from '../services/searchService'
import SearchResults from './SearchResults'
import './Sidebar.css' // Change from Sidebar.css to Navbar.css
import './SkeletonLoader.css'
import { useNavigate } from 'react-router-dom' // Add this import
import { Bell } from 'lucide-react'
import BacklogPanel from './BacklogPanel'
import { useActivity } from '../context/ActivityContext'

const Navbar = ({
  isCollapsed = false,
  onToggle = () => {},
  userDetails = {},
  isLoading = false,
  isBacklogOpen = false,
  setIsBacklogOpen = () => {}
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState(null)
  const [isSearching, setIsSearching] = useState(false)
  const searchRef = useRef(null)
  const { activities } = useActivity()
  const { token } = useSelector((state) => state.auth)
  const navigate = useNavigate() // Add navigation hook

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

  const handleProfileClick = () => {
    navigate('/profile') // Navigate to profile page
  }

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
      <div
        className="nav-item user-profile"
        onClick={handleProfileClick}
        role="button"
        tabIndex={0}
      >
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
        <button
          className="notification-btn"
          onClick={() => setIsBacklogOpen(true)}
          title="View activity log"
        >
          <Bell size={18} />
          {activities.length > 0 && <span className="notification-badge">{activities.length}</span>}
        </button>
        <div className="nav-item"></div>
        {renderUserProfile()}
      </div>

      <BacklogPanel isOpen={isBacklogOpen} onClose={() => setIsBacklogOpen(false)} />
    </nav>
  )
}

Navbar.propTypes = {
  isCollapsed: PropTypes.bool,
  onToggle: PropTypes.func,
  userDetails: PropTypes.object,
  isLoading: PropTypes.bool
}

export default Navbar
