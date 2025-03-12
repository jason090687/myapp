const { contextBridge, ipcRenderer } = require('electron')
const { electronAPI } = require('@electron-toolkit/preload')

// Combine all electron APIs into one object
const exposedApi = {
  ...electronAPI,
  ipcRenderer: {
    send: (channel, data) => {
      const validChannels = ['save-pdf', 'app:restart']
      if (validChannels.includes(channel)) {
        ipcRenderer.send(channel, data)
      }
    },
    invoke: (channel, ...args) => {
      const validChannels = ['check-for-updates', 'download-update', 'apply-update']
      if (validChannels.includes(channel)) {
        return ipcRenderer.invoke(channel, ...args)
      }
      return Promise.reject(new Error(`Invalid channel: ${channel}`))
    },
    on: (channel, callback) => {
      const validChannels = ['update-status', 'update-progress', 'update-complete']
      if (validChannels.includes(channel)) {
        ipcRenderer.on(channel, (_, ...args) => callback(...args))
      }
    },
    removeAllListeners: (channel) => {
      const validChannels = ['update-status', 'update-progress', 'update-complete']
      if (validChannels.includes(channel)) {
        ipcRenderer.removeAllListeners(channel)
      }
    }
  },
  updateChecker: {
    checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
    downloadUpdate: () => ipcRenderer.invoke('download-update'),
    applyUpdate: () => ipcRenderer.invoke('apply-update'),
    restart: () => ipcRenderer.send('app:restart'),
    onUpdateStatus: (callback) => {
      ipcRenderer.on('update-status', (_, data) => callback(data))
    },
    onUpdateProgress: (callback) => {
      ipcRenderer.on('update-progress', (_, data) => callback(data))
    },
    rebuildApplication: () => ipcRenderer.invoke('rebuild-application'),
    onRebuildComplete: (callback) => {
      ipcRenderer.on('rebuild-complete', (_, data) => callback(data))
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
