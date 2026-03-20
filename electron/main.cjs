const { app, BrowserWindow, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

function createWindow() {
  const win = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: true,
      contextIsolation: true
    },
  });

  // Check if we are running in dev mode
  const devServerUrl = process.env.VITE_DEV_SERVER_URL;
  if (devServerUrl) {
    win.loadURL(devServerUrl).catch(err => {
      console.error('[main] Failed to load URL:', err);
    });
    win.webContents.openDevTools({ mode: 'detach' });
  } else {
    const indexPath = path.join(__dirname, '../dist/index.html');
    win.loadFile(indexPath).catch(err => {
      console.error('[main] Failed to load file:', err);
    });
    win.webContents.openDevTools({ mode: 'detach' });
  }

  win.webContents.on('did-fail-load', (_event, errorCode, errorDescription, validatedURL) => {
    console.error('[did-fail-load]', { errorCode, errorDescription, validatedURL });
  });

  win.webContents.on('render-process-gone', (_event, details) => {
    console.error('[render-process-gone]', details);
  });

  win.webContents.on('console-message', (_event, level, message, line, sourceId) => {
    console.log(`[renderer:${level}] ${sourceId}:${line} ${message}`);
  });
}

// Wrap in try-catch to catch top-level require errors
try {
  const { initDb, setupIpcHandlers } = require('./database.cjs');

  app.whenReady().then(() => {
    try {
      initDb();
      setupIpcHandlers();
      createWindow();
    } catch (err) {
      console.error('[main] Error during initialization:', err);
      dialog.showErrorBox('Initialization Error', err.message);
    }

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });
  }).catch(err => {
    console.error('[main] Error waiting for app ready:', err);
  });

} catch (err) {
  console.error('[main] Critical error in database module:', err);
  app.whenReady().then(() => {
    dialog.showErrorBox('Critical Error', 'Failed to load database module: ' + err.message);
    createWindow(); // Still try to create window to show something
  });
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

