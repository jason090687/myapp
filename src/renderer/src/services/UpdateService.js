import axios from 'axios'

const GITHUB_API = 'https://api.github.com/repos/jason090687/myapp'
const CURRENT_VERSION = '1.0.0' // Store this in your env or config

export class UpdateService {
  static async checkForUpdates() {
    try {
      const response = await axios.get(`${GITHUB_API}/commits/main`)
      const latestCommit = response.data.sha
      const currentCommit = localStorage.getItem('currentCommit')

      if (latestCommit !== currentCommit) {
        const commits = await axios.get(`${GITHUB_API}/commits?per_page=10`)
        const changes = commits.data.map((commit) => ({
          message: commit.commit.message,
          date: commit.commit.author.date
        }))

        return {
          hasUpdate: true,
          latestCommit,
          changes
        }
      }

      return { hasUpdate: false }
    } catch (error) {
      console.error('Failed to check for updates:', error)
      throw new Error('Update check failed')
    }
  }

  static async downloadUpdate() {
    try {
      const response = await axios.get(`${GITHUB_API}/zipball/main`, {
        responseType: 'blob'
      })

      return response.data
    } catch (error) {
      console.error('Failed to download update:', error)
      throw new Error('Update download failed')
    }
  }

  static async applyUpdate(updateData) {
    try {
      // Here you would typically:
      // 1. Extract the downloaded zip
      // 2. Back up current files
      // 3. Replace with new files
      // 4. Update the stored commit hash
      localStorage.setItem('currentCommit', updateData.latestCommit)
      return true
    } catch (error) {
      console.error('Failed to apply update:', error)
      throw new Error('Update installation failed')
    }
  }
}
