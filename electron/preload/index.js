const { contextBridge, ipcRenderer } = require('electron')

// Disable Autofill API warnings
delete window.navigator.serviceWorker
delete window.Autofill

contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform
  // Add any other required APIs here
})

contextBridge.exposeInMainWorld('electron', {
  fetch: async (url, options) => {
    try {
      const response = await fetch(url, options)
      return response
    } catch (error) {
      console.error('Fetch error:', error)
      throw error
    }
  },
  github: {
    checkUpdates: () => ipcRenderer.invoke('check-github-updates'),
    downloadUpdate: () => ipcRenderer.invoke('download-update')
  }
})

window.ALLOWED_ORIGINS = ['http://countmein.pythonanywhere.com']
