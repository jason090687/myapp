import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import PropTypes from 'prop-types'
import {
  FaHome,
  FaBook,
  FaBookmark,
  FaHistory,
  FaCog,
  FaSignOutAlt,
  FaBars,
  FaSearch,
  FaBell,
  FaUserCircle,
  FaQuestion
} from 'react-icons/fa'
import { ToastContainer, toast, Bounce } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import logo from '../assets/logo.png'
import './Sidebar.css'
import { fetchUserDetails } from '../Features/api'
import { useDispatch, useSelector } from 'react-redux'
import { logout, reset } from '../Features/authSlice'
import HelpGuideModal from './HelpGuideModal'
import Navbar from './Navbar' // Make sure Navbar is imported

const Sidebar = ({ isCollapsed, onToggle }) => {
  const [userDetails, setUserDetails] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false)
  const location = useLocation()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const { token } = useSelector((state) => state.auth)

  useEffect(() => {
    if (!token) return

    setIsLoading(true)
    const fetchUserData = async () => {
      try {
        const response = await fetchUserDetails(token)
        setUserDetails(response)
      } catch (error) {
        console.error('Error fetching user details:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [token])

  const menuItems = [
    { path: '/dashboard', icon: FaHome, label: 'Dashboard' },
    { path: '/books', icon: FaBook, label: 'Books' },
    { path: '/borrowed', icon: FaBookmark, label: 'Borrowed' },
    { path: '/settings', icon: FaCog, label: 'Settings' },
    {
      icon: FaQuestion,
      label: 'Help Guide',
      onClick: () => setIsHelpModalOpen(true),
      isAction: true
    }
  ]

  const handleLogout = async () => {
    setIsLoading(true)
    try {
      dispatch(logout())
      dispatch(reset())
      toast.success('Logged out successfully!')
      navigate('/')
    } catch (error) {
      toast.error('Logout failed! Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

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
            {menuItems.map((item, index) => (
              <li
                key={item.path || index}
                className={location.pathname === item.path ? 'active' : ''}
              >
                {item.isAction ? (
                  <button
                    onClick={item.onClick}
                    className="nav-action-btn"
                    data-tooltip={item.label}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                  </button>
                ) : (
                  <Link to={item.path} data-tooltip={item.label}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                )}
              </li>
            ))}
          </ul>

          <div className="logout-container">
            <button
              onClick={handleLogout}
              className="logout-btn"
              data-tooltip="Logout"
              disabled={isLoading}
            >
              <FaSignOutAlt className="logout-icon" />
              <span className="logout-text">{isLoading ? 'Logging out...' : 'Logout'}</span>
            </button>
          </div>
        </nav>
      </aside>

      <Navbar
        isCollapsed={isCollapsed}
        onToggle={onToggle}
        userDetails={userDetails}
        isLoading={isLoading}
      />

      <HelpGuideModal isOpen={isHelpModalOpen} onClose={() => setIsHelpModalOpen(false)} />

      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        transition={Bounce}
      />
    </>
  )
}

Sidebar.propTypes = {
  isCollapsed: PropTypes.bool,
  onToggle: PropTypes.func
}

export default Sidebar
