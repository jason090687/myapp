import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import PropTypes from 'prop-types'
import {
  Home,
  Book,
  Bookmark,
  Settings,
  LogOut,
  HelpCircle,
  GraduationCap,
  Users,
  Bell
} from 'lucide-react'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import ToastProvider from './Toast/ToastProvider'
import logo from '../assets/logo.png'
import './Sidebar.css'
import { fetchUserDetails } from '../Features/api'
import { useDispatch, useSelector } from 'react-redux'
import { logout, reset } from '../Features/authSlice'
import HelpGuideModal from './HelpGuideModal'
import Navbar from './Navbar'

const Sidebar = ({ isCollapsed, onToggle }) => {
  const [userDetails, setUserDetails] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false)
  const [isBacklogOpen, setIsBacklogOpen] = useState(false)

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
    { path: '/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/books', icon: Book, label: 'Books' },
    { path: '/borrowed', icon: Bookmark, label: 'Borrowed' },
    { path: '/students', icon: GraduationCap, label: 'Students' },
    { path: '/staff', icon: Users, label: 'Staff' },
    { separator: true },
    { path: '/settings', icon: Settings, label: 'Settings' },
    {
      icon: HelpCircle,
      label: 'Help Guide',
      onClick: () => setIsHelpModalOpen(true),
      isAction: true
    }
  ]

  const handleLogo = () => {
    navigate('/dashboard')
  }

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
            <h2 className="brand-text" onClick={handleLogo}>
              eLibrary
            </h2>
          </div>
        </div>

        <nav className="sidebar-nav">
          <ul>
            {menuItems.map((item, index) =>
              item.separator ? (
                <div key={`separator-${index}`} className="nav-separator" />
              ) : (
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
              )
            )}
          </ul>

          <div className="logout-container">
            <button
              onClick={handleLogout}
              className="logout-btn"
              data-tooltip="Logout"
              disabled={isLoading}
            >
              <LogOut className="logout-icon" />
              <span className="logout-text">Logout</span>
            </button>
          </div>
        </nav>
      </aside>

      <Navbar
        isCollapsed={isCollapsed}
        onToggle={onToggle}
        userDetails={userDetails}
        isLoading={isLoading}
        isBacklogOpen={isBacklogOpen}
        setIsBacklogOpen={setIsBacklogOpen}
      />

      <HelpGuideModal isOpen={isHelpModalOpen} onClose={() => setIsHelpModalOpen(false)} />

      <ToastProvider />
    </>
  )
}

Sidebar.propTypes = {
  isCollapsed: PropTypes.bool,
  onToggle: PropTypes.func
}

export default Sidebar
