import { useState } from "#app";
import type { Ref } from "vue";

export interface Tab {
  id: string;
  title: string;
  url: string;
  isActive: boolean;
  canGoBack: boolean;
  canGoForward: boolean;
  favicon?: string;
  isLoading: boolean;
  // Novo campo para indicar modo privado/anônimo
  isPrivate: boolean;
  error?: {
    code: number;
    url: string;
    description?: string;
  };
}

export interface TabsState {
  tabs: Tab[];
  activeTabId: string | null;
}

export interface UseTabsReturn {
  state: Ref<TabsState>;
  addTab: (url?: string, isPrivate?: boolean) => string;
  addPrivateTab: (url?: string) => string; // Novo método para abas privadas
  closeTab: (tabId: string) => void;
  activateTab: (tabId: string) => void;
  updateTabTitle: (tabId: string, title: string) => void;
  updateTabUrl: (tabId: string, url: string) => void;
  updateTabNavigationState: (
    tabId: string,
    canGoBack: boolean,
    canGoForward: boolean
  ) => void;
  updateTabFavicon: (tabId: string, favicon?: string) => void;
  updateTabLoadingState: (tabId: string, isLoading: boolean) => void;
  setTabError: (tabId: string, error: Tab["error"] | undefined) => void;
  clearTabError: (tabId: string) => void;
  ensureActiveTab: () => string;
  getTabs: () => Tab[];
  getActiveTab: () => Tab | undefined;
  getTabById: (id: string) => Tab | undefined;
  getActiveTabId: () => string | null;
}

// Contador para IDs únicos
let tabIdCounter = 0;

export const useTabs = (): UseTabsReturn => {
  // Usando useState do Nuxt para persistência
  const state = useState<TabsState>("browser-tabs", () => ({
    tabs: [],
    activeTabId: null,
  }));

  // Carrega o contador de ID da última sessão
  const initializeIdCounter = (): void => {
    if (state.value.tabs.length > 0) {
      // Extrai os IDs numéricos das tabs existentes
      const ids = state.value.tabs
        .map((tab) => {
          const match = tab.id.match(/tab-(\d+)/);
          return match ? parseInt(match[1], 10) : 0;
        })
        .filter((id) => !isNaN(id));

      if (ids.length > 0) {
        // Define o contador como o maior ID + 1
        tabIdCounter = Math.max(...ids) + 1;
      }
    }
  };

  // Adicionar uma nova tab (agora com suporte para modo privado)
  const addTab = (
    url: string = "https://www.google.com",
    isPrivate: boolean = false
  ): string => {
    const id = `tab-${tabIdCounter++}`;
    const newTab: Tab = {
      id,
      title: isPrivate ? "Nova aba privada" : "Nova aba",
      url,
      isActive: false,
      canGoBack: false,
      canGoForward: false,
      isLoading: true,
      isPrivate,
    };

    state.value = {
      ...state.value,
      tabs: [...state.value.tabs, newTab],
    };
    return id;
  };

  // Método dedicado para criar uma aba privada
  const addPrivateTab = (url: string = "https://www.google.com"): string => {
    return addTab(url, true);
  };

  // Fechar uma tab
  const closeTab = (tabId: string): void => {
    const index = state.value.tabs.findIndex((tab) => tab.id === tabId);
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
      activeTabId: newActiveTabId,
    };
  };

  // Ativar uma tab
  const activateTab = (tabId: string): void => {
    const newTabs = state.value.tabs.map((tab) => ({
      ...tab,
      isActive: tab.id === tabId,
    }));

    state.value = {
      tabs: newTabs,
      activeTabId: tabId,
    };
  };

  // Atualizar o título da tab
  const updateTabTitle = (tabId: string, title: string): void => {
    const newTabs = state.value.tabs.map((tab) =>
      tab.id === tabId ? { ...tab, title: title || "Sem título" } : tab
    );

    state.value = {
      ...state.value,
      tabs: newTabs,
    };
  };

  // Atualizar a URL da tab
  const updateTabUrl = (tabId: string, url: string): void => {
    const newTabs = state.value.tabs.map((tab) =>
      tab.id === tabId ? { ...tab, url } : tab
    );

    state.value = {
      ...state.value,
      tabs: newTabs,
    };
  };

  // Atualizar o estado de navegação da tab
  const updateTabNavigationState = (
    tabId: string,
    canGoBack: boolean,
    canGoForward: boolean
  ): void => {
    const newTabs = state.value.tabs.map((tab) =>
      tab.id === tabId ? { ...tab, canGoBack, canGoForward } : tab
    );

    state.value = {
      ...state.value,
      tabs: newTabs,
    };
  };

  // Atualizar o favicon da tab
  const updateTabFavicon = (tabId: string, favicon?: string): void => {
    const newTabs = state.value.tabs.map((tab) =>
      tab.id === tabId ? { ...tab, favicon } : tab
    );

    state.value = {
      ...state.value,
      tabs: newTabs,
    };
  };

  // Atualizar o estado de carregamento da tab
  const updateTabLoadingState = (tabId: string, isLoading: boolean): void => {
    const newTabs = state.value.tabs.map((tab) =>
      tab.id === tabId ? { ...tab, isLoading } : tab
    );

    state.value = {
      ...state.value,
      tabs: newTabs,
    };
  };

  // Atualiza o estado de erro de uma tab
  const setTabError = (
    tabId: string,
    error: Tab["error"] | undefined
  ): void => {
    const newTabs = state.value.tabs.map((tab) =>
      tab.id === tabId ? { ...tab, error } : tab
    );

    state.value = {
      ...state.value,
      tabs: newTabs,
    };
  };

  // Limpa o erro de uma tab
  const clearTabError = (tabId: string): void => {
    setTabError(tabId, undefined);
  };

  // Criar uma tab inicial se não houver nenhuma
  const ensureActiveTab = (): string => {
    if (state.value.tabs.length === 0) {
      const id = addTab();
      activateTab(id);
      return id;
    }

    if (state.value.activeTabId === null && state.value.tabs.length > 0) {
      activateTab(state.value.tabs[0].id);
      return state.value.tabs[0].id;
    }

    return state.value.activeTabId || "";
  };

  // Getters para acessar o estado
  const getTabs = (): Tab[] => state.value.tabs;
  const getActiveTab = (): Tab | undefined =>
    state.value.tabs.find((tab) => tab.isActive);
  const getTabById = (id: string): Tab | undefined =>
    state.value.tabs.find((tab) => tab.id === id);
  const getActiveTabId = (): string | null => state.value.activeTabId;

  // Inicializa o contador de ID
  initializeIdCounter();

  return {
    state,
    addTab,
    addPrivateTab,
    closeTab,
    activateTab,
    updateTabTitle,
    updateTabUrl,
    updateTabNavigationState,
    updateTabFavicon,
    updateTabLoadingState,
    setTabError,
    clearTabError,
    ensureActiveTab,
    getTabs,
    getActiveTab,
    getTabById,
    getActiveTabId,
  };
};
