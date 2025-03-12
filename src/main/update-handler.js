import { ipcMain, app } from 'electron'
import { execSync } from 'child_process'
import { join, dirname } from 'path'
import fs from 'fs'
import https from 'https'
import os from 'os'
import { paths } from './utils/paths.js'
import dotenv from 'dotenv'
import { autoUpdater } from 'electron-updater'

// Load environment variables
dotenv.config()

class UpdateHandler {
  constructor(mainWindow) {
    this.mainWindow = mainWindow
    this.setupAutoUpdater()
    this.removeExistingHandlers()
    this.setupHandlers()
  }

  removeExistingHandlers() {
    ipcMain.removeHandler('check-for-updates')
    ipcMain.removeHandler('download-update')
    ipcMain.removeHandler('apply-update')
    ipcMain.removeHandler('rebuild-application')
  }

  setupAutoUpdater() {
    autoUpdater.autoDownload = false
    autoUpdater.allowDowngrade = true
    autoUpdater.logger = console
    autoUpdater.setFeedURL({
      owner: 'jason090687',
      repo: 'myapp',
      provider: 'github'
    })

    autoUpdater.on('checking-for-update', () => {
      this.sendStatus('checking')
    })

    autoUpdater.on('update-available', (info) => {
      this.sendStatus('update-available', info)
    })

    autoUpdater.on('update-not-available', (info) => {
      this.sendStatus('up-to-date', info)
    })

    autoUpdater.on('download-progress', (progress) => {
      this.sendProgress(progress)
    })

    autoUpdater.on('update-downloaded', (info) => {
      this.sendStatus('ready', info)
    })

    autoUpdater.on('error', (error) => {
      this.sendStatus('error', error)
    })
  }

  setupHandlers() {
    // Check for updates
    ipcMain.handle('check-for-updates', async () => {
      try {
        const updateCheckResult = await autoUpdater.checkForUpdates()
        return {
          hasUpdate: updateCheckResult?.updateInfo?.version !== app.getVersion(),
          currentVersion: app.getVersion(),
          latestVersion: updateCheckResult?.updateInfo?.version,
          changes: updateCheckResult?.updateInfo?.releaseNotes || []
        }
      } catch (error) {
        console.error('Check for updates failed:', error)
        throw error
      }
    })

    // Download update
    ipcMain.handle('download-update', () => autoUpdater.downloadUpdate())

    // Apply update
    ipcMain.handle('apply-update', () => autoUpdater.quitAndInstall(false, true))

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

  sendStatus(status, data = {}) {
    if (this.mainWindow) {
      this.mainWindow.webContents.send('update-status', { status, data })
    }
  }

  sendProgress(progressData) {
    if (this.mainWindow) {
      this.mainWindow.webContents.send('update-progress', progressData)
    }
  }
}

export default UpdateHandler
