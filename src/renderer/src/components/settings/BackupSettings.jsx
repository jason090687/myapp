import { useState } from 'react'

function BackupSettings() {
  const [settings, setSettings] = useState({
    autoBackup: true,
    backupFrequency: 'daily',
    keepBackups: 30
  })

  return (
    <div className="settings-section">
      <h2>Backup & Restore</h2>
      <div className="settings-form">
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
            onChange={(e) => setSettings((prev) => ({ ...prev, backupFrequency: e.target.value }))}
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
        <div className="settings-actions">
          <button className="btn-primary">Backup Now</button>
          <button className="btn-secondary">Restore Backup</button>
        </div>
      </div>
    </div>
  )
}

export default BackupSettings
