// electron/main.js
import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
// Define se estamos em modo de desenvolvimento ou produção
const isDev = process.env.NODE_ENV === 'development';

let win: BrowserWindow | null = null;

function createWindow() {
  if (win !== null) {
    return; // Já existe uma janela aberta
  }
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
    },
  });
  if (isDev) {
    win.loadURL('http://localhost:3000');
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, '../.output/public/index.html'));
  }
  win.on('closed', () => {
    win = null;
  });
}
// ...existing code...

app.whenReady().then(() => {
  // Adicione este handler ANTES de criar a janela
  // Ele vai ouvir o evento 'get-app-versions' do preload.ts
  ipcMain.handle('get-app-versions', () => {
    return {
      node: process.versions.node,
      chrome: process.versions.chrome,
      electron: process.versions.electron,
    };
  });

  createWindow();
});

// Este método será chamado quando o Electron terminar a inicialização
// e estiver pronto para criar janelas do navegador.
app.whenReady().then(createWindow);


// Adicione este código antes da linha app.whenReady().then(createWindow);
ipcMain.handle('get-electron-version', () => {
  return `Electron: ${process.versions.electron}`;
});

// Encerre o aplicativo quando todas as janelas forem fechadas (exceto no macOS).
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});