import type { Ref } from "vue";
import { useTabs } from "../composables/useTabs";
import { useFavorites } from "../composables/useFavorites";
import { useBlockedDomains } from "../composables/useBlockedDomains";
import { useHistory } from "../composables/useHistory";

// Eventos possíveis do WebView
export type WebViewEvent =
  | "did-start-loading"
  | "did-stop-loading"
  | "did-navigate"
  | "did-navigate-in-page"
  | "dom-ready"
  | "page-title-updated"
  | "page-favicon-updated";

export class WebViewManager {
  private webviews: Map<string, WebViewElement> = new Map();
  private readonly currentUrlRef: Ref<string>;
  private readonly defaultSearchEngine: string =
    "https://www.google.com/search?q=";
  private readonly tabsManager = useTabs();
  private readonly favoritesManager = useFavorites();
  private readonly blockedDomainsManager = useBlockedDomains();
  private readonly historyManager = useHistory();
  private isDarkMode: Ref<boolean>; // Referência para tema escuro

  constructor(currentUrlRef: Ref<string>, isDarkMode: Ref<boolean>) {
    this.currentUrlRef = currentUrlRef;
    this.isDarkMode = isDarkMode;
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
  public initializeWebview(
    tabId: string,
    webviewElement: WebViewElement
  ): void {
    this.webviews.set(tabId, webviewElement);

    // Obter a tab para verificar se é privada
    const tab = this.tabsManager.getTabById(tabId);

    // Configurar modo de partição para navegação privada
    if (tab?.isPrivate) {
      // Configura uma partição única para cada aba privada para evitar compartilhamento de cookies
      const partition = `private-${tabId}`;
      webviewElement.setAttribute("partition", partition);

      // Configura webview para modo privado
      webviewElement.setAttribute("allowpopups", "true");
    }

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
  private setupEventListeners(
    tabId: string,
    webviewElement: WebViewElement
  ): void {
    // Evento para limpar erros quando a navegação começar
    webviewElement.addEventListener("did-start-loading", () => {
      this.tabsManager.setTabError(tabId, undefined);
      this.tabsManager.updateTabLoadingState(tabId, true);
    });

    // Evento para quando terminar de carregar uma página com sucesso
    webviewElement.addEventListener("did-stop-loading", () => {
      this.tabsManager.updateTabLoadingState(tabId, false);

      // Verifica se não é uma página de erro ou data URL
      const url = webviewElement.getURL();
      if (!url.startsWith("data:")) {
        try {
          const title = webviewElement.getTitle();
          const favicon = this.tabsManager.getTabById(tabId)?.favicon;

          // Verifica se a tab é privada antes de adicionar ao histórico
          const tab = this.tabsManager.getTabById(tabId);
          if (tab && !tab.isPrivate) {
            // Só adiciona ao histórico se NÃO for navegação privada
            this.historyManager.addToHistory(url, title, favicon);
          }
        } catch (err) {
          console.error("Erro ao adicionar página ao histórico:", err);
        }
      }
    });

    // Evento para quando a URL mudar
    webviewElement.addEventListener("did-navigate", () => {
      const url = webviewElement.getURL();

      // Só atualiza a URL se não for uma data URL
      if (!url.startsWith("data:")) {
        this.tabsManager.updateTabUrl(tabId, url);

        // Atualiza a URL na barra de endereço se esta tab estiver ativa
        const activeTab = this.tabsManager.getActiveTab();
        if (activeTab && activeTab.id === tabId) {
          this.currentUrlRef.value = url;
        }
      }
    });

    // Título da página foi atualizado
    webviewElement.addEventListener("page-title-updated", (e: Event) => {
      const customEvent = e as unknown as { title: string };
      const title = customEvent.title || "Sem título";
      this.tabsManager.updateTabTitle(tabId, title);

      // Também atualiza o título do favorito, se existir
      const url = webviewElement.getURL();
      if (this.favoritesManager.isFavorite(url)) {
        const favorite = this.favoritesManager.getFavoriteByUrl(url);
        if (favorite) {
          this.favoritesManager.updateFavorite(favorite.id, { title });
        }
      }
    });

    // Favicon foi atualizado
    interface PageFaviconUpdatedEvent {
      favicons: string[];
    }
    webviewElement.addEventListener("page-favicon-updated", (e: Event) => {
      const event = e as unknown as PageFaviconUpdatedEvent;
      if (event.favicons && event.favicons.length > 0) {
        const favicon = event.favicons[0];
        this.tabsManager.updateTabFavicon(tabId, favicon);

        // Também atualiza o favicon do favorito, se existir
        const url = webviewElement.getURL();
        if (this.favoritesManager.isFavorite(url)) {
          const favorite = this.favoritesManager.getFavoriteByUrl(url);
          if (favorite) {
            this.favoritesManager.updateFavorite(favorite.id, { favicon });
          }
        }
      }
    });

    // Evento de erro de carregamento
    webviewElement.addEventListener(
      "did-fail-load",
      (e: WebviewNavigationEvent) => {
        const { errorCode, errorDescription, validatedURL } = e;

        // Ignora os erros que não são relevantes
        // -3 é cancelamento, -6 é "file not found" que acontece durante redirecionamentos normais
        if (errorCode !== -3 && errorCode !== -6) {
          console.log(
            `Erro ao carregar ${validatedURL}: ${errorCode} - ${errorDescription}`
          );

          // Atualiza o estado da tab
          this.tabsManager.updateTabLoadingState(tabId, false);
          this.tabsManager.updateTabTitle(tabId, "Erro de carregamento");

          // Registra o erro na tab
          this.tabsManager.setTabError(tabId, {
            code: errorCode ?? 0,
            url: validatedURL || "",
            description: errorDescription,
          });

          // Garantir que a URL original permanece na URL bar
          if (this.tabsManager.getActiveTabId() === tabId) {
            this.currentUrlRef.value = validatedURL || "";
          }
        }
      }
    );

    // Mais eventos para manter o estado de navegação atualizado
    ["did-navigate-in-page", "dom-ready"].forEach((event) => {
      webviewElement.addEventListener(event, () => {
        this.updateTabNavigationState(tabId, webviewElement);
      });
    });

    // Configurar bloqueio de domínios
    this.setupDomainBlocker(webviewElement);
  }

  /**
   * Configura o bloqueador de domínios para o webview
   */
  private setupDomainBlocker(webviewElement: WebViewElement): void {
    // Intercepta solicitações de carregamento de recursos
    interface WillNavigateEvent {
      url: string;
      preventDefault: () => void;
    }
    webviewElement.addEventListener("will-navigate", (e: Event) => {
      const event = e as unknown as WillNavigateEvent;
      const url = event.url;

      if (this.blockedDomainsManager.isDomainBlocked(url)) {
        // Cancela a navegação para domínios bloqueados
        event.preventDefault();
        console.log(`[Bloqueador] Navegação bloqueada para: ${url}`);
      }
    });

    // Bloqueia também recursos carregados em frames
    webviewElement.addEventListener("did-start-loading", () => {
      // Injeta código para bloquear requisições
      const blockedDomains = this.blockedDomainsManager.blockedDomains.value
        .filter((domain) => domain.enabled)
        .map((domain) => domain.domain);

      const script = `
        // Lista de domínios bloqueados
        const blockedDomains = ${JSON.stringify(blockedDomains)};
        
        // Intercepta requisições de rede
        const originalFetch = window.fetch;
        window.fetch = function(resource, init) {
          const url = resource.toString();
          try {
            const urlObj = new URL(url);
            const hostname = urlObj.hostname;
            
            // Verifica se o domínio deve ser bloqueado
            const isBlocked = blockedDomains.some(domain => 
              hostname === domain || hostname.endsWith('.' + domain)
            );
            
            if (isBlocked) {
              console.log('[Bloqueador] Bloqueada requisição para:', url);
              return Promise.reject(new Error('Requisição bloqueada pelo Echo Browser'));
            }
          } catch (e) {}
          
          // Continua com o fetch original se não for bloqueado
          return originalFetch.apply(this, arguments);
        };
        
        // Bloqueio para imagens, scripts, etc.
        const observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            if (mutation.addedNodes.length) {
              mutation.addedNodes.forEach((node) => {
                if (node.nodeName === 'IFRAME' || node.nodeName === 'SCRIPT' || 
                    node.nodeName === 'IMG' || node.nodeName === 'LINK') {
                  const src = node.src || node.href;
                  if (src) {
                    try {
                      const urlObj = new URL(src);
                      const hostname = urlObj.hostname;
                      
                      // Verifica se o domínio deve ser bloqueado
                      const isBlocked = blockedDomains.some(domain => 
                        hostname === domain || hostname.endsWith('.' + domain)
                      );
                      
                      if (isBlocked) {
                        console.log('[Bloqueador] Elemento bloqueado:', src);
                        node.remove();
                      }
                    } catch (e) {}
                  }
                }
              });
            }
          });
        });
        
        // Configura o observer para monitorar alterações no DOM
        observer.observe(document, {
          childList: true,
          subtree: true
        });
        
        console.log('[Bloqueador] Inicializado com', blockedDomains.length, 'domínios bloqueados');
      `;

      // Executa o script no contexto da página
      webviewElement
        .executeJavaScript(script as string)
        .catch((err: unknown) =>
          console.error("Erro ao injetar bloqueador:", err)
        );
    });
  }

  /**
   * Atualiza o estado de navegação (botões voltar/avançar) de uma tab
   */
  private updateTabNavigationState(
    tabId: string,
    webviewElement: WebViewElement
  ): void {
    try {
      const canGoBack = webviewElement.canGoBack();
      const canGoForward = webviewElement.canGoForward();

      this.tabsManager.updateTabNavigationState(tabId, canGoBack, canGoForward);
    } catch (err) {
      console.error("Erro ao atualizar estado de navegação da tab:", err);
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
    const domainRegex =
      /^([a-z0-9]([a-z0-9-]*[a-z0-9])?\.)+[a-z0-9]([a-z0-9-]*[a-z0-9])?$/i;

    // Se parece com um domínio válido
    if (domainRegex.test(text)) {
      return true;
    }

    // Casos comuns específicos
    const commonDomains = [
      ".com",
      ".org",
      ".net",
      ".edu",
      ".gov",
      ".io",
      ".dev",
      ".app",
    ];
    if (commonDomains.some((domain) => text.includes(domain))) {
      return true;
    }

    return false;
  }

  /**
   * Navega para uma URL específica ou pesquisa no Google
   */
  public navigateToURL(text: string): void {
    const activeTabId = this.tabsManager.getActiveTabId();
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

        // Verifica se o domínio está bloqueado
        if (this.blockedDomainsManager.isDomainBlocked(finalUrl)) {
          console.log(`[Bloqueador] Navegação bloqueada para: ${finalUrl}`);
          return; // Bloqueia a navegação
        }
      } else {
        // Não é URL, pesquisa no Google
        // Adicionar parâmetro de tema baseado na preferência atual
        const themeParam = this.isDarkMode.value ? "&cs=1" : "";
        finalUrl = `${this.defaultSearchEngine}${encodeURIComponent(input)}${themeParam}`;
      }

      // Limpa qualquer erro anterior
      this.tabsManager.clearTabError(activeTabId);

      // Atualiza a URL imediatamente para evitar qualquer inconsistência
      this.tabsManager.updateTabUrl(activeTabId, finalUrl);
      this.currentUrlRef.value = finalUrl;

      // Tenta navegar para a URL
      webviewElement.loadURL(finalUrl);
    } catch (err) {
      console.error("Erro ao navegar para a URL ou realizar pesquisa:", err);
    }
  }

  /**
   * Tenta novamente carregar a página que falhou
   */
  public retryLoadingPage(tabId: string): void {
    const tab = this.tabsManager.getTabById(tabId);
    if (!tab) return;

    const webviewElement = this.webviews.get(tabId);
    if (!webviewElement) return;

    // Limpa o erro e tenta carregar a URL novamente
    this.tabsManager.clearTabError(tabId);
    webviewElement.loadURL(tab.url);
  }

  /**
   * Recarrega a página atual
   */
  public reload(): void {
    const activeTabId = this.tabsManager.getActiveTabId();
    if (!activeTabId) return;

    const tab = this.tabsManager.getTabById(activeTabId);
    if (!tab) return;

    const webviewElement = this.webviews.get(activeTabId);
    if (!webviewElement) return;

    try {
      // Se há um erro, tenta recarregar a URL original em vez de recarregar a página de erro
      if (tab.error) {
        this.retryLoadingPage(activeTabId);
      } else {
        // Recarrega a página normalmente
        webviewElement.reload();
      }
    } catch (err) {
      console.error("Erro ao recarregar página:", err);
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
      console.error("Erro ao voltar página:", err);
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
      console.error("Erro ao avançar página:", err);
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
   * Atualiza o modo escuro do gerenciador
   */
  public setDarkMode(isDark: boolean): void {
    this.isDarkMode.value = isDark;
  }
}
