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
  goForward: (): Promise<boolean> => ipcRenderer.invoke('navigate', 'forward'),

  // Nova função para buscar sugestões de pesquisa
  getSearchSuggestions: (query: string): Promise<Array<{ phrase: string }>> => 
    ipcRenderer.invoke('search-suggestions', query)
};

// Expõe funcionalidades seguras para o Nuxt
contextBridge.exposeInMainWorld('electronAPI', electronAPI);