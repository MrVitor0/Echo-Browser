// electron/main.js
import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
// Define se estamos em modo de desenvolvimento ou produção
const isDev = process.env.NODE_ENV === 'development';

function createWindow() {
  // Cria a janela do navegador.
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      // preload aqui no futuro 
    },
  });
  if (isDev) {
    win.loadURL('http://localhost:3000');
    // Abre o DevTools automaticamente em modo de desenvolvimento.
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, '../.output/public/index.html'));
  }
}

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