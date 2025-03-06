import axios from 'axios'

const GITHUB_API = 'https://api.github.com/repos/jason090687/myapp'
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

  static async checkForUpdates() {
    try {
      // Remove cache-control headers and use simpler request
      const commitResponse = await this.instance.get('/repos/jason090687/myapp/commits/main')
      
      const latestCommit = commitResponse.data
      const currentCommit = localStorage.getItem('currentCommit')

      // Get recent commits without cache headers
      const commitsResponse = await this.instance.get('/repos/jason090687/myapp/commits', {
        params: { 
          sha: 'main',
          per_page: 10
        }
      })

      const recentCommits = commitsResponse.data.map(commit => ({
        message: commit.commit.message,
        date: commit.commit.author.date,
        author: commit.commit.author.name,
        sha: commit.sha.substring(0, 7)
      }))

      return {
        hasUpdate: latestCommit.sha !== currentCommit,
        latestCommit: latestCommit.sha,
        currentCommit,
        changes: recentCommits,
        version: CURRENT_VERSION,
        lastUpdated: latestCommit.commit.author.date
      }
    } catch (error) {
      console.error('GitHub API Error:', error)
      throw new Error(this.getErrorMessage(error))
    }
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

  static async downloadUpdate() {
    try {
      // Get the repository content
      const response = await this.instance.get('/repos/jason090687/myapp/contents', {
        params: { ref: 'main' }
      })

      const files = response.data.map((file) => ({
        name: file.name,
        path: file.path,
        sha: file.sha,
        downloadUrl: file.download_url
      }))

      // Download each file
      const downloads = await Promise.all(
        files.map(async (file) => {
          if (file.downloadUrl) {
            const fileResponse = await axios.get(file.downloadUrl)
            return {
              path: file.path,
              content: fileResponse.data
            }
          }
          return null
        })
      )

      return downloads.filter(Boolean)
    } catch (error) {
      console.error('Download failed:', error)
      throw new Error('Failed to download updates. Please try again.')
    }
  }

  static async applyUpdate(updateData) {
    try {
      // Store the new commit hash
      localStorage.setItem('currentCommit', updateData.latestCommit)
      localStorage.setItem('lastUpdateCheck', new Date().toISOString())

      // Here you would process the downloaded files
      // This is a placeholder for the actual update logic
      console.log('Applying updates...', updateData)

      return {
        success: true,
        updated: new Date().toISOString()
      }
    } catch (error) {
      console.error('Update application failed:', error)
      throw new Error('Failed to apply updates. Please try again.')
    }
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
