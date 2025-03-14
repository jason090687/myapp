import { ipcMain, app } from 'electron'
import { execSync } from 'child_process'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'

// Load environment variables
dotenv.config()

class UpdateHandler {
  constructor(mainWindow) {
    this.mainWindow = mainWindow
    this.removeExistingHandlers()
    this.setupHandlers()
  }

  removeExistingHandlers() {
    ipcMain.removeHandler('rebuild-application')
  }

  setupHandlers() {
    // Manual rebuild
    ipcMain.handle('rebuild-application', async () => {
      try {
        const appPath = app.getAppPath()
        const result = await this.performRebuild(appPath)
        return { success: true, ...result }
      } catch (error) {
        console.error('Rebuild failed:', error)
        throw error
      }
    })
  }

  cleanBuildDirectories(appPath) {
    const dirsToClean = ['out', 'dist', 'build']

    dirsToClean.forEach((dir) => {
      const dirPath = path.join(appPath, dir)
      if (fs.existsSync(dirPath)) {
        fs.rmSync(dirPath, { recursive: true, force: true })
        console.log(`Cleaned ${dir} directory`)
      }
    })
  }

  async performRebuild(appPath) {
    try {
      // Clean build directories first
      this.cleanBuildDirectories(appPath)

      // Pull latest changes
      execSync('git pull origin main', {
        cwd: appPath,
        stdio: 'pipe'
      })

      // Install dependencies
      execSync('npm install', {
        cwd: appPath,
        stdio: 'pipe'
      })

      // Only build in production mode
      if (!process.env.VITE_DEV_SERVER_URL) {
        execSync('npm run build', {
          cwd: appPath,
          stdio: 'pipe'
        })
      }

      return { success: true }
    } catch (error) {
      throw error
    }
  }
}

export default UpdateHandler
