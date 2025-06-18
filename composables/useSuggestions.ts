import { ref } from 'vue';

/**
 * Composable para gerenciar sugestões de pesquisa
 */
export function useSuggestions() {
  // Estados
  const suggestions = ref<string[]>([]);
  const loading = ref(false);
  const selectedIndex = ref(-1);
  const showSuggestions = ref(false);
  
  // Para controle de debounce
  let debounceTimeout: NodeJS.Timeout | null = null;
  const DEBOUNCE_DELAY = 300; // ms
  
  // Mantém o último termo pesquisado para evitar repetições
  let lastQuery = '';
  
  /**
   * Busca sugestões com debounce para evitar chamadas excessivas
   */
  const fetchSuggestions = async (query: string): Promise<void> => {
    // Limpa timeout anterior se existir
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }
    
    // Condições para não buscar
    if (!query || query.trim().length < 2) {
      suggestions.value = [];
      showSuggestions.value = false;
      return;
    }
    
    // Se o termo for o mesmo, não busca novamente
    if (query === lastQuery) {
      return;
    }
    
    // Configura novo timeout para debounce
    debounceTimeout = setTimeout(async () => {
      // Só busca se o termo for diferente do anterior
      if (query !== lastQuery) {
        loading.value = true;
        lastQuery = query;
        
        try {
          if (window.electronAPI) {
            const data = await window.electronAPI.getSearchSuggestions(query);
            suggestions.value = data.map(item => item.phrase);
            showSuggestions.value = suggestions.value.length > 0;
          } else {
            console.warn('ElectronAPI não disponível para sugestões');
            suggestions.value = [];
            showSuggestions.value = false;
          }
        } catch (error) {
          console.error('Erro ao buscar sugestões:', error);
          suggestions.value = [];
          showSuggestions.value = false;
        } finally {
          loading.value = false;
        }
      }
    }, DEBOUNCE_DELAY);
  };
  
  /**
   * Seleciona uma sugestão pelo índice
   */
  const selectSuggestion = (index: number): string | null => {
    if (index >= 0 && index < suggestions.value.length) {
      selectedIndex.value = index;
      return suggestions.value[index];
    }
    selectedIndex.value = -1;
    return null;
  };
  
  /**
   * Move a seleção para cima nas sugestões
   */
  const selectPrevious = (): string | null => {
    if (suggestions.value.length === 0) return null;
    
    if (selectedIndex.value <= 0) {
      selectedIndex.value = suggestions.value.length - 1;
    } else {
      selectedIndex.value--;
    }
    
    return selectedIndex.value >= 0 ? suggestions.value[selectedIndex.value] : null;
  };
  
  /**
   * Move a seleção para baixo nas sugestões
   */
  const selectNext = (): string | null => {
    if (suggestions.value.length === 0) return null;
    
    if (selectedIndex.value >= suggestions.value.length - 1) {
      selectedIndex.value = 0;
    } else {
      selectedIndex.value++;
    }
    
    return selectedIndex.value >= 0 && selectedIndex.value < suggestions.value.length 
      ? suggestions.value[selectedIndex.value] 
      : null;
  };
  
  /**
   * Limpa as sugestões e esconde o dropdown
   */
  const clearSuggestions = (): void => {
    suggestions.value = [];
    selectedIndex.value = -1;
    showSuggestions.value = false;
  };
  
  return {
    suggestions,
    loading,
    selectedIndex,
    showSuggestions,
    fetchSuggestions,
    selectSuggestion,
    selectPrevious,
    selectNext,
    clearSuggestions
  };
}
