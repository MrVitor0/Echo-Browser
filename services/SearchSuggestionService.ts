/**
 * Serviço para obter sugestões de pesquisa do DuckDuckGo
 */
/**
 * Serviço para obter sugestões de pesquisa do DuckDuckGo
 */
export const SearchSuggestionService = {
  /**
   * Busca sugestões de autocompletar do DuckDuckGo via proxy no Electron
   * @param query Termo de pesquisa
   * @returns Promise com array de sugestões
   */
  async getSuggestions(query: string): Promise<string[]> {
    if (!query || query.trim().length < 2) {
      return [];
    }
    
    try {
      // Usa a API do Electron para evitar problemas de CORS
      if (window.electronAPI) {
        const data = await window.electronAPI.getSearchSuggestions(query);
        return data.map((item: { phrase: string }) => item.phrase);
      } else {
        console.warn('ElectronAPI não disponível para sugestões de pesquisa');
        return [];
      }
    } catch (error) {
      console.error('Erro ao buscar sugestões de pesquisa:', error);
      return [];
    }
  }
};