import { useState, useEffect } from 'react'
import { FaSave, FaBell } from 'react-icons/fa'

function NotificationSettings() {
  const defaultSettings = {
    overdueReminders: true,
    newBookAlerts: false,
    returnReminders: true,
    systemUpdates: true,
    reminderDaysBefore: 3
  }

  const [settings, setSettings] = useState(defaultSettings)
  const [saved, setSaved] = useState(false)

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('notificationSettings')
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings))
      }
    } catch (error) {
      console.error('Error loading notification settings:', error)
    }
  }, [])

  const handleSave = () => {
    try {
      localStorage.setItem('notificationSettings', JSON.stringify(settings))
      setSaved(true)

      setTimeout(() => setSaved(false), 3000)
    } catch (error) {
      console.error('Error saving notification settings:', error)
      alert('Failed to save settings')
    }
  }

  return (
    <div className="settings-section">
      <h2>Notification Settings</h2>
      <p className="settings-description">Configure how and when you receive notifications</p>

      <div className="settings-form">
        {/* Alert Types */}
        <div className="settings-card">
          <h3>
            <FaBell /> Alert Preferences
          </h3>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={settings.overdueReminders}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, overdueReminders: e.target.checked }))
                }
              />
              Overdue book reminders
            </label>
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={settings.returnReminders}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, returnReminders: e.target.checked }))
                }
              />
              Return date reminders
            </label>
          </div>

          {settings.returnReminders && (
            <div className="form-group form-group-indent">
              <label>Remind me this many days before due date</label>
              <input
                type="number"
                min="1"
                max="14"
                value={settings.reminderDaysBefore}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, reminderDaysBefore: Number(e.target.value) }))
                }
              />
            </div>
          )}

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={settings.newBookAlerts}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, newBookAlerts: e.target.checked }))
                }
              />
              New book arrival alerts
            </label>
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={settings.systemUpdates}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, systemUpdates: e.target.checked }))
                }
              />
              System updates and announcements
            </label>
          </div>
        </div>

        <div className="settings-actions">
          <button className="btn-primary" onClick={handleSave}>
            <FaSave />
            <span>{saved ? 'Saved!' : 'Save Changes'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default NotificationSettings
