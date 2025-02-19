import { useState } from 'react'

function GeneralSettings() {
  const [settings, setSettings] = useState({
    libraryName: '',
    loanPeriod: 14,
    maxRenewals: 3
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setSettings((prev) => ({ ...prev, [name]: value }))
  }

  return (
    <div className="settings-section">
      <h2>General Settings</h2>
      <div className="settings-form">
        <div className="form-group">
          <label>Library Name</label>
          <input
            type="text"
            name="libraryName"
            value={settings.libraryName}
            onChange={handleChange}
            placeholder="Enter library name"
          />
        </div>
        <div className="form-group">
          <label>Default Loan Period (days)</label>
          <input
            type="number"
            name="loanPeriod"
            value={settings.loanPeriod}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label>Maximum Renewals</label>
          <input
            type="number"
            name="maxRenewals"
            value={settings.maxRenewals}
            onChange={handleChange}
          />
        </div>
        <div className="settings-save">
          <button type="button" className="save-btn" onClick={() => alert('Settings saved!')}>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}

export default GeneralSettings
