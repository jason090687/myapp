import React, { useState, useEffect, useRef } from 'react'
import { FaBars, FaSearch, FaUserCircle } from 'react-icons/fa'
import PropTypes from 'prop-types'
import { useSelector } from 'react-redux'
import { globalSearch } from '../services/searchService'
import SearchResults from './SearchResults'
import './Navbar.css'
import './SkeletonLoader.css'
import { useNavigate } from 'react-router-dom' // Add this import
import { Bell } from 'lucide-react'
import BacklogPanel from './BacklogPanel'
import { useActivity } from '../context/ActivityContext'
import { getNotificationsCount, fetchBorrowRequests } from '../Features/api'

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
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [notificationsCount, setNotificationsCount] = useState(0)
  const [borrowRequestsCount, setBorrowRequestsCount] = useState(0)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const searchRef = useRef(null)
  const userMenuRef = useRef(null)
  const { activities } = useActivity()
  const { token } = useSelector((state) => state.auth)
  const navigate = useNavigate() // Add navigation hook

  // Fetch notifications count
  useEffect(() => {
    if (!token) return

    const fetchCount = async () => {
      try {
        const response = await getNotificationsCount(token)
        setNotificationsCount(response.count || 0)
        console.log()
      } catch (error) {
        console.error('Error fetching notifications count:', error)
      }
    }

    fetchCount()
    // Refresh count every 30 seconds
    const interval = setInterval(fetchCount, 30000)
    return () => clearInterval(interval)
  }, [token])

  // Fetch pending borrow requests count
  useEffect(() => {
    if (!token) return

    const fetchRequestsCount = async () => {
      try {
        const response = await fetchBorrowRequests(token, 'pending')
        const unreadCount = (response.results || []).filter(
          (request) => request.is_read !== true
        ).length
        setBorrowRequestsCount(unreadCount)
      } catch (error) {
        console.error('Error fetching borrow requests count:', error)
      }
    }

    fetchRequestsCount()
    // Refresh count every 30 seconds
    const interval = setInterval(fetchRequestsCount, 30000)
    return () => clearInterval(interval)
  }, [token, refreshTrigger])

  // Handle click outside search results
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchResults(null)
      }

      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false)
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
        <div className="user-menu-wrapper">
          <div className="user-profile-skeleton">
            <div className="skeleton-circle" />
            <div className="skeleton-text" />
          </div>
        </div>
      )
    }

    return (
      <div className="user-menu-wrapper" ref={userMenuRef}>
        <button
          className="user-profile-button"
          onClick={() => setIsUserMenuOpen((prev) => !prev)}
          aria-haspopup="menu"
          aria-expanded={isUserMenuOpen}
          aria-label="User menu"
        >
          <div className="user-avatar-container">
            <FaUserCircle className="user-icon" />
          </div>
          <span className="user-name-text">{userDetails?.first_name || 'User'}</span>
        </button>

        {isUserMenuOpen && (
          <div className="user-dropdown-menu" role="menu">
            <div className="dropdown-item-group">
              <button
                className="dropdown-menu-item"
                role="menuitem"
                onClick={() => {
                  setIsUserMenuOpen(false)
                  navigate('/settings/account')
                }}
              >
                <span className="menu-item-text">Account</span>
              </button>
              <button
                className="dropdown-menu-item"
                role="menuitem"
                onClick={() => {
                  setIsUserMenuOpen(false)
                  navigate('/settings/general')
                }}
              >
                <span className="menu-item-text">General</span>
              </button>
            </div>
          </div>
        )}
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
          {searchResults && (
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
          {notificationsCount + borrowRequestsCount + activities.length > 0 && (
            <span className="notification-badge">
              {notificationsCount + borrowRequestsCount + activities.length}
            </span>
          )}
        </button>
        {renderUserProfile()}
      </div>

      <BacklogPanel
        isOpen={isBacklogOpen}
        onClose={() => {
          setIsBacklogOpen(false)
          setRefreshTrigger((prev) => prev + 1)
        }}
        onRequestUpdate={() => setRefreshTrigger((prev) => prev + 1)}
      />
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
