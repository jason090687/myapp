import { ipcMain, app } from 'electron'
import { execSync, spawn } from 'child_process'
import { join, dirname } from 'path'
import fs from 'fs'
import https from 'https'
import os from 'os'
import { paths } from './utils/paths.js'

class UpdateHandler {
  constructor(mainWindow) {
    this.mainWindow = mainWindow
    this.setupHandlers()
    this.repoUrl = 'https://api.github.com/repos/jason090687/myapp' // Verified GitHub repo URL
    this.isWindows = os.platform() === 'win32'
    this.appPath = paths.root
    this.userDataPath = app.getPath('userData')
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
        return await this.applyWindowsUpdate()
      }
      return await this.standardUpdate()
    } catch (error) {
      console.error('Update application failed:', error)
      throw error
    }
  }

  async applyWindowsUpdate() {
    const updateDir = join(this.userDataPath, 'updates')
    const batchPath = join(updateDir, 'update.bat')

    try {
      // Ensure update directory exists
      if (!fs.existsSync(updateDir)) {
        fs.mkdirSync(updateDir, { recursive: true })
      }

      // Create batch file content with error handling
      const batchContent = `
@echo off
echo Starting update process...
cd /d "%~dp0"
cd "${this.appPath.replace(/\\/g, '\\\\')}"

echo Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo Failed to install dependencies
    exit /b %errorlevel%
)

echo Building application...
call npm run build
if %errorlevel% neq 0 (
    echo Failed to build application
    exit /b %errorlevel%
)

echo Update completed successfully
exit /b 0
`.trim()

      // Write batch file
      fs.writeFileSync(batchPath, batchContent)

      // Execute batch file with elevated privileges
      const updateProcess = spawn(
        'powershell.exe',
        [
          '-Command',
          `Start-Process -FilePath '${batchPath}' -Verb RunAs -Wait -WindowStyle Hidden`
        ],
        {
          windowsHide: true,
          stdio: 'pipe',
          shell: true
        }
      )

      return new Promise((resolve, reject) => {
        let output = ''

        updateProcess.stdout?.on('data', (data) => {
          output += data.toString()
          console.log('Update output:', data.toString())
        })

        updateProcess.stderr?.on('data', (data) => {
          output += data.toString()
          console.error('Update error:', data.toString())
        })

        updateProcess.on('error', (error) => {
          console.error('Failed to start update process:', error)
          reject(error)
        })

        updateProcess.on('close', (code) => {
          try {
            // Clean up batch file
            if (fs.existsSync(batchPath)) {
              fs.unlinkSync(batchPath)
            }

            if (code === 0) {
              resolve({ success: true, output })
            } else {
              reject(new Error(`Update failed with code ${code}\nOutput: ${output}`))
            }
          } catch (error) {
            reject(error)
          }
        })
      })
    } catch (error) {
      // Clean up on error
      if (fs.existsSync(batchPath)) {
        fs.unlinkSync(batchPath)
      }
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

  getNpmPath() {
    if (this.isWindows) {
      const possiblePaths = [
        join(this.appPath, 'node_modules', '.bin', 'npm.cmd'),
        join(app.getPath('appData'), 'npm', 'npm.cmd'),
        join(os.homedir(), 'AppData', 'Roaming', 'npm', 'npm.cmd'),
        'npm.cmd' // fallback to PATH
      ]

      return possiblePaths.find((npmPath) => fs.existsSync(npmPath)) || 'npm.cmd'
    }

    return 'npm'
  }

  getEnhancedPath() {
    const paths = [
      join(this.appPath, 'node_modules', '.bin'),
      dirname(this.getNpmPath()),
      this.isWindows ? join(app.getPath('appData'), 'npm') : '/usr/local/bin',
      process.env.PATH
    ].filter(Boolean)

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

export default UpdateHandler
