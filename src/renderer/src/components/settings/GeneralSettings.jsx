import { useState, useEffect } from 'react'
import { FaSave, FaUndo } from 'react-icons/fa'
import { Button } from '../ui/button'

const defaultSettings = {
  language: 'en',
  showWelcomeScreen: true
}

function GeneralSettings() {
  const [settings, setSettings] = useState(defaultSettings)
  const [saved, setSaved] = useState(false)

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('appSettings')
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings)
        setSettings({ ...defaultSettings, ...parsed })
      }
    } catch (error) {
      console.error('Error loading settings:', error)
    }
  }, [])

  const handleLanguageChange = (e) => {
    const newLanguage = e.target.value
    setSettings((prev) => ({ ...prev, language: newLanguage }))
  }

  const handleSave = () => {
    try {
      localStorage.setItem('appSettings', JSON.stringify(settings))
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Failed to save settings')
    }
  }

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all settings to default?')) {
      setSettings(defaultSettings)
      localStorage.removeItem('appSettings')
    }
  }

  return (
    <div className="settings-section">
      <h2>General Settings</h2>
      <p>Configure your general app preferences below.</p>

      <div className="settings-form">
        <div className="form-group">
          <label>Language</label>
          <select value={settings.language} onChange={handleLanguageChange}>
            <option value="en">English</option>
            <option value="es">Español (Spanish)</option>
            <option value="fr">Français (French)</option>
            <option value="de">Deutsch (German)</option>
            <option value="tl">Filipino (Tagalog)</option>
          </select>
        </div>

        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={settings.showWelcomeScreen}
              onChange={(e) =>
                setSettings((prev) => ({ ...prev, showWelcomeScreen: e.target.checked }))
              }
            />
            Show Welcome Screen
          </label>
        </div>

        <div className="settings-actions">
          <Button variant='primary' onClick={handleSave}>
            <FaSave />
            <span>{saved ? 'Saved' : 'Save Changes'}</span>
          </Button>
          <Button variant='secondary' onClick={handleReset}>
            <FaUndo />
            <span>Reset to Default</span>
          </Button>
        </div>
      </div>
    </div>
  )
}

export default GeneralSettings