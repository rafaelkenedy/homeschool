const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getUsers: () => ipcRenderer.invoke('db:getUsers'),
  createUser: (user) => ipcRenderer.invoke('db:createUser', user),
  incrementClick: (userId, letter) => ipcRenderer.invoke('db:incrementClick', { userId, letter }),
});
