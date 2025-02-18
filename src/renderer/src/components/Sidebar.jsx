import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import PropTypes from 'prop-types'
import {
  FaHome,
  FaBook,
  FaBookmark,
  FaHistory,
  FaCog,
  FaQuestionCircle,
  FaSignOutAlt,
  FaBars,
  FaSearch,
  FaBell
} from 'react-icons/fa'
import logo from '../assets/logo.png'
import profilePic from '../assets/profile.jpg'
import './Sidebar.css'
import { fetchUserDetails } from '../Features/api'
import { useSelector } from 'react-redux'

const Sidebar = ({ isCollapsed, onToggle }) => {
  const [userDetails, setUserDetails] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const location = useLocation()

  const { token } = useSelector((state) => state.auth)

  useEffect(() => {
    setIsLoading(true)
    const fetchUserData = async () => {
      try {
        const response = await fetchUserDetails(token)
        setUserDetails(response)

        setFormData((prevFormData) => ({
          ...prevFormData,
          processed_by: response.id || currentUser.id
        }))
        console.log('User details:', setFormData)
      } catch (error) {
        console.error('Error fetching user details:', error)
      } finally {
        setIsLoading(false)
      }
    }
    if (token) fetchUserData()
  }, [token])

  const menuItems = [
    { path: '/dashboard', icon: FaHome, label: 'Dashboard' },
    { path: '/books', icon: FaBook, label: 'Books' },
    { path: '/borrowed', icon: FaBookmark, label: 'Borrowed' },
    { path: '/history', icon: FaHistory, label: 'History' },
    { path: '/settings', icon: FaCog, label: 'Settings' },
    { path: '/help', icon: FaQuestionCircle, label: 'Help' }
  ]

  return (
    <>
      <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <div className="logo-container">
            <img src={logo} alt="logo" style={{ width: '30px', height: '30px' }} />
            <h2 className="brand-text">E-Library</h2>
          </div>
        </div>

        <nav className="sidebar-nav">
          <ul>
            {menuItems.map((item) => (
              <li key={item.path} className={location.pathname === item.path ? 'active' : ''}>
                <Link to={item.path} data-tooltip={item.label}>
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>

          <div className="logout-container">
            <Link to="/" className="logout-btn" data-tooltip="Logout">
              <FaSignOutAlt />
              <span>Logout</span>
            </Link>
          </div>
        </nav>
      </aside>

      <nav className={`navbar ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="navbar-left">
          <button onClick={onToggle} className="sidebar-toggle">
            <FaBars />
          </button>
          <div className="search-box">
            <FaSearch />
            <input type="text" placeholder="Search..." />
          </div>
        </div>

        <div className="navbar-right">
          <div className="nav-item">
            <FaBell />
          </div>
          <div className="nav-item user-profile">
            <img src={profilePic} alt="User" className="avatar" />
            <span>{userDetails.first_name}</span>
          </div>
        </div>
      </nav>
    </>
  )
}

Sidebar.propTypes = {
  isCollapsed: PropTypes.bool,
  onToggle: PropTypes.func
}

export default Sidebar
