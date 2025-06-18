import { useState } from '#app';

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

export interface TabsState {
  tabs: Tab[];
  activeTabId: string | null;
}

// Contador para IDs únicos
let tabIdCounter = 0;

export const useTabs = () => {
  // Usando useState do Nuxt para persistência
  const state = useState<TabsState>('browser-tabs', () => ({
    tabs: [],
    activeTabId: null
  }));

  // Carrega o contador de ID da última sessão
  const initializeIdCounter = () => {
    if (state.value.tabs.length > 0) {
      // Extrai os IDs numéricos das tabs existentes
      const ids = state.value.tabs
        .map(tab => {
          const match = tab.id.match(/tab-(\d+)/);
          return match ? parseInt(match[1]) : 0;
        })
        .filter(id => !isNaN(id));
        
      if (ids.length > 0) {
        // Define o contador como o maior ID + 1
        tabIdCounter = Math.max(...ids) + 1;
      }
    }
  };

  // Ações para manipular as tabs
  const actions = {
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
      
      state.value = {
        ...state.value,
        tabs: [...state.value.tabs, newTab]
      };
      return id;
    },

    // Fechar uma tab
    closeTab(tabId: string): void {
      const index = state.value.tabs.findIndex(tab => tab.id === tabId);
      if (index === -1) return;
      
      const wasActive = state.value.tabs[index].isActive;
      const newTabs = [...state.value.tabs];
      newTabs.splice(index, 1);
      
      let newActiveTabId = state.value.activeTabId;
      
      // Se a tab fechada estava ativa, ativar outra
      if (wasActive && newTabs.length > 0) {
        // Tenta ativar a tab à direita ou à esquerda
        const newActiveIndex = Math.min(index, newTabs.length - 1);
        newActiveTabId = newTabs[newActiveIndex].id;
        newTabs[newActiveIndex].isActive = true;
      }
      
      if (newTabs.length === 0) {
        newActiveTabId = null;
      }
      
      state.value = {
        tabs: newTabs,
        activeTabId: newActiveTabId
      };
    },

    // Ativar uma tab
    activateTab(tabId: string): void {
      const newTabs = state.value.tabs.map(tab => ({
        ...tab,
        isActive: tab.id === tabId
      }));
      
      state.value = {
        tabs: newTabs,
        activeTabId: tabId
      };
    },

    // Atualizar o título da tab
    updateTabTitle(tabId: string, title: string): void {
      const newTabs = state.value.tabs.map(tab => 
        tab.id === tabId
          ? { ...tab, title: title || 'Sem título' }
          : tab
      );
      
      state.value = {
        ...state.value,
        tabs: newTabs
      };
    },

    // Atualizar a URL da tab
    updateTabUrl(tabId: string, url: string): void {
      const newTabs = state.value.tabs.map(tab => 
        tab.id === tabId
          ? { ...tab, url }
          : tab
      );
      
      state.value = {
        ...state.value,
        tabs: newTabs
      };
    },

    // Atualizar o estado de navegação da tab
    updateTabNavigationState(tabId: string, canGoBack: boolean, canGoForward: boolean): void {
      const newTabs = state.value.tabs.map(tab => 
        tab.id === tabId
          ? { ...tab, canGoBack, canGoForward }
          : tab
      );
      
      state.value = {
        ...state.value,
        tabs: newTabs
      };
    },

    // Atualizar o favicon da tab
    updateTabFavicon(tabId: string, favicon?: string): void {
      const newTabs = state.value.tabs.map(tab => 
        tab.id === tabId
          ? { ...tab, favicon }
          : tab
      );
      
      state.value = {
        ...state.value,
        tabs: newTabs
      };
    },

    // Atualizar o estado de carregamento da tab
    updateTabLoadingState(tabId: string, isLoading: boolean): void {
      const newTabs = state.value.tabs.map(tab => 
        tab.id === tabId
          ? { ...tab, isLoading }
          : tab
      );
      
      state.value = {
        ...state.value,
        tabs: newTabs
      };
    },

    // Criar uma tab inicial se não houver nenhuma
    ensureActiveTab(): string {
      if (state.value.tabs.length === 0) {
        const id = this.addTab();
        this.activateTab(id);
        return id;
      }
      
      if (state.value.activeTabId === null && state.value.tabs.length > 0) {
        this.activateTab(state.value.tabs[0].id);
        return state.value.tabs[0].id;
      }
      
      return state.value.activeTabId || '';
    }
  };

  // Getters para acessar o estado
  const getters = {
    getTabs: () => state.value.tabs,
    getActiveTab: () => state.value.tabs.find(tab => tab.isActive),
    getTabById: (id: string) => state.value.tabs.find(tab => tab.id === id),
    getActiveTabId: () => state.value.activeTabId
  };

  // Inicializa o contador de ID
  initializeIdCounter();

  return {
    state,
    ...actions,
    ...getters
  };
};
