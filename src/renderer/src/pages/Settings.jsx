import { useState, useEffect } from 'react'
import { useNavigate, Outlet, useLocation } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import { FaDatabase } from 'react-icons/fa'
import './Settings.css'

function Settings() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const currentPath =
    location.pathname === '/settings' ? 'general' : location.pathname.split('/settings/')[1]

  const settingsTabs = [
    {
      id: 'backup',
      label: 'Backup & Restore',
      icon: FaDatabase
    }
  ]

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
