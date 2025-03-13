import { ipcMain, app } from 'electron'
import { execSync } from 'child_process'
import { paths } from './utils/paths'
import dotenv from 'dotenv'

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

  async performRebuild(appPath) {
    try {
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

      // Rebuild application
      execSync('npm run build', {
        cwd: appPath,
        stdio: 'pipe'
      })

      return { success: true }
    } catch (error) {
      throw error
    }
  }
}

export default UpdateHandler
