import { app, shell, BrowserWindow, ipcMain, screen, dialog } from 'electron'
import path from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import fs from 'fs'

const { session } = require('electron')

const iconPath =
  process.platform === 'win32'
    ? path.join(__dirname, '../../build/ico.ico')
    : path.join(__dirname, '../../build/icon.png')

function createWindow() {
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
      preload: path.join(__dirname, '../preload/index.mjs'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false,
      webviewTag: false,
      allowRunningInsecureContent: false,
      experimentalFeatures: false,
      enableBlinkFeatures: false,
      devTools: !app.isPackaged // Disable DevTools in production
    }
  })

  // Center the window
  mainWindow.center()

  // Load the app
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
    // mainWindow.webContents.openDevTools()
  } else {
    const indexPath = path.join(__dirname, '../renderer/index.html')
    console.log('Loading production file from:', indexPath)
    if (fs.existsSync(indexPath)) {
      mainWindow.loadFile(indexPath)
    } else {
      console.error('Could not find index.html at:', indexPath)
    }
  }

  // Add F12 shortcut for DevTools
  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.key === 'F12') {
      mainWindow.webContents.toggleDevTools()
      event.preventDefault()
    }
  })

  // Handle Autofill errors
  mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
    if (message.includes('Autofill')) {
      console.warn('Autofill error:', message)
    }
  })

  // Handle VSync errors
  mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
    if (message.includes('GetVSyncParametersIfAvailable')) {
      console.warn('VSync error:', message)
    }
  })

  // Suppress specific errors
  mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
    if (
      message.includes('Autofill.enable failed') ||
      message.includes('GetVSyncParametersIfAvailable')
    ) {
      event.preventDefault()
    }
  })

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

  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self';" +
            "script-src 'self' 'unsafe-inline';" +
            "style-src 'self' 'unsafe-inline';" +
            "connect-src 'self' http://localhost:* ws://localhost:* http://192.168.0.145:* http://192.168.2.175:* http://countmein.pythonanywhere.com https://api.github.com https://raw.githubusercontent.com;" +
            "img-src 'self' data: https: blob: http://192.168.0.145:8000 http://192.168.0.145:* http://192.168.0.145:8000; http://192.168.2.175:* http://192.168.2.175:8000; http://countmein.pythonanywhere.com:* http://countmein.pythonanywhere.com:8000;" + // Updated this line
            "worker-src 'self' blob:;" +
            "frame-src 'self';" +
            "font-src 'self' data:;" +
            "media-src 'self';" +
            "object-src 'none'"
        ]
      }
    })
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
