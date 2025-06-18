// types/electron.d.ts
export interface IElectronAPI {
  getVersions: () => Promise<{ node: string; chrome: string; electron: string }>;
}

declare global {
  interface Window {
    electronAPI: IElectronAPI;
  }
}