import { useState } from 'react'

function SecuritySettings() {
  const [settings, setSettings] = useState({
    requirePassword: true,
    sessionTimeout: 30,
    twoFactorAuth: false
  })

  return (
    <div className="settings-section">
      <h2>Security</h2>
      <div className="settings-form">
        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={settings.requirePassword}
              onChange={(e) =>
                setSettings((prev) => ({ ...prev, requirePassword: e.target.checked }))
              }
            />
            Require Password for Changes
          </label>
        </div>
        <div className="form-group">
          <label>Session Timeout (minutes)</label>
          <input
            type="number"
            value={settings.sessionTimeout}
            onChange={(e) => setSettings((prev) => ({ ...prev, sessionTimeout: e.target.value }))}
            min="5"
            max="120"
          />
        </div>
        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={settings.twoFactorAuth}
              onChange={(e) =>
                setSettings((prev) => ({ ...prev, twoFactorAuth: e.target.checked }))
              }
            />
            Enable Two-Factor Authentication
          </label>
        </div>
      </div>
    </div>
  )
}

export default SecuritySettings
