const { contextBridge } = require('electron')

// Disable Autofill API warnings
delete window.navigator.serviceWorker
delete window.Autofill

contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform
  // Add any other required APIs here
})

window.ALLOWED_ORIGINS = ['http://countmein.pythonanywhere.com']
