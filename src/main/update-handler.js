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
      // Get npm path based on platform
      const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm'
      const npmPath = this.getNpmPath(npmCmd)

      if (!npmPath) {
        reject(new Error('Could not find npm installation'))
        return
      }

      const build = spawn(npmPath, ['run', 'build'], {
        cwd: process.cwd(),
        stdio: 'pipe',
        shell: true,
        env: { ...process.env, PATH: this.getEnhancedPath() }
      })

      let buildOutput = ''

      build.stdout.on('data', (data) => {
        buildOutput += data.toString()
        const progress = this.parseProgress(data.toString())
        if (progress) {
          this.mainWindow.webContents.send('update-progress', progress)
        }
      })

      build.stderr.on('data', (data) => {
        console.error(`Build error: ${data}`)
        buildOutput += data.toString()
      })

      build.on('error', (error) => {
        console.error('Failed to start build process:', error)
        reject(new Error(`Build process failed to start: ${error.message}`))
      })

      build.on('close', (code) => {
        if (code === 0) {
          this.mainWindow.webContents.send('update-complete', { success: true })
          resolve({ success: true, output: buildOutput })
        } else {
          const errorMessage = `Build failed with code ${code}\nOutput: ${buildOutput}`
          console.error(errorMessage)
          reject(new Error(errorMessage))
        }
      })
    })
  }

  getNpmPath(npmCmd) {
    try {
      // Try to get npm path from where Node is installed
      const nodePath = process.execPath
      const nodeDir = path.dirname(nodePath)

      const possiblePaths = [
        // Try node_modules/.bin first
        path.join(process.cwd(), 'node_modules', '.bin', npmCmd),
        // Then try npm next to node
        path.join(nodeDir, npmCmd),
        // Then try npm in standard locations
        process.platform === 'win32'
          ? path.join(process.env.APPDATA, 'npm', npmCmd)
          : '/usr/local/bin/npm',
        // Finally try global npm
        execSync('which npm', { encoding: 'utf8' }).trim()
      ]

      for (const npmPath of possiblePaths) {
        if (fs.existsSync(npmPath)) {
          return npmPath
        }
      }

      // If we can't find npm, try to use it from PATH
      return npmCmd
    } catch (error) {
      console.error('Error finding npm path:', error)
      return npmCmd
    }
  }

  getEnhancedPath() {
    const paths = [
      // Add node_modules/.bin to PATH
      path.join(process.cwd(), 'node_modules', '.bin'),
      // Add potential npm locations
      path.join(process.execPath, '..'),
      process.platform === 'win32' ? path.join(process.env.APPDATA, 'npm') : '/usr/local/bin',
      // Keep existing PATH
      process.env.PATH
    ]

    return paths.join(path.delimiter)
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
