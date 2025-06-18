import type { Ref } from 'vue';
import { useTabs } from '../composables/useTabs';
import { useFavorites } from '../composables/useFavorites';
import { ErrorPageService } from '../services/ErrorPageService';

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
  private readonly tabsManager = useTabs();
  private readonly favoritesManager = useFavorites();

  constructor(currentUrlRef: Ref<string>) {
    this.currentUrlRef = currentUrlRef;
  }

  /**
   * Obtém o webview da tab ativa
   * @returns O webview da tab ativa ou null se não encontrado
   */
  private getActiveWebview(): WebViewElement | null {
    const activeTabId = this.tabsManager.getActiveTabId();
    if (!activeTabId) return null;
    
    return this.webviews.get(activeTabId) || null;
  }

  /**
   * Inicializa um webview para uma tab específica
   */
  public initializeWebview(tabId: string, webviewElement: WebViewElement): void {
    this.webviews.set(tabId, webviewElement);
    this.setupEventListeners(tabId, webviewElement);
    
    // Se esta for a tab ativa, atualize a barra de URL
    const activeTabId = this.tabsManager.getActiveTabId();
    if (activeTabId === tabId) {
      setTimeout(() => {
        try {
          this.currentUrlRef.value = webviewElement.getURL();
        } catch (err) {
          console.error("Erro ao obter URL inicial do webview:", err);
        }
      }, 100);
    }
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
      this.tabsManager.updateTabLoadingState(tabId, true);
    });

    // Terminou de carregar
    webviewElement.addEventListener('did-stop-loading', () => {
      this.tabsManager.updateTabLoadingState(tabId, false);
    });

    // Título da página foi atualizado
    webviewElement.addEventListener('page-title-updated', (e: any) => {
      this.tabsManager.updateTabTitle(tabId, e.title);
    });

    // Favicon foi atualizado
    webviewElement.addEventListener('page-favicon-updated', (e: any) => {
      if (e.favicons && e.favicons.length > 0) {
        this.tabsManager.updateTabFavicon(tabId, e.favicons[0]);
      }
    });

    // URL foi atualizada
    webviewElement.addEventListener('did-navigate', () => {
      const url = webviewElement.getURL();
      this.tabsManager.updateTabUrl(tabId, url);
      
      // Atualiza a URL na barra de endereço se esta tab estiver ativa
      const activeTab = this.tabsManager.getActiveTab();
      if (activeTab && activeTab.id === tabId) {
        this.currentUrlRef.value = url;
      }
    });

    // Adicionando evento para detectar falhas no carregamento (404, etc)
    webviewElement.addEventListener('did-fail-load', async (event: any) => {
      const { errorCode, errorDescription, validatedURL } = event;
      
      // Códigos comuns: ERR_NAME_NOT_RESOLVED (-105), ERR_CONNECTION_REFUSED (-102), etc.
      if (errorCode !== -3 && validatedURL) { // -3 é cancelamento, normalmente não é erro real
        // Atualiza a tab para exibir informações de erro
        this.tabsManager.updateTabTitle(tabId, 'Erro de carregamento');
        this.tabsManager.updateTabLoadingState(tabId, false);
        
        try {
          // Gera a página de erro HTML usando nosso serviço
          const errorPageHtml = await ErrorPageService.generateErrorPageHtml(
            validatedURL, 
            errorCode
          );
          
          // Carrega a página de erro no webview
          webviewElement.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(errorPageHtml)}`);
        } catch (err) {
          console.error('Erro ao gerar página de erro:', err);
        }
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
      
      this.tabsManager.updateTabNavigationState(tabId, canGoBack, canGoForward);
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
   * Navega para uma URL específica ou pesquisa no Google (apenas na tab ativa)
   */
  public navigateToURL(text: string): void {
    const webviewElement = this.getActiveWebview();
    if (!webviewElement) return;
    
    const activeTabId = this.tabsManager.getActiveTabId();
    if (!activeTabId) return;

    try {
      const input = text?.trim();
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
      this.tabsManager.updateTabUrl(activeTabId, finalUrl);
      // Marca a tab como carregando
      this.tabsManager.updateTabLoadingState(activeTabId, true);
    } catch (err) {
      console.error('Erro ao navegar para a URL ou realizar pesquisa:', err);
    }
  }

  /**
   * Recarrega a página atual (apenas na tab ativa)
   */
  public reload(): void {
    const webviewElement = this.getActiveWebview();
    if (!webviewElement) return;
    
    const activeTabId = this.tabsManager.getActiveTabId();
    if (!activeTabId) return;
    
    try {
      webviewElement.reload();
      // Marca a tab como carregando
      this.tabsManager.updateTabLoadingState(activeTabId, true);
    } catch (err) {
      console.error('Erro ao recarregar página:', err);
    }
  }

  /**
   * Volta para a página anterior (apenas na tab ativa)
   */
  public goBack(): void {
    const webviewElement = this.getActiveWebview();
    if (!webviewElement) return;
    
    const activeTabId = this.tabsManager.getActiveTabId();
    if (!activeTabId) return;
    
    try {
      if (webviewElement.canGoBack()) {
        webviewElement.goBack();
        // Marca a tab como carregando
        this.tabsManager.updateTabLoadingState(activeTabId, true);
        // Atualiza o estado de navegação após a operação
        setTimeout(() => {
          this.updateTabNavigationState(activeTabId, webviewElement);
        }, 100);
      }
    } catch (err) {
      console.error('Erro ao voltar página:', err);
    }
  }

  /**
   * Avança para a próxima página (apenas na tab ativa)
   */
  public goForward(): void {
    const webviewElement = this.getActiveWebview();
    if (!webviewElement) return;
    
    const activeTabId = this.tabsManager.getActiveTabId();
    if (!activeTabId) return;
    
    try {
      if (webviewElement.canGoForward()) {
        webviewElement.goForward();
        // Marca a tab como carregando
        this.tabsManager.updateTabLoadingState(activeTabId, true);
        // Atualiza o estado de navegação após a operação
        setTimeout(() => {
          this.updateTabNavigationState(activeTabId, webviewElement);
        }, 100);
      }
    } catch (err) {
      console.error('Erro ao avançar página:', err);
    }
  }

  /**
   * Verifica se a URL atual está nos favoritos
   */
  public isCurrentUrlFavorite(): boolean {
    const activeTabId = this.tabsManager.getActiveTabId();
    if (!activeTabId) return false;
    
    const tab = this.tabsManager.getTabById(activeTabId);
    if (!tab) return false;
    
    return this.favoritesManager.isFavorite(tab.url);
  }

  /**
   * Adiciona ou remove a URL atual dos favoritos
   */
  public toggleFavorite(): boolean {
    const activeTabId = this.tabsManager.getActiveTabId();
    if (!activeTabId) return false;
    
    const tab = this.tabsManager.getTabById(activeTabId);
    if (!tab) return false;
    
    const isFav = this.favoritesManager.isFavorite(tab.url);
    
    if (isFav) {
      // Encontrar e remover o favorito
      const favorite = this.favoritesManager.getFavoriteByUrl(tab.url);
      if (favorite) {
        this.favoritesManager.removeFavorite(favorite.id);
      }
      return false;
    } else {
      // Adicionar aos favoritos
      this.favoritesManager.addFavorite(tab.title, tab.url, tab.favicon);
      return true;
    }
  }
  

  /**
   * Volta para a página anterior (apenas na tab ativa)
   */
  public goBack(): void {
    const webviewElement = this.getActiveWebview();
    if (!webviewElement) return;
    
    const activeTabId = this.tabsManager.getActiveTabId();
    if (!activeTabId) return;
    
    try {
      if (webviewElement.canGoBack()) {
        webviewElement.goBack();
        // Marca a tab como carregando
        this.tabsManager.updateTabLoadingState(activeTabId, true);
        // Atualiza o estado de navegação após a operação
        setTimeout(() => {
          this.updateTabNavigationState(activeTabId, webviewElement);
        }, 100);
      }
    } catch (err) {
      console.error('Erro ao voltar página:', err);
    }
  }

  /**
   * Avança para a próxima página (apenas na tab ativa)
   */
  public goForward(): void {
    const webviewElement = this.getActiveWebview();
    if (!webviewElement) return;
    
    const activeTabId = this.tabsManager.getActiveTabId();
    if (!activeTabId) return;
    
    try {
      if (webviewElement.canGoForward()) {
        webviewElement.goForward();
        // Marca a tab como carregando
        this.tabsManager.updateTabLoadingState(activeTabId, true);
        // Atualiza o estado de navegação após a operação
        setTimeout(() => {
          this.updateTabNavigationState(activeTabId, webviewElement);
        }, 100);
      }
    } catch (err) {
      console.error('Erro ao avançar página:', err);
    }
  }

  /**
   * Verifica se a URL atual está nos favoritos
   */
  public isCurrentUrlFavorite(): boolean {
    const activeTabId = this.tabsManager.getActiveTabId();
    if (!activeTabId) return false;
    
    const tab = this.tabsManager.getTabById(activeTabId);
    if (!tab) return false;
    
    return this.favoritesManager.isFavorite(tab.url);
  }

  /**
   * Adiciona ou remove a URL atual dos favoritos
   */
  public toggleFavorite(): boolean {
    const activeTabId = this.tabsManager.getActiveTabId();
    if (!activeTabId) return false;
    
    const tab = this.tabsManager.getTabById(activeTabId);
    if (!tab) return false;
    
    const isFav = this.favoritesManager.isFavorite(tab.url);
    
    if (isFav) {
      // Encontrar e remover o favorito
      const favorite = this.favoritesManager.getFavoriteByUrl(tab.url);
      if (favorite) {
        this.favoritesManager.removeFavorite(favorite.id);
      }
      return false;
    } else {
      // Adicionar aos favoritos
      this.favoritesManager.addFavorite(tab.title, tab.url, tab.favicon);
      return true;
    }
  }
}
