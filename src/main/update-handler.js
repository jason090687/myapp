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
    this.isWindows = process.platform === 'win32'
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
      if (this.isWindows) {
        // Create a batch file for Windows update
        const batchContent = `
@echo off
timeout /t 2 /nobreak > nul
cd "${process.cwd()}"
call npm install
if %errorlevel% neq 0 exit /b %errorlevel%
call npm run build
if %errorlevel% neq 0 exit /b %errorlevel%
exit /b 0
        `.trim()

        const batchPath = path.join(process.cwd(), 'update.bat')
        fs.writeFileSync(batchPath, batchContent)

        // Execute batch file with elevated privileges on Windows
        const updateProcess = spawn(
          'powershell.exe',
          ['Start-Process', '-FilePath', batchPath, '-Verb', 'RunAs', '-Wait'],
          {
            windowsHide: true,
            stdio: 'pipe'
          }
        )

        return new Promise((resolve, reject) => {
          updateProcess.on('close', (code) => {
            fs.unlinkSync(batchPath) // Clean up batch file
            if (code === 0) {
              resolve({ success: true })
            } else {
              reject(new Error(`Update failed with code ${code}`))
            }
          })
        })
      } else {
        // Original update process for non-Windows
        return await this.standardUpdate()
      }
    } catch (error) {
      console.error('Update application failed:', error)
      throw error
    }
  }

  async standardUpdate() {
    try {
      // Install dependencies
      execSync('npm install', {
        cwd: process.cwd(),
        stdio: 'inherit'
      })

      // Rebuild application
      await this.rebuildApplication()
      return { success: true }
    } catch (error) {
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
    if (this.isWindows) {
      const possiblePaths = [
        // npm in PATH
        'npm.cmd',
        // npm in AppData
        path.join(process.env.APPDATA, 'npm', 'npm.cmd'),
        // npm next to node
        path.join(path.dirname(process.execPath), 'npm.cmd'),
        // npm in Program Files
        path.join(process.env['ProgramFiles'], 'nodejs', 'npm.cmd'),
        path.join(process.env['ProgramFiles(x86)'], 'nodejs', 'npm.cmd'),
        // Local project npm
        path.join(process.cwd(), 'node_modules', '.bin', 'npm.cmd')
      ]

      for (const npmPath of possiblePaths) {
        if (fs.existsSync(npmPath)) {
          return npmPath
        }
      }

      return 'npm.cmd' // fallback
    }

    // Original logic for non-Windows
    return super.getNpmPath(npmCmd)
  }

  getEnhancedPath() {
    if (this.isWindows) {
      const paths = [
        // Windows-specific paths
        path.join(process.cwd(), 'node_modules', '.bin'),
        path.join(process.env.APPDATA, 'npm'),
        path.join(process.env['ProgramFiles'], 'nodejs'),
        path.join(process.env['ProgramFiles(x86)'], 'nodejs'),
        // Keep existing PATH
        process.env.PATH
      ].filter(Boolean) // Remove any undefined paths

      return paths.join(path.delimiter)
    }

    // Original logic for non-Windows
    return super.getEnhancedPath()
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
