import { useState } from 'react'

function BookManagement() {
  const [settings, setSettings] = useState({
    defaultStatus: 'available',
    enableISBNLookup: true,
    requireBarcode: true
  })

  return (
    <div className="settings-section">
      <h2>Book Management</h2>
      <div className="settings-form">
        <div className="form-group">
          <label>Default Book Status</label>
          <select
            name="defaultStatus"
            value={settings.defaultStatus}
            onChange={(e) => setSettings((prev) => ({ ...prev, defaultStatus: e.target.value }))}
          >
            <option value="available">Available</option>
            <option value="processing">Processing</option>
            <option value="reserved">Reserved</option>
          </select>
        </div>
        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={settings.enableISBNLookup}
              onChange={(e) =>
                setSettings((prev) => ({ ...prev, enableISBNLookup: e.target.checked }))
              }
            />
            Enable ISBN Lookup
          </label>
        </div>
        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={settings.requireBarcode}
              onChange={(e) =>
                setSettings((prev) => ({ ...prev, requireBarcode: e.target.checked }))
              }
            />
            Require Barcode
          </label>
        </div>
      </div>
    </div>
  )
}

export default BookManagement
