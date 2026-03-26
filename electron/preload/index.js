const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('api', {
  send: (channel, data) => {
    const validChannels = ['save-pdf', 'ping']
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data)
    }
  },

  invoke: (channel, data) => {
    const validChannels = ['print-ledger']
    if (validChannels.includes(channel)) {
      return ipcRenderer.invoke(channel, data)
    }
    return Promise.reject(new Error(`Invalid invoke channel: ${channel}`))
  },

  receive: (channel, func) => {
    const validChannels = ['update-status', 'update-progress']
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (event, ...args) => func(...args))
    }
  }
})