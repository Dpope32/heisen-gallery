const { app, BrowserWindow, ipcMain, protocol, net } = require('electron');
const path = require('path');
const fs = require('fs');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

// Resolve the Images directory (works in both dev and packaged builds)
function getImagesPath() {
  // In packaged app, extraResource puts it in resources/Images
  const prodPath = path.join(process.resourcesPath, 'Images');
  if (app.isPackaged && fs.existsSync(prodPath)) {
    return prodPath;
  }
  // In dev, it's at src/Images relative to project root
  return path.join(app.getAppPath(), 'src', 'Images');
}

// Register custom protocol for serving media files
protocol.registerSchemesAsPrivileged([
  { scheme: 'media', privileges: { bypassCSP: true, stream: true, supportFetchAPI: true } }
]);

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      webSecurity: true,
      autoplayPolicy: 'no-user-gesture-required',
      mediaDevices: true,
      enableBlinkFeatures: 'AutoplayIgnoresWebAudio'
    },
  });

  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  mainWindow.webContents.setAudioMuted(true);
  mainWindow.webContents.setBackgroundThrottling(false);
};

app.on('ready', () => {
  // Register media:// protocol to serve images from the filesystem
  protocol.handle('media', (request) => {
    const filePath = decodeURIComponent(request.url.replace('media://', ''));
    const imagesPath = getImagesPath();
    const fullPath = path.join(imagesPath, filePath);

    // Security: ensure the resolved path is within the Images directory
    const resolved = path.resolve(fullPath);
    if (!resolved.startsWith(path.resolve(imagesPath))) {
      return new Response('Forbidden', { status: 403 });
    }

    return net.fetch('file:///' + resolved.replace(/\\/g, '/'));
  });

  // IPC: return the folder structure with file lists
  ipcMain.handle('get-image-data', () => {
    const imagesPath = getImagesPath();
    const mediaExtensions = /\.(png|jpe?g|svg|mp4)$/i;
    const result = {};

    if (!fs.existsSync(imagesPath)) return result;

    const entries = fs.readdirSync(imagesPath, { withFileTypes: true });

    // Root-level files go into "Home"
    const rootFiles = entries
      .filter(e => e.isFile() && mediaExtensions.test(e.name))
      .map(e => e.name);
    if (rootFiles.length > 0) {
      result['Home'] = rootFiles;
    }

    // Subfolders
    entries
      .filter(e => e.isDirectory())
      .forEach(dir => {
        const dirPath = path.join(imagesPath, dir.name);
        const files = fs.readdirSync(dirPath)
          .filter(f => mediaExtensions.test(f));
        if (files.length > 0) {
          result[dir.name] = files;
        }
      });

    return result;
  });

  // IPC: import dropped files into a target folder
  ipcMain.handle('import-images', (_event, { filePaths, folder }) => {
    const allowedExtensions = ['.png', '.jpg', '.jpeg', '.svg', '.mp4'];
    const imagesPath = getImagesPath();
    const targetDir = path.join(imagesPath, folder);

    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    let count = 0;
    for (const srcPath of filePaths) {
      const ext = path.extname(srcPath).toLowerCase();
      if (!allowedExtensions.includes(ext)) continue;

      const baseName = path.basename(srcPath, ext);
      let destPath = path.join(targetDir, `${baseName}${ext}`);
      let suffix = 2;
      while (fs.existsSync(destPath)) {
        destPath = path.join(targetDir, `${baseName} (${suffix})${ext}`);
        suffix++;
      }

      fs.copyFileSync(srcPath, destPath);
      count++;
    }

    return { success: true, count };
  });

  createWindow();
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
