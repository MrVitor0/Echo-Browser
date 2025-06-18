import type { Ref } from 'vue';
import { tabsGetters, tabsActions } from '../store/tabsStore';

// Interface para o elemento WebView do Electron
export interface WebViewElement extends HTMLElement {
  canGoBack: () => boolean;
  canGoForward: () => boolean;
  getURL: () => string;
  getTitle: () => string;
  reload: () => void;
  goBack: () => void;
  goForward: () => void;
  loadURL: (url: string) => void;
}

// Eventos possíveis do WebView
export type WebViewEvent = 
  | 'did-start-loading' 
  | 'did-stop-loading' 
  | 'did-navigate' 
  | 'did-navigate-in-page' 
  | 'dom-ready' 
  | 'page-title-updated'
  | 'page-favicon-updated';

export class WebViewManager {
  private webviews: Map<string, WebViewElement> = new Map();
  private readonly currentUrlRef: Ref<string>;
  private readonly defaultSearchEngine: string = 'https://www.google.com/search?q=';

  constructor(currentUrlRef: Ref<string>) {
    this.currentUrlRef = currentUrlRef;
  }

  /**
   * Inicializa um webview para uma tab específica
   */
  public initializeWebview(tabId: string, webviewElement: WebViewElement): void {
    this.webviews.set(tabId, webviewElement);
    this.setupEventListeners(tabId, webviewElement);
  }

  /**
   * Remove um webview quando uma tab é fechada
   */
  public removeWebview(tabId: string): void {
    this.webviews.delete(tabId);
  }

  /**
   * Configura os event listeners para um webview específico
   */
  private setupEventListeners(tabId: string, webviewElement: WebViewElement): void {
    const events: WebViewEvent[] = [
      'did-start-loading',
      'did-stop-loading',
      'did-navigate',
      'did-navigate-in-page',
      'dom-ready'
    ];

    // Atualiza o estado de navegação quando qualquer desses eventos ocorrer
    events.forEach(event => {
      webviewElement.addEventListener(event, () => {
        this.updateTabNavigationState(tabId, webviewElement);
      });
    });

    // Começou a carregar
    webviewElement.addEventListener('did-start-loading', () => {
      tabsActions.updateTabLoadingState(tabId, true);
    });

    // Terminou de carregar
    webviewElement.addEventListener('did-stop-loading', () => {
      tabsActions.updateTabLoadingState(tabId, false);
    });

    // Título da página foi atualizado
    webviewElement.addEventListener('page-title-updated', (e: any) => {
      tabsActions.updateTabTitle(tabId, e.title);
    });

    // Favicon foi atualizado
    webviewElement.addEventListener('page-favicon-updated', (e: any) => {
      if (e.favicons && e.favicons.length > 0) {
        tabsActions.updateTabFavicon(tabId, e.favicons[0]);
      }
    });

    // URL foi atualizada
    webviewElement.addEventListener('did-navigate', () => {
      const url = webviewElement.getURL();
      tabsActions.updateTabUrl(tabId, url);
      
      // Atualiza a URL na barra de endereço se esta tab estiver ativa
      const activeTab = tabsGetters.getActiveTab();
      if (activeTab && activeTab.id === tabId) {
        this.currentUrlRef.value = url;
      }
    });
  }

  /**
   * Atualiza o estado de navegação (botões voltar/avançar) de uma tab
   */
  private updateTabNavigationState(tabId: string, webviewElement: WebViewElement): void {
    try {
      const canGoBack = webviewElement.canGoBack();
      const canGoForward = webviewElement.canGoForward();
      
      tabsActions.updateTabNavigationState(tabId, canGoBack, canGoForward);
    } catch (err) {
      console.error('Erro ao atualizar estado de navegação da tab:', err);
    }
  }

  /**
   * Verifica se um texto é uma URL válida
   */
  private isValidUrl(text: string): boolean {
    // Verifica se já começa com http:// ou https://
    if (/^https?:\/\//i.test(text)) {
      return true;
    }
    
    // Verifica se é um domínio válido (com pelo menos um ponto)
    const domainRegex = /^([a-z0-9]([a-z0-9-]*[a-z0-9])?\.)+[a-z0-9]([a-z0-9-]*[a-z0-9])?$/i;
    
    // Se parece com um domínio válido
    if (domainRegex.test(text)) {
      return true;
    }
    
    // Casos comuns específicos
    const commonDomains = ['.com', '.org', '.net', '.edu', '.gov', '.io', '.dev', '.app'];
    if (commonDomains.some(domain => text.includes(domain))) {
      return true;
    }
    
    return false;
  }

  /**
   * Navega para uma URL específica ou pesquisa no Google
   */
  public navigateToURL(text: string): void {
    const activeTabId = tabsGetters.getActiveTabId();
    if (!activeTabId) return;
    
    const webviewElement = this.webviews.get(activeTabId);
    if (!webviewElement) return;

    try {
      const input = text.trim();
      if (!input) return;
      
      let finalUrl: string;
      
      if (this.isValidUrl(input)) {
        // É uma URL válida, formata corretamente
        finalUrl = /^https?:\/\//i.test(input) ? input : `https://${input}`;
      } else {
        // Não é URL, pesquisa no Google
        finalUrl = `${this.defaultSearchEngine}${encodeURIComponent(input)}`;
        console.log('Realizando pesquisa no Google:', input);
      }
      
      webviewElement.loadURL(finalUrl);
      this.currentUrlRef.value = finalUrl;
      tabsActions.updateTabUrl(activeTabId, finalUrl);
    } catch (err) {
      console.error('Erro ao navegar para a URL ou realizar pesquisa:', err);
    }
  }

  /**
   * Recarrega a página atual
   */
  public reload(): void {
    const activeTabId = tabsGetters.getActiveTabId();
    if (!activeTabId) return;
    
    const webviewElement = this.webviews.get(activeTabId);
    if (!webviewElement) return;
    
    try {
      webviewElement.reload();
    } catch (err) {
      console.error('Erro ao recarregar página:', err);
    }
  }

  /**
   * Volta para a página anterior
   */
  public goBack(): void {
    const activeTabId = tabsGetters.getActiveTabId();
    if (!activeTabId) return;
    
    const webviewElement = this.webviews.get(activeTabId);
    if (!webviewElement) return;
    
    try {
      if (webviewElement.canGoBack()) {
        webviewElement.goBack();
      }
    } catch (err) {
      console.error('Erro ao voltar página:', err);
    }
  }

  /**
   * Avança para a próxima página
   */
  public goForward(): void {
    const activeTabId = tabsGetters.getActiveTabId();
    if (!activeTabId) return;
    
    const webviewElement = this.webviews.get(activeTabId);
    if (!webviewElement) return;
    
    try {
      if (webviewElement.canGoForward()) {
        webviewElement.goForward();
      }
    } catch (err) {
      console.error('Erro ao avançar página:', err);
    }
  }
}
