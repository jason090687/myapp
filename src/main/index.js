import { app, shell, BrowserWindow, ipcMain, screen } from 'electron'
import path, { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import fs from 'fs'
import { dialog } from 'electron'

// Define icon path properly for different platforms
const iconPath =
  process.platform === 'win32'
    ? path.join(__dirname, '../../build/icon.ico')
    : path.join(__dirname, '../../build/icon.png')

function createWindow() {
  // Define fixed dimensions
  const WINDOW_WIDTH = 1366
  const WINDOW_HEIGHT = 768

  const mainWindow = new BrowserWindow({
    width: WINDOW_WIDTH,
    height: WINDOW_HEIGHT,
    title: 'SHJMS eLibrary',
    icon: iconPath,
    fullscreen: false,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  // Center the window
  mainWindow.center()

  mainWindow.on('ready-to-show', () => {
    mainWindow.maximize()
    mainWindow.show()
  })

  mainWindow.webContents.once('did-finish-load', () => {
    mainWindow.setTitle('SHJMS eLibrary')
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // Add screen change listener
  screen.on('display-metrics-changed', () => {
    if (!mainWindow.isFullScreen()) {
      const newSize = calculateWindowSize()
      mainWindow.setSize(newSize.width, newSize.height)
      mainWindow.center()
    }
  })

  // Handle display addition/removal
  screen.on('display-added', () => {
    if (!mainWindow.isFullScreen()) {
      mainWindow.center()
    }
  })

  screen.on('display-removed', () => {
    if (!mainWindow.isFullScreen()) {
      mainWindow.center()
    }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  // Add this with your other IPC handlers
  ipcMain.on('save-pdf', async (event, { buffer, fileName }) => {
    try {
      const { filePath } = await dialog.showSaveDialog({
        defaultPath: path.join(app.getPath('documents'), fileName),
        filters: [{ name: 'PDF Documents', extensions: ['pdf'] }]
      })

      if (filePath) {
        // Convert array back to Buffer
        const pdfBuffer = Buffer.from(buffer)
        fs.writeFileSync(filePath, pdfBuffer)
      }
    } catch (error) {
      console.error('Error saving PDF:', error)
    }
  })

  // Add this to your existing ipcMain handlers
  ipcMain.handle('install-update', async (event, updateData) => {
    try {
      const { app } = require('electron')
      const fs = require('fs')
      const path = require('path')

      // Create updates directory if it doesn't exist
      const updateDir = path.join(app.getPath('userData'), 'updates')
      if (!fs.existsSync(updateDir)) {
        fs.mkdirSync(updateDir)
      }

      // Save the update file
      const updatePath = path.join(updateDir, 'update.zip')
      fs.writeFileSync(updatePath, Buffer.from(updateData))

      // Extract and apply update
      const AdmZip = require('adm-zip')
      const zip = new AdmZip(updatePath)
      zip.extractAllTo(app.getAppPath(), true)

      // Clean up
      fs.unlinkSync(updatePath)

      return true
    } catch (error) {
      console.error('Failed to install update:', error)
      throw error
    }
  })

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
