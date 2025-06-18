// electron/preload.ts
import { contextBridge, ipcRenderer } from 'electron';

// Expõe funcionalidades seguras para o processo de renderização (Nuxt)
// sob o objeto global window.electronAPI
contextBridge.exposeInMainWorld('electronAPI', {
  // Cria uma função 'getVersions' que o Nuxt poderá chamar.
  // Ela envia um evento 'get-app-versions' para o processo Main e retorna a resposta.
  getVersions: (): Promise<{ node: string; chrome: string; electron: string }> =>
    ipcRenderer.invoke('get-app-versions'),
});