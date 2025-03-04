import { app, shell, BrowserWindow, ipcMain, screen } from 'electron'
import path, { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'

function calculateWindowSize() {
  const primaryDisplay = screen.getPrimaryDisplay()
  const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize
  return {
    width: Math.floor(screenWidth * 0.8),
    height: Math.floor(screenHeight * 0.8)
  }
}

function createWindow() {
  const windowSize = calculateWindowSize()

  const mainWindow = new BrowserWindow({
    width: 1366,
    height: 768,
    title: 'SHJMS eLibrary',
    icon: path.join(__dirname, '../../src/renderer/src/assets/icon.ico'),
    fullscreen: false,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
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
