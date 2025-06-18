// types/electron.d.ts
export interface IElectronAPI {
  getVersions: () => Promise<{ node: string; chrome: string; electron: string }>;
  // Adicionando as funções de navegação
  reload: () => Promise<boolean>;
  goBack: () => Promise<boolean>;
  goForward: () => Promise<boolean>;
}

declare global {
  interface Window {
    electronAPI: IElectronAPI;
  }
}