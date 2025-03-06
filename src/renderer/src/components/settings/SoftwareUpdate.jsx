import { useState, useEffect } from 'react'
import { FaDownload, FaCog, FaCheck, FaGithub } from 'react-icons/fa'
import { UpdateService } from '../../services/UpdateService'

function SoftwareUpdate() {
  const [updateStatus, setUpdateStatus] = useState({
    currentVersion: '1.0.0',
    latestCommit: null,
    changes: [],
    isChecking: false,
    hasUpdate: false,
    isDownloading: false,
    downloadProgress: 0,
    isInstalling: false,
    error: null
  })

  const checkForUpdates = async () => {
    setUpdateStatus((prev) => ({ ...prev, isChecking: true, error: null }))
    try {
      const update = await UpdateService.checkForUpdates()
      setUpdateStatus((prev) => ({
        ...prev,
        isChecking: false,
        hasUpdate: update.hasUpdate,
        latestCommit: update.latestCommit,
        changes: update.changes || []
      }))
    } catch (error) {
      setUpdateStatus((prev) => ({
        ...prev,
        isChecking: false,
        error: 'Failed to check for updates'
      }))
    }
  }

  const downloadAndInstallUpdate = async () => {
    setUpdateStatus((prev) => ({ ...prev, isDownloading: true }))
    try {
      // Download
      const updateData = await UpdateService.downloadUpdate()
      setUpdateStatus((prev) => ({ ...prev, isDownloading: false, isInstalling: true }))

      // Install
      await UpdateService.applyUpdate({
        latestCommit: updateStatus.latestCommit,
        data: updateData
      })

      setUpdateStatus((prev) => ({
        ...prev,
        isInstalling: false,
        hasUpdate: false,
        downloadProgress: 100
      }))

      // Show success message and prompt for restart
      if (window.confirm('Update installed successfully! Restart now?')) {
        window.location.reload()
      }
    } catch (error) {
      setUpdateStatus((prev) => ({
        ...prev,
        isDownloading: false,
        isInstalling: false,
        error: 'Update failed. Please try again.'
      }))
    }
  }

  // Check for updates periodically
  useEffect(() => {
    checkForUpdates()
    const interval = setInterval(checkForUpdates, 3600000) // Check every hour
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="settings-section">
      <h2>Software Update</h2>

      <div className="update-info">
        <div className="version-info">
          <div className="current-version">
            <p>
              Current Version: <strong>{updateStatus.currentVersion}</strong>
            </p>
            <p className="commit-hash">
              Latest Commit: <code>{updateStatus.latestCommit || 'Unknown'}</code>
            </p>
          </div>

          <a
            href="https://github.com/jason090687/myapp"
            target="_blank"
            rel="noopener noreferrer"
            className="github-link"
          >
            <FaGithub /> View on GitHub
          </a>
        </div>

        {updateStatus.isChecking ? (
          <div className="checking-updates">
            <FaCog className="spinning" />
            <p>Checking for updates...</p>
          </div>
        ) : updateStatus.hasUpdate ? (
          <div className="update-available">
            <h3>Update Available!</h3>

            <div className="update-notes">
              <h4>Recent Changes:</h4>
              <ul>
                {updateStatus.changes.map((change, index) => (
                  <li key={index}>
                    <p>{change.message}</p>
                    <small>{new Date(change.date).toLocaleDateString()}</small>
                  </li>
                ))}
              </ul>
            </div>

            {updateStatus.isDownloading || updateStatus.isInstalling ? (
              <div className="update-progress">
                <div className="progress-bar-wrapper">
                  <div
                    className="progress-bar"
                    style={{ width: `${updateStatus.downloadProgress}%` }}
                  />
                </div>
                <p>
                  {updateStatus.isDownloading ? 'Downloading update...' : 'Installing update...'}
                  {updateStatus.downloadProgress}%
                </p>
              </div>
            ) : (
              <button
                className="download-btn"
                onClick={downloadAndInstallUpdate}
                disabled={updateStatus.isDownloading || updateStatus.isInstalling}
              >
                <FaDownload /> Download and Install Update
              </button>
            )}
          </div>
        ) : (
          <div className="up-to-date">
            <FaCheck className="check-icon" />
            <p>Your software is up to date!</p>
          </div>
        )}

        {updateStatus.error && (
          <div className="update-error">
            <p>{updateStatus.error}</p>
            <button onClick={checkForUpdates}>Try Again</button>
          </div>
        )}

        <button
          className="check-updates-btn"
          onClick={checkForUpdates}
          disabled={updateStatus.isChecking}
        >
          Check for Updates
        </button>
      </div>
    </div>
  )
}

export default SoftwareUpdate
