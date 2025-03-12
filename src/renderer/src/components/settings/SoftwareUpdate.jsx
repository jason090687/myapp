import React, { useState, useEffect } from 'react'
import { FiRefreshCw, FiDownload, FiGithub, FiCheck, FiLoader } from 'react-icons/fi'
import { UpdateService } from '../../services/UpdateService'
import toast from 'react-hot-toast'

const SoftwareUpdate = () => {
  const [updateState, setUpdateState] = useState({
    checking: false,
    downloading: false,
    currentVersion: '1.0.0',
    latestVersion: null,
    lastCommit: null,
    hasUpdate: false,
    progress: 0,
    error: null,
    rebuilding: false
  })

  const checkForUpdates = async () => {
    setUpdateState((prev) => ({ ...prev, checking: true, error: null }))
    try {
      const result = await UpdateService.checkForUpdates()
      setUpdateState((prev) => ({
        ...prev,
        checking: false,
        hasUpdate: result.hasUpdate,
        latestVersion: result.latestVersion,
        lastCommit: result.changes[0],
        currentVersion: result.currentVersion
      }))
    } catch (error) {
      console.error('Update check failed:', error)
      setUpdateState((prev) => ({
        ...prev,
        checking: false,
        error: UpdateService.getErrorMessage(error)
      }))
      toast.error('Failed to check for updates')
    }
  }

  const downloadAndInstallUpdate = async () => {
    try {
      setUpdateState((prev) => ({ ...prev, downloading: true }))

      await UpdateService.downloadUpdate()
      await UpdateService.applyUpdate()

      toast.success('Update installed successfully! Restarting...')

      // Use the UpdateService to restart
      setTimeout(() => {
        UpdateService.restart()
      }, 2000)
    } catch (error) {
      console.error('Update installation failed:', error)
      toast.error('Failed to install update')
      setUpdateState((prev) => ({ ...prev, downloading: false, error: error.message }))
    }
  }

  const handleRebuild = async () => {
    try {
      setUpdateState((prev) => ({ ...prev, rebuilding: true }))
      await UpdateService.rebuildApplication()
      toast.success('Application is rebuilding...')
    } catch (error) {
      console.error('Rebuild failed:', error)
      toast.error('Failed to rebuild application')
      setUpdateState((prev) => ({
        ...prev,
        rebuilding: false,
        error: error.message
      }))
    }
  }

  useEffect(() => {
    checkForUpdates()

    // Use the UpdateService's methods for events
    UpdateService.onUpdateStatus((status) => {
      setUpdateState((prev) => ({ ...prev, ...status }))
    })

    UpdateService.onUpdateProgress((progress) => {
      setUpdateState((prev) => ({ ...prev, progress }))
    })

    // Cleanup listeners when component unmounts
    return () => {
      UpdateService.cleanupListeners()
    }
  }, [])

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Software Update</h2>
        <button
          onClick={checkForUpdates}
          disabled={updateState.checking}
          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-800 rounded-md hover:bg-gray-100"
        >
          {updateState.checking ? (
            <FiLoader className="animate-spin" />
          ) : (
            <FiRefreshCw className={updateState.checking ? 'animate-spin' : ''} />
          )}
          Check for Updates
        </button>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Current Version:</span>
          <span className="font-medium">{updateState.currentVersion}</span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Latest Version:</span>
          <span className="font-medium">{updateState.latestVersion || 'Unknown'}</span>
        </div>

        {updateState.lastCommit && (
          <div className="text-sm">
            <span className="text-gray-600">Latest Commit:</span>
            <p className="mt-1 text-gray-800">{updateState.lastCommit.message}</p>
            <p className="text-xs text-gray-500">
              {new Date(updateState.lastCommit.date).toLocaleString()}
            </p>
          </div>
        )}

        <a
          href={`https://github.com/${UpdateService.owner}/${UpdateService.repo}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
        >
          <FiGithub /> View on GitHub
        </a>

        {updateState.error && (
          <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-md">{updateState.error}</div>
        )}

        {updateState.hasUpdate && (
          <div className="mt-6">
            <button
              onClick={downloadAndInstallUpdate}
              disabled={updateState.downloading}
              className="flex items-center justify-center gap-2 w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
            >
              {updateState.downloading ? (
                <>
                  <FiLoader className="animate-spin" />
                  Installing... {updateState.progress}%
                </>
              ) : (
                <>
                  <FiDownload />
                  Download and Install Update
                </>
              )}
            </button>
          </div>
        )}

        <div className="mt-4">
          <button
            onClick={handleRebuild}
            disabled={updateState.rebuilding}
            className="flex items-center justify-center gap-2 w-full py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:bg-gray-400"
          >
            {updateState.rebuilding ? (
              <>
                <FiLoader className="animate-spin" />
                Rebuilding...
              </>
            ) : (
              <>
                <FiRefreshCw />
                Rebuild Application
              </>
            )}
          </button>
        </div>

        {!updateState.hasUpdate && !updateState.error && !updateState.checking && (
          <div className="flex items-center gap-2 text-green-600 mt-4">
            <FiCheck />
            Your software is up to date!
          </div>
        )}
      </div>
    </div>
  )
}

export default SoftwareUpdate
