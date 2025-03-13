import { app, shell, BrowserWindow, ipcMain, screen } from 'electron'
import path, { join } from 'path'
import { electronApp, optimizer } from '@electron-toolkit/utils'
import fs from 'fs'

const iconPath =
  process.platform === 'win32'
    ? path.join(__dirname, '../../build/ico.ico')
    : path.join(__dirname, '../../build/icon.png')

// Define paths object
const paths = {
  preload: path.join(__dirname, '../preload')
}

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
      preload: join(__dirname, '../preload/index.js'), // Updated preload path
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false,
      webviewTag: true // Enable webview
    }
  })

  // Center the window
  mainWindow.center()

  // Load the app
  if (process.env.VITE_DEV_SERVER_URL) {
    console.log('Loading development server...')
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools() // Open DevTools in development
  } else {
    const indexPath = path.join(__dirname, '../renderer/index.html')
    console.log('Loading production file from:', indexPath)
    if (fs.existsSync(indexPath)) {
      mainWindow.loadFile(indexPath)
    } else {
      console.error('Could not find index.html at:', indexPath)
      mainWindow.loadURL('http://localhost:5173')
    }
  }

  // Handle loading errors
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Failed to load:', errorCode, errorDescription)
    const currentURL = mainWindow.webContents.getURL()
    console.log('Attempted to load URL:', currentURL)

    // Retry loading after a short delay
    setTimeout(() => {
      if (process.env.VITE_DEV_SERVER_URL) {
        console.log('Retrying with dev server...')
        mainWindow.loadURL('http://localhost:5173')
      } else {
        console.log('Retrying with file...')
        const indexPath = path.join(__dirname, '../renderer/index.html')
        if (fs.existsSync(indexPath)) {
          mainWindow.loadFile(indexPath)
        }
      }
    }, 1000)
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
