import { useState, useEffect } from 'react'
import { useNavigate, Outlet, useLocation } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import { FaUserCog, FaBook, FaBell, FaShieldAlt, FaDatabase, FaDownload } from 'react-icons/fa'
import './Settings.css'

function Settings() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [hasUpdate, setHasUpdate] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const currentPath =
    location.pathname === '/settings' ? 'general' : location.pathname.split('/settings/')[1]

  const settingsTabs = [
    {
      id: 'backup',
      label: 'Backup & Restore',
      icon: FaDatabase
    },
    {
      id: 'software-update',
      label: 'Software Update',
      icon: FaDownload,
      badge: hasUpdate ? 'New' : null
    }
  ]

  // Check for updates periodically
  useEffect(() => {
    const checkForUpdates = async () => {
      try {
        // Simulate update check
        const hasNewUpdate = Math.random() > 0.5
        setHasUpdate(hasNewUpdate)
      } catch (error) {
        console.error('Failed to check for updates:', error)
      }
    }

    checkForUpdates()
    const interval = setInterval(checkForUpdates, 3600000) // Check every hour

    return () => clearInterval(interval)
  }, [])

  // Ensure we're on a valid tab
  useEffect(() => {
    if (!currentPath) {
      navigate('/settings/backup')
    }
  }, [currentPath, navigate])

  const handleTabChange = (tabId) => {
    navigate(`/settings/${tabId}`)
  }

  return (
    <div className="app-wrapper">
      <Sidebar isCollapsed={isCollapsed} onToggle={() => setIsCollapsed(!isCollapsed)} />
      <div className={`settings-container ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="settings-content">
          <div className="settings-header">
            <h1>Settings</h1>
          </div>

          <div className="settings-body">
            <div className="settings-navigation">
              {settingsTabs.map((tab) => (
                <button
                  key={tab.id}
                  className={`settings-tab ${currentPath === tab.id ? 'active' : ''}`}
                  onClick={() => handleTabChange(tab.id)}
                >
                  <tab.icon />
                  <span>{tab.label}</span>
                  {tab.badge && <span className="update-badge">{tab.badge}</span>}
                </button>
              ))}
            </div>

            <div className="settings-panel">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings
