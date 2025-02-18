import { useState } from 'react'
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

const Sidebar = ({ isCollapsed, onToggle }) => {
  const location = useLocation()

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
          <img src={logo} alt="Logo" className="logo" />
          <span className="brand-text">E-Library</span>
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
            <span>John Doe</span>
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
