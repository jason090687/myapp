const { app, BrowserWindow, session } = require('electron')
const path = require('path')

async function createWindow() {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, '../preload/index.mjs'),
      webSecurity: true,
      // devTools: true,
      spellcheck: true
    }
  })

  // Add CORS headers handling
  session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
    const { requestHeaders } = details
    requestHeaders['Origin'] = 'https://github.com'
    callback({ requestHeaders })
  })

  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Access-Control-Allow-Origin': ['*'],
        'Access-Control-Allow-Headers': ['*']
      }
    })
  })

  // Remove or comment out the existing CSP configuration block
  // win.webContents.session.webRequest.onHeadersReceived((details, callback) => {
  //   ...
  // })

  // Disable Autofill warnings
  mainWindow.webContents.on('did-finish-load', () => {
    win.webContents.executeJavaScript(`
      delete window.navigator.serviceWorker;
      delete window.Autofill;
    `)
  })

  // Load the app
  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL)
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  return win
}

process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'

app.whenReady().then(createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})
