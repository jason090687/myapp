import { useState, useEffect } from 'react'
import { FaSave, FaUndo } from 'react-icons/fa'
import { useTranslation } from 'react-i18next'

function GeneralSettings() {
  const { t, i18n } = useTranslation()

  const defaultSettings = {
    language: 'en',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    pageSize: 25,
    theme: 'light',
    showWelcomeScreen: true
  }

  const [settings, setSettings] = useState(defaultSettings)
  const [saved, setSaved] = useState(false)

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('appSettings')
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings)
        setSettings(parsed)
        // Set the language on mount
        if (parsed.language && i18n.language !== parsed.language) {
          i18n.changeLanguage(parsed.language)
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error)
    }
  }, [i18n])

  const handleLanguageChange = (e) => {
    const newLanguage = e.target.value
    setSettings((prev) => ({ ...prev, language: newLanguage }))
    // Change language immediately
    i18n.changeLanguage(newLanguage)
  }

  const handleSave = () => {
    try {
      localStorage.setItem('appSettings', JSON.stringify(settings))
      setSaved(true)
      // Apply theme immediately
      if (settings.theme === 'dark') {
        document.documentElement.classList.add('dark-theme')
      } else {
        document.documentElement.classList.remove('dark-theme')
      }
      // Change language
      i18n.changeLanguage(settings.language)
      setTimeout(() => setSaved(false), 3000)
    } catch (error) {
      console.error('Error saving settings:', error)
      alert(t('messages.saveError') || 'Failed to save settings')
    }
  }

  const handleReset = () => {
    if (
      window.confirm(
        t('messages.resetConfirm') || 'Are you sure you want to reset all settings to default?'
      )
    ) {
      setSettings(defaultSettings)
      localStorage.removeItem('appSettings')
      document.documentElement.classList.remove('dark-theme')
      i18n.changeLanguage('en')
    }
  }

  return (
    <div className="settings-section">
      <h2>{t('settings.generalSettings')}</h2>
      <p className="settings-description">{t('settings.generalDescription')}</p>

      <div className="settings-form">
        <div className="form-group">
          <label>{t('settings.language')}</label>
          <select value={settings.language} onChange={handleLanguageChange}>
            <option value="en">English</option>
            <option value="es">Español (Spanish)</option>
            <option value="fr">Français (French)</option>
            <option value="de">Deutsch (German)</option>
            <option value="tl">Filipino (Tagalog)</option>
          </select>
        </div>

        <div className="form-group">
          <label>{t('settings.dateFormat')}</label>
          <select
            value={settings.dateFormat}
            onChange={(e) => setSettings((prev) => ({ ...prev, dateFormat: e.target.value }))}
          >
            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
          </select>
        </div>

        <div className="form-group">
          <label>{t('settings.timeFormat')}</label>
          <select
            value={settings.timeFormat}
            onChange={(e) => setSettings((prev) => ({ ...prev, timeFormat: e.target.value }))}
          >
            <option value="12h">12 Hour (AM/PM)</option>
            <option value="24h">24 Hour</option>
          </select>
        </div>

        <div className="form-group">
          <label>{t('settings.itemsPerPage')}</label>
          <select
            value={settings.pageSize}
            onChange={(e) => setSettings((prev) => ({ ...prev, pageSize: Number(e.target.value) }))}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>

        <div className="form-group">
          <label>{t('settings.theme')}</label>
          <select
            value={settings.theme}
            onChange={(e) => setSettings((prev) => ({ ...prev, theme: e.target.value }))}
          >
            <option value="light">{t('settings.light')}</option>
            <option value="dark">{t('settings.dark')}</option>
            <option value="auto">{t('settings.auto')}</option>
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
            {t('settings.showWelcome')}
          </label>
        </div>

        <div className="settings-actions">
          <button className="btn-primary" onClick={handleSave}>
            <FaSave />
            <span>{saved ? t('settings.saved') : t('settings.saveChanges')}</span>
          </button>
          <button className="btn-secondary" onClick={handleReset}>
            <FaUndo />
            <span>{t('settings.resetToDefault')}</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default GeneralSettings
