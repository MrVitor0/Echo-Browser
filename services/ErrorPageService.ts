import { renderToString } from 'vue/server-renderer';
import ErrorPage from '../components/ErrorPage.vue';
import { createSSRApp, h } from 'vue';

/**
 * Serviço para gerar páginas de erro HTML a partir de componentes Vue
 */
export const ErrorPageService = {
  /**
   * Gera HTML para uma página de erro 404
   * @param url URL que causou o erro
   * @param errorCode Código de erro opcional
   * @returns Promise com o HTML da página de erro
   */
  async generateErrorPageHtml(url: string, errorCode?: number): Promise<string> {
    try {
      // Criamos um app Vue para renderização do servidor
      const app = createSSRApp({
        render: () => h(ErrorPage, { url, errorCode })
      });

      // Renderiza o componente para HTML
      const appContent = await renderToString(app);

      // Retorna o HTML completo com o componente renderizado
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Erro ao carregar a página</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body, html { margin: 0; padding: 0; height: 100%; }
            ${ErrorPageService.extractStyles()}
          </style>
        </head>
        <body>
          <div id="app">${appContent}</div>
          <script>
            function goBack() { window.history.back(); }
            function retry() { window.location.reload(); }
          </script>
        </body>
        </html>
      `;
    } catch (error) {
      console.error('Erro ao gerar página de erro:', error);
      
      // Fallback para uma página simples se houver erro na renderização
      return ErrorPageService.createSimpleErrorPage(url, errorCode);
    }
  },

  /**
   * Cria uma página de erro simples como fallback
   * @param url URL que causou o erro
   * @param errorCode Código de erro opcional
   * @returns HTML simples da página de erro
   */
  createSimpleErrorPage(url: string, errorCode?: number): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Página não encontrada</title>
      </head>
      <body style="font-family: system-ui; text-align: center; padding: 50px;">
        <h1>Página não encontrada</h1>
        <p>Não foi possível carregar: ${ErrorPageService.escapeHtml(url)}</p>
        ${errorCode ? `<p>Código de erro: ${errorCode}</p>` : ''}
        <button onclick="window.history.back()">Voltar</button>
        <button onclick="window.location.reload()">Tentar novamente</button>
      </body>
      </html>
    `;
  },

  /**
   * Escapa caracteres HTML para evitar XSS
   * @param html String a ser escapada
   * @returns String escapada segura para HTML
   */
  escapeHtml(html: string): string {
    return html
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  },

  /**
   * Extrai os estilos do componente ErrorPage
   * Nota: Em uma implementação mais completa, usaríamos um bundler para isso
   */
  extractStyles(): string {
    // Como não podemos realmente extrair os estilos do componente Vue em runtime,
    // retornamos os estilos mais essenciais aqui
    return `
      .error-page {
        font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100vh;
        background-color: #f5f5f5;
      }
      .error-container {
        max-width: 500px;
        padding: 30px;
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        text-align: center;
      }
      .error-icon { font-size: 48px; margin-bottom: 20px; }
      h1 { font-size: 24px; margin-bottom: 16px; color: #333; }
      p { margin-bottom: 16px; color: #555; }
      .error-suggestions { text-align: left; margin: 24px 0; }
      .error-suggestions ul { padding-left: 20px; }
      .error-suggestions li { margin: 8px 0; color: #666; }
      .error-actions { display: flex; justify-content: center; gap: 12px; margin-top: 24px; }
      button {
        padding: 10px 16px;
        border: none;
        border-radius: 4px;
        font-size: 14px;
        cursor: pointer;
        background-color: #e0e0e0;
        color: #333;
      }
      button:hover { background-color: #d0d0d0; }
      .primary { background-color: #1a73e8; color: white; }
      .primary:hover { background-color: #1766ca; }
    `;
  }
};
