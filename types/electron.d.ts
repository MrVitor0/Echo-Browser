// types/electron.d.ts
export interface IElectronAPI {
  getVersions: () => Promise<{
    node: string;
    chrome: string;
    electron: string;
  }>;
  // Adicionando as funções de navegação
  reload: () => Promise<boolean>;
  goBack: () => Promise<boolean>;
  goForward: () => Promise<boolean>;
  // Nova função para sugestões de pesquisa
  getSearchSuggestions: (query: string) => Promise<Array<{ phrase: string }>>;
}

declare global {
  interface Window {
    electronAPI: IElectronAPI;
  }
  interface WebviewNavigationEvent extends Event {
    title?: string;
    favicons?: string[];
    errorCode?: number;
    errorDescription?: string;
    code?: number;
    url?: string;
    validatedURL?: string;
  }
}
