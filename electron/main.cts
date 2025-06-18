// electron/main.js
import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import fetch from 'node-fetch'; // Certifique-se de instalar node-fetch se ainda não estiver instalado

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
      webviewTag: true, // Habilita o uso da tag <webview>
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

// Configuração dos handlers de IPC
ipcMain.handle('get-app-versions', () => {
  return {
    node: process.versions.node,
    chrome: process.versions.chrome,
    electron: process.versions.electron,
  };
});

// Handler para as funções de navegação
ipcMain.handle('navigate', (_, action) => {
  if (!win) return false;
  
  switch (action) {
    case 'reload':
      win.webContents.reload();
      return true;
    case 'back':
      if (win.webContents.navigationHistory.canGoBack()) {
        win.webContents.navigationHistory.goBack();
        return true;
      }
      return false;
    case 'forward':
      if (win.webContents.navigationHistory.canGoForward()) {
        win.webContents.navigationHistory.goForward();
        return true;
      }
      return false;
    default:
      return false;
  }
});

// Handler para sugestões de pesquisa do DuckDuckGo
ipcMain.handle('search-suggestions', async (_, query) => {
  console.log('Buscando sugestões para:', query);
  
  try {
    const response = await fetch(`https://duckduckgo.com/ac/?q=${encodeURIComponent(query)}&type=json`);
    
    if (!response.ok) {
      throw new Error(`Erro na API: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Sugestões recebidas:', data.length);
    return data;
  } catch (error) {
    console.error('Erro ao buscar sugestões de pesquisa:', error);
    return [];
  }
});

app.whenReady().then(() => {
  createWindow();
});

ipcMain.handle('get-electron-version', () => {
  return `Electron: ${process.versions.electron}`;
});

// Este método será chamado quando o Electron terminar a inicialização
// e estiver pronto para criar janelas do navegador.
app.whenReady().then(createWindow);

// Encerre o aplicativo quando todas as janelas forem fechadas (exceto no macOS).
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});