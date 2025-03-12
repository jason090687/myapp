import axios from 'axios'

const GITHUB_API_URL = 'https://api.github.com/repos/jason090687/myapp'
const CURRENT_VERSION = '1.0.0'
const MAX_RETRIES = 3
const RETRY_DELAY = 1000

class UpdateService {
  static instance = axios.create({
    baseURL: 'https://api.github.com',
    headers: {
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json'
    },
    timeout: 15000 // Increased timeout
  })

  static async retryRequest(fn, retries = MAX_RETRIES) {
    try {
      return await fn()
    } catch (error) {
      if (retries > 0) {
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY))
        return this.retryRequest(fn, retries - 1)
      }
      throw error
    }
  }

  static async checkForDeployment() {
    try {
      const { data: deployments } = await axios.get(`${GITHUB_API_URL}/deployments`, {
        headers: { Accept: 'application/vnd.github.v3+json' }
      })
      return deployments[0] || null
    } catch (error) {
      console.error('Failed to check deployment:', error)
      throw error
    }
  }

  static owner = 'jason090687'
  static repo = 'myapp'

  static async checkForUpdates() {
    try {
      // Verify electron and updateChecker exist
      if (!window?.electron?.updateChecker) {
        console.error('Update service not available:', {
          hasElectron: !!window.electron,
          hasUpdateChecker: !!(window.electron && window.electron.updateChecker)
        })
        throw new Error('Update service not initialized')
      }
      const result = await window.electron.updateChecker.checkForUpdates()
      return result
    } catch (error) {
      console.error('Check for updates failed:', error)
      throw error
    }
  }

  static async downloadUpdate() {
    if (!window?.electron?.updateChecker) {
      throw new Error('Update service not initialized')
    }
    return await window.electron.updateChecker.downloadUpdate()
  }

  static async applyUpdate(updateData) {
    if (!window?.electron?.updateChecker) {
      throw new Error('Update service not initialized')
    }
    return await window.electron.updateChecker.applyUpdate(updateData)
  }

  static restart() {
    if (!window?.electron?.updateChecker) {
      throw new Error('Update service not initialized')
    }
    window.electron.updateChecker.restart()
  }

  static onUpdateStatus(callback) {
    if (window?.electron?.on) {
      window.electron.on('update-status', callback)
    }
  }

  static onUpdateProgress(callback) {
    if (window?.electron?.on) {
      window.electron.on('update-progress', callback)
    }
  }

  static cleanupListeners() {
    if (window?.electron?.removeAllListeners) {
      window.electron.removeAllListeners('update-status')
      window.electron.removeAllListeners('update-progress')
      window.electron.removeAllListeners('update-complete')
    }
  }

  static getErrorMessage(error) {
    if (error.message === 'Update service not initialized') {
      return 'Update service is not available. Please restart the application.'
    }
    if (error.response) {
      // Server responded with error
      if (error.response.status === 403) {
        return 'Rate limit exceeded. Please try again later.'
      }
      if (error.response.status === 404) {
        return 'Repository not found.'
      }
      return error.response.data.message || 'Server error occurred.'
    }
    if (error.request) {
      // Request made but no response
      return 'Network error. Please check your connection.'
    }
    // Something else went wrong
    return 'Failed to check for updates.'
  }

  static async rebuildApplication() {
    if (!window?.electron?.updateChecker) {
      throw new Error('Update service not initialized')
    }
    try {
      // Save any necessary state to persist across rebuild
      localStorage.setItem('rebuildInProgress', 'true')

      const result = await window.electron.updateChecker.rebuildApplication()

      if (!result.success) {
        throw new Error('Rebuild failed')
      }

      return result
    } catch (error) {
      console.error('Rebuild failed:', error)
      localStorage.removeItem('rebuildInProgress')
      throw error
    }
  }

  static isRebuildInProgress() {
    return localStorage.getItem('rebuildInProgress') === 'true'
  }

  static clearRebuildState() {
    localStorage.removeItem('rebuildInProgress')
  }

  static async rebuildApplication() {
    try {
      await window.Electron.ipcRenderer.invoke('rebuild-application')
    } catch (error) {
      throw new Error('Failed to rebuild application')
    }
  }

  static onUpdateComplete(callback) {
    window.Electron.ipcRenderer.on('update-complete', callback)
  }

  static getUpdateHistory() {
    return {
      lastUpdate: localStorage.getItem('lastUpdateCheck'),
      currentCommit: localStorage.getItem('currentCommit'),
      version: CURRENT_VERSION
    }
  }

  static async getLatestCommitInfo() {
    try {
      const response = await this.instance.get('/repos/jason090687/myapp/commits/main')
      return {
        sha: response.data.sha,
        message: response.data.commit.message,
        date: response.data.commit.author.date
      }
    } catch (error) {
      console.error('Failed to get latest commit:', error)
      throw new Error('Failed to get latest commit information')
    }
  }
}

export { UpdateService }
