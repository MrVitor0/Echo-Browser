// electron/preload.cts
import { contextBridge, ipcRenderer } from 'electron';
import type { IElectronAPI } from '../types/electron';

// Implementação tipada da API do Electron
const electronAPI: IElectronAPI = {
  getVersions: (): Promise<{ node: string; chrome: string; electron: string }> => 
    ipcRenderer.invoke('get-app-versions'),
  
  // Funções de navegação tipadas
  reload: (): Promise<boolean> => ipcRenderer.invoke('navigate', 'reload'),
  goBack: (): Promise<boolean> => ipcRenderer.invoke('navigate', 'back'),
  goForward: (): Promise<boolean> => ipcRenderer.invoke('navigate', 'forward')
};

// Expõe funcionalidades seguras para o Nuxt
contextBridge.exposeInMainWorld('electronAPI', electronAPI);