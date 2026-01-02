import { useState, useEffect } from 'react'
import { FaSave, FaDownload, FaUpload } from 'react-icons/fa'

function BackupSettings() {
  const defaultSettings = {
    autoBackup: true,
    backupFrequency: 'daily',
    keepBackups: 30
  }

  const [settings, setSettings] = useState(defaultSettings)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [lastBackup, setLastBackup] = useState(null)

  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('backupSettings')
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings))
      }
      const lastBackupDate = localStorage.getItem('lastBackupDate')
      if (lastBackupDate) {
        setLastBackup(new Date(lastBackupDate))
      }
    } catch (error) {
      console.error('Error loading backup settings:', error)
    }
  }, [])

  const handleSave = () => {
    try {
      localStorage.setItem('backupSettings', JSON.stringify(settings))
      setMessage({ type: 'success', text: 'Settings saved successfully!' })
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    } catch (error) {
      console.error('Error saving backup settings:', error)
      setMessage({ type: 'error', text: 'Failed to save settings' })
    }
  }

  const handleBackupNow = () => {
    setLoading(true)
    try {
      // Create backup object with all localStorage data
      const backup = {
        timestamp: new Date().toISOString(),
        data: {}
      }

      // Copy all localStorage data
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          backup.data[key] = localStorage[key]
        }
      }

      // Convert to JSON and create downloadable file
      const dataStr = JSON.stringify(backup, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `library-backup-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      // Save backup timestamp
      const now = new Date()
      localStorage.setItem('lastBackupDate', now.toISOString())
      setLastBackup(now)

      setMessage({ type: 'success', text: 'Backup created successfully!' })
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    } catch (error) {
      console.error('Error creating backup:', error)
      setMessage({ type: 'error', text: 'Failed to create backup' })
    } finally {
      setLoading(false)
    }
  }

  const handleRestore = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e) => {
      const file = e.target.files[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = (event) => {
        try {
          const backup = JSON.parse(event.target.result)

          if (!backup.data || !backup.timestamp) {
            throw new Error('Invalid backup file format')
          }

          if (
            !window.confirm(
              `Are you sure you want to restore backup from ${new Date(backup.timestamp).toLocaleString()}? This will overwrite current data.`
            )
          ) {
            return
          }

          setLoading(true)

          // Restore all data
          for (let key in backup.data) {
            localStorage.setItem(key, backup.data[key])
          }

          setMessage({
            type: 'success',
            text: 'Backup restored successfully! Please refresh the page.'
          })

          // Reload page after 2 seconds
          setTimeout(() => {
            window.location.reload()
          }, 2000)
        } catch (error) {
          console.error('Error restoring backup:', error)
          setMessage({ type: 'error', text: 'Failed to restore backup: ' + error.message })
          setLoading(false)
        }
      }
      reader.readAsText(file)
    }
    input.click()
  }

  return (
    <div className="settings-section">
      <h2>Backup & Restore</h2>
      <p className="settings-description">
        Backup your library data and restore from previous backups
      </p>

      {message.text && <div className={`alert alert-${message.type}`}>{message.text}</div>}

      {lastBackup && <div className="info-banner">Last backup: {lastBackup.toLocaleString()}</div>}

      <div className="settings-form">
        <div className="settings-card">
          <h3>Backup Settings</h3>
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={settings.autoBackup}
                onChange={(e) => setSettings((prev) => ({ ...prev, autoBackup: e.target.checked }))}
              />
              Enable Automatic Backup
            </label>
          </div>
          <div className="form-group">
            <label>Backup Frequency</label>
            <select
              value={settings.backupFrequency}
              onChange={(e) =>
                setSettings((prev) => ({ ...prev, backupFrequency: e.target.value }))
              }
              disabled={!settings.autoBackup}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          <div className="form-group">
            <label>Keep Backups For (days)</label>
            <input
              type="number"
              value={settings.keepBackups}
              onChange={(e) => setSettings((prev) => ({ ...prev, keepBackups: e.target.value }))}
              min="1"
              max="365"
            />
          </div>
          <button className="btn-primary" onClick={handleSave}>
            <FaSave />
            <span>Save Settings</span>
          </button>
        </div>

        <div className="settings-card">
          <h3>Backup Actions</h3>
          <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '1rem' }}>
            Create a backup file that can be downloaded and stored safely, or restore from a
            previous backup file.
          </p>
          <div className="settings-actions">
            <button className="btn-primary" onClick={handleBackupNow} disabled={loading}>
              <FaDownload />
              <span>{loading ? 'Creating Backup...' : 'Backup Now'}</span>
            </button>
            <button className="btn-secondary" onClick={handleRestore} disabled={loading}>
              <FaUpload />
              <span>Restore Backup</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BackupSettings
