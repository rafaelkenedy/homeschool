const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getUsers: () => ipcRenderer.invoke('db:getUsers'),
  createUser: (user) => ipcRenderer.invoke('db:createUser', user),
  incrementClick: (userId, letter) => ipcRenderer.invoke('db:incrementClick', { userId, letter }),
  getWritingTasks: () => ipcRenderer.invoke('db:getWritingTasks'),
  getWritingProgress: (userId) => ipcRenderer.invoke('db:getWritingProgress', { userId }),
  saveWritingProgress: (userId, taskId, completed) => ipcRenderer.invoke('db:saveWritingProgress', { userId, taskId, completed }),
  getMatchLetterRounds: () => ipcRenderer.invoke('db:getMatchLetterRounds'),
  getMatchLetterProgress: (userId) => ipcRenderer.invoke('db:getMatchLetterProgress', { userId }),
  saveMatchLetterProgress: (userId, roundId, completed) => ipcRenderer.invoke('db:saveMatchLetterProgress', { userId, roundId, completed }),
  getMatchWordRounds: () => ipcRenderer.invoke('db:getMatchWordRounds'),
  getMatchWordProgress: (userId) => ipcRenderer.invoke('db:getMatchWordProgress', { userId }),
  saveMatchWordProgress: (userId, roundId, completed) => ipcRenderer.invoke('db:saveMatchWordProgress', { userId, roundId, completed }),
});

