const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld(
  'electron',
  {
    send: (channel, data) => {
      let validChannels = ['toMain'];
      if (validChannels.includes(channel)) {
        ipcRenderer.send(channel, data);
      }
    },
    receive: (channel, func) => {
      let validChannels = ['fromMain'];
      if (validChannels.includes(channel)) {
        ipcRenderer.on(channel, (event, ...args) => func(...args));
      }
    },
    getImageData: () => ipcRenderer.invoke('get-image-data'),
    importImages: (filePaths, folder) => ipcRenderer.invoke('import-images', { filePaths, folder }),
  }
);
