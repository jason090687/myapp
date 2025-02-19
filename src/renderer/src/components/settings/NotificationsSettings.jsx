import { useState } from 'react'

function NotificationsSettings() {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    dueDateReminder: 3,
    overdueNotifications: true
  })

  return (
    <div className="settings-section">
      <h2>Notifications</h2>
      <div className="settings-form">
        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={settings.emailNotifications}
              onChange={(e) =>
                setSettings((prev) => ({ ...prev, emailNotifications: e.target.checked }))
              }
            />
            Enable Email Notifications
          </label>
        </div>
        <div className="form-group">
          <label>Due Date Reminder (days before)</label>
          <input
            type="number"
            value={settings.dueDateReminder}
            onChange={(e) => setSettings((prev) => ({ ...prev, dueDateReminder: e.target.value }))}
            min="1"
            max="14"
          />
        </div>
        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={settings.overdueNotifications}
              onChange={(e) =>
                setSettings((prev) => ({ ...prev, overdueNotifications: e.target.checked }))
              }
            />
            Send Overdue Notifications
          </label>
        </div>
      </div>
    </div>
  )
}

export default NotificationsSettings
