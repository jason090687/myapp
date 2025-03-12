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

  static async checkForUpdates() {
    try {
      const response = await window.electron.ipcRenderer.invoke('check-for-updates')
      return response
    } catch (error) {
      throw new Error('Failed to check for updates')
    }
  }

  static async downloadUpdate() {
    try {
      const response = await window.electron.ipcRenderer.invoke('download-update')
      return response
    } catch (error) {
      throw new Error('Failed to download update')
    }
  }

  static async applyUpdate(updateData) {
    try {
      await window.electron.ipcRenderer.invoke('apply-update', updateData)
    } catch (error) {
      throw new Error('Failed to apply update')
    }
  }

  static async rebuildApplication() {
    try {
      await window.electron.ipcRenderer.invoke('rebuild-application')
    } catch (error) {
      throw new Error('Failed to rebuild application')
    }
  }

  static onUpdateProgress(callback) {
    window.electron.ipcRenderer.on('update-progress', callback)
  }

  static onUpdateComplete(callback) {
    window.electron.ipcRenderer.on('update-complete', callback)
  }

  static getErrorMessage(error) {
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
