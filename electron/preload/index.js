import { contextBridge, ipcRenderer } from 'electron'

// Expose protected methods to renderer process
contextBridge.exposeInMainWorld('api', {
  send: (channel, data) => {
    const validChannels = ['save-pdf', 'ping']
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data)
    }
  },
  receive: (channel, func) => {
    const validChannels = ['update-status', 'update-progress']
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (event, ...args) => func(...args))
    }
  }
})

// Custom APIs for renderer
const api = {}

// Add additional context bridge exposure if needed
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', api)
  } catch (error) {
    console.error(error)
  }
}
