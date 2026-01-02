import { useState, useEffect } from 'react'
import { FaSave, FaTrash, FaSync, FaDatabase, FaCog } from 'react-icons/fa'

function SystemSettings() {
  const defaultSettings = {
    cacheEnabled: true,
    autoSync: true,
    syncInterval: 30,
    logLevel: 'info',
    maxLogSize: 100
  }

  const [settings, setSettings] = useState(defaultSettings)
  const [cacheSize, setCacheSize] = useState('0 MB')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  // Load settings and calculate cache size on mount
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('systemSettings')
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings))
      }
      calculateCacheSize()
    } catch (error) {
      console.error('Error loading system settings:', error)
    }
  }, [])

  const calculateCacheSize = () => {
    try {
      let totalSize = 0
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          totalSize += localStorage[key].length + key.length
        }
      }
      // Convert to MB (approximate)
      const sizeInMB = (totalSize / (1024 * 1024)).toFixed(2)
      setCacheSize(`${sizeInMB} MB`)
    } catch (error) {
      console.error('Error calculating cache size:', error)
      setCacheSize('Unknown')
    }
  }

  const handleClearCache = async () => {
    if (
      !window.confirm(
        'Are you sure you want to clear the cache? This may affect performance temporarily.'
      )
    ) {
      return
    }

    setLoading(true)
    try {
      // Clear localStorage cache (keep essential data)
      const keysToKeep = [
        'authToken',
        'user',
        'appSettings',
        'notificationSettings',
        'systemSettings',
        'backupSettings'
      ]
      const allKeys = Object.keys(localStorage)
      allKeys.forEach((key) => {
        if (!keysToKeep.includes(key)) {
          localStorage.removeItem(key)
        }
      })

      calculateCacheSize()
      setMessage({ type: 'success', text: 'Cache cleared successfully!' })
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    } catch (error) {
      console.error('Error clearing cache:', error)
      setMessage({ type: 'error', text: 'Failed to clear cache' })
    } finally {
      setLoading(false)
    }
  }

  const handleClearLogs = () => {
    if (!window.confirm('Are you sure you want to clear all logs?')) {
      return
    }

    try {
      console.clear()
      setMessage({ type: 'success', text: 'Logs cleared successfully!' })
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to clear logs' })
    }
  }

  const handleSave = () => {
    try {
      localStorage.setItem('systemSettings', JSON.stringify(settings))
      setMessage({ type: 'success', text: 'Settings saved successfully!' })
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    } catch (error) {
      console.error('Error saving system settings:', error)
      setMessage({ type: 'error', text: 'Failed to save settings' })
    }
  }

  return (
    <div className="settings-section">
      <h2>System Settings</h2>
      <p className="settings-description">Configure system performance and maintenance</p>

      {message.text && <div className={`alert alert-${message.type}`}>{message.text}</div>}

      <div className="settings-form">
        {/* Performance */}
        <div className="settings-card">
          <h3>
            <FaCog /> Performance
          </h3>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={settings.cacheEnabled}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, cacheEnabled: e.target.checked }))
                }
              />
              Enable caching for faster performance
            </label>
          </div>

          <div className="form-group">
            <label>Cache Size</label>
            <div className="info-display">
              <span>{cacheSize}</span>
              <button
                className="btn-secondary btn-sm"
                onClick={handleClearCache}
                disabled={loading}
              >
                <FaTrash />
                <span>{loading ? 'Clearing...' : 'Clear Cache'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Synchronization */}
        <div className="settings-card">
          <h3>
            <FaSync /> Synchronization
          </h3>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={settings.autoSync}
                onChange={(e) => setSettings((prev) => ({ ...prev, autoSync: e.target.checked }))}
              />
              Enable automatic data synchronization
            </label>
          </div>

          {settings.autoSync && (
            <div className="form-group form-group-indent">
              <label>Sync Interval (minutes)</label>
              <select
                value={settings.syncInterval}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, syncInterval: Number(e.target.value) }))
                }
              >
                <option value={5}>Every 5 minutes</option>
                <option value={15}>Every 15 minutes</option>
                <option value={30}>Every 30 minutes</option>
                <option value={60}>Every hour</option>
              </select>
            </div>
          )}
        </div>

        {/* Logging */}
        <div className="settings-card">
          <h3>
            <FaDatabase /> Logging
          </h3>

          <div className="form-group">
            <label>Log Level</label>
            <select
              value={settings.logLevel}
              onChange={(e) => setSettings((prev) => ({ ...prev, logLevel: e.target.value }))}
            >
              <option value="error">Error Only</option>
              <option value="warning">Warning & Error</option>
              <option value="info">Info, Warning & Error</option>
              <option value="debug">Debug (All)</option>
            </select>
          </div>

          <div className="form-group">
            <label>Maximum Log Size (MB)</label>
            <input
              type="number"
              min="10"
              max="500"
              step="10"
              value={settings.maxLogSize}
              onChange={(e) =>
                setSettings((prev) => ({ ...prev, maxLogSize: Number(e.target.value) }))
              }
            />
          </div>

          <div className="form-group">
            <button className="btn-secondary" onClick={handleClearLogs}>
              <FaTrash />
              <span>Clear All Logs</span>
            </button>
          </div>
        </div>

        <div className="settings-actions">
          <button className="btn-primary" onClick={handleSave}>
            <FaSave />
            <span>Save Changes</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default SystemSettings
