const { contextBridge, ipcRenderer } = require('electron')
const { electronAPI } = require('@electron-toolkit/preload')

// Combine all electron APIs into one object
const exposedApi = {
  ...electronAPI,
  ipcRenderer: {
    send: (channel, data) => {
      const validChannels = ['save-pdf']
      if (validChannels.includes(channel)) {
        ipcRenderer.send(channel, data)
      }
    },
    invoke: (channel, ...args) => {
      return Promise.reject(new Error(`Invalid channel: ${channel}`))
    }
  }
}

// Only expose if context isolation is enabled
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', exposedApi)
    contextBridge.exposeInMainWorld('api', {})
  } catch (error) {
    console.error('Failed to expose APIs:', error)
  }
} else {
  window.electron = exposedApi
  window.api = {}
}
