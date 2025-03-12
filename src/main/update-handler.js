const { ipcMain } = require('electron')
const { execSync, spawn } = require('child_process')
const path = require('path')
const fs = require('fs')
const https = require('https')

class UpdateHandler {
  constructor(mainWindow) {
    this.mainWindow = mainWindow
    this.setupHandlers()
    this.repoUrl = 'https://api.github.com/repos/jason090687/myapp'
  }

  setupHandlers() {
    ipcMain.handle('check-for-updates', () => this.checkForUpdates())
    ipcMain.handle('download-update', () => this.downloadUpdate())
    ipcMain.handle('apply-update', (event, updateData) => this.applyUpdate(updateData))
    ipcMain.handle('rebuild-application', () => this.rebuildApplication())
  }

  async checkForUpdates() {
    try {
      const localVersion = this.getCurrentVersion()
      const remoteData = await this.fetchGitHubData()

      const hasUpdate = remoteData.sha !== localVersion

      return {
        hasUpdate,
        latestCommit: remoteData.sha,
        changes: remoteData.commits || [],
        currentVersion: localVersion
      }
    } catch (error) {
      console.error('Update check failed:', error)
      throw error
    }
  }

  async downloadUpdate() {
    try {
      // Pull latest changes
      execSync('git pull origin main', {
        cwd: process.cwd(),
        stdio: 'inherit'
      })

      return { success: true }
    } catch (error) {
      console.error('Download failed:', error)
      throw error
    }
  }

  async applyUpdate(updateData) {
    try {
      // Install new dependencies
      execSync('npm install', {
        cwd: process.cwd(),
        stdio: 'inherit'
      })

      // Rebuild the application
      await this.rebuildApplication()

      return { success: true }
    } catch (error) {
      console.error('Update application failed:', error)
      throw error
    }
  }

  async rebuildApplication() {
    return new Promise((resolve, reject) => {
      const build = spawn('npm', ['run', 'build'], {
        cwd: process.cwd(),
        stdio: 'pipe'
      })

      build.stdout.on('data', (data) => {
        const progress = this.parseProgress(data.toString())
        if (progress) {
          this.mainWindow.webContents.send('update-progress', progress)
        }
      })

      build.on('close', (code) => {
        if (code === 0) {
          this.mainWindow.webContents.send('update-complete', { success: true })
          resolve({ success: true })
        } else {
          reject(new Error(`Build failed with code ${code}`))
        }
      })
    })
  }

  getCurrentVersion() {
    try {
      return execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim()
    } catch (error) {
      console.error('Failed to get current version:', error)
      return null
    }
  }

  async fetchGitHubData() {
    const options = {
      headers: {
        'User-Agent': 'MyApp-UpdateChecker',
        Accept: 'application/vnd.github.v3+json'
      }
    }

    return new Promise((resolve, reject) => {
      https
        .get(`${this.repoUrl}/commits`, options, (res) => {
          let data = ''
          res.on('data', (chunk) => (data += chunk))
          res.on('end', () => {
            try {
              const commits = JSON.parse(data)
              resolve({
                sha: commits[0].sha,
                commits: commits.map((commit) => ({
                  message: commit.commit.message,
                  date: commit.commit.author.date
                }))
              })
            } catch (error) {
              reject(error)
            }
          })
        })
        .on('error', reject)
    })
  }

  parseProgress(output) {
    // Add custom logic to parse build output and estimate progress
    // This is a simple example
    if (output.includes('Building')) return 25
    if (output.includes('Bundling')) return 50
    if (output.includes('Optimizing')) return 75
    if (output.includes('Done')) return 100
    return null
  }
}

module.exports = UpdateHandler
