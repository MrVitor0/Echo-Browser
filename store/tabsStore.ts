import { reactive, readonly, ref } from 'vue';

export interface Tab {
  id: string;
  title: string;
  url: string;
  isActive: boolean;
  canGoBack: boolean;
  canGoForward: boolean;
  favicon?: string;
  isLoading: boolean;
}

interface TabsState {
  tabs: Tab[];
  activeTabId: string | null;
}

// Estado inicial
const initialState: TabsState = {
  tabs: [],
  activeTabId: null
};

// Cria um estado reativo
const state = reactive<TabsState>({...initialState});

// Contador para IDs únicos
let tabIdCounter = 0;

// Ações para manipular as tabs
export const tabsActions = {
  // Adicionar uma nova tab
  addTab(url: string = 'https://www.google.com'): string {
    const id = `tab-${tabIdCounter++}`;
    const newTab: Tab = {
      id,
      title: 'Nova Tab',
      url,
      isActive: false,
      canGoBack: false,
      canGoForward: false,
      isLoading: true
    };
    
    state.tabs.push(newTab);
    return id;
  },

  // Fechar uma tab
  closeTab(tabId: string): void {
    const index = state.tabs.findIndex(tab => tab.id === tabId);
    if (index === -1) return;
    
    const wasActive = state.tabs[index].isActive;
    state.tabs.splice(index, 1);
    
    // Se a tab fechada estava ativa, ativar outra
    if (wasActive && state.tabs.length > 0) {
      // Tenta ativar a tab à direita ou à esquerda
      const newActiveIndex = Math.min(index, state.tabs.length - 1);
      this.activateTab(state.tabs[newActiveIndex].id);
    }
    
    if (state.tabs.length === 0) {
      state.activeTabId = null;
    }
  },

  // Ativar uma tab
  activateTab(tabId: string): void {
    state.tabs.forEach(tab => {
      tab.isActive = tab.id === tabId;
    });
    state.activeTabId = tabId;
  },

  // Atualizar o título da tab
  updateTabTitle(tabId: string, title: string): void {
    const tab = state.tabs.find(t => t.id === tabId);
    if (tab) {
      tab.title = title || 'Sem título';
    }
  },

  // Atualizar a URL da tab
  updateTabUrl(tabId: string, url: string): void {
    const tab = state.tabs.find(t => t.id === tabId);
    if (tab) {
      tab.url = url;
    }
  },

  // Atualizar o estado de navegação da tab
  updateTabNavigationState(tabId: string, canGoBack: boolean, canGoForward: boolean): void {
    const tab = state.tabs.find(t => t.id === tabId);
    if (tab) {
      tab.canGoBack = canGoBack;
      tab.canGoForward = canGoForward;
    }
  },

  // Atualizar o favicon da tab
  updateTabFavicon(tabId: string, favicon?: string): void {
    const tab = state.tabs.find(t => t.id === tabId);
    if (tab) {
      tab.favicon = favicon;
    }
  },

  // Atualizar o estado de carregamento da tab
  updateTabLoadingState(tabId: string, isLoading: boolean): void {
    const tab = state.tabs.find(t => t.id === tabId);
    if (tab) {
      tab.isLoading = isLoading;
    }
  },

  // Criar uma tab inicial se não houver nenhuma
  ensureActiveTab(): string {
    if (state.tabs.length === 0) {
      const id = this.addTab();
      this.activateTab(id);
      return id;
    }
    
    if (state.activeTabId === null) {
      this.activateTab(state.tabs[0].id);
      return state.tabs[0].id;
    }
    
    return state.activeTabId;
  }
};

// Getters para acessar o estado
export const tabsGetters = {
  getTabs: (): Tab[] => state.tabs,
  getActiveTab: (): Tab | undefined => state.tabs.find(tab => tab.isActive),
  getTabById: (id: string): Tab | undefined => state.tabs.find(tab => tab.id === id),
  getActiveTabId: (): string | null => state.activeTabId
};

// Exporta uma versão somente leitura do estado
export const tabsState = readonly(state);
