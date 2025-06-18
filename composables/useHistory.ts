import { useState } from '#app';
import type { Ref } from 'vue';

// Interface para um item do histórico
export interface HistoryItem {
  id: string;
  url: string;
  title: string;
  favicon?: string;
  visitedAt: number; // Timestamp
  lastVisitedAt: number; // Timestamp da última visita
  visitCount: number; // Contador de visitas
}

// Interface para o retorno do composable
export interface UseHistoryReturn {
  historyItems: Ref<HistoryItem[]>;
  addToHistory: (url: string, title: string, favicon?: string) => void;
  removeFromHistory: (id: string) => void;
  removeByUrl: (url: string) => void;
  clearHistory: () => void;
  getHistory: () => HistoryItem[];
  getHistoryByDate: (start: Date, end: Date) => HistoryItem[];
  searchHistory: (query: string) => HistoryItem[];
}

export const useHistory = (): UseHistoryReturn => {
  // Armazenamento persistente usando useState do Nuxt
  const historyItems = useState<HistoryItem[]>('browser-history', () => []);

  // Adiciona ou atualiza um item no histórico
  const addToHistory = (url: string, title: string, favicon?: string): void => {
    // Verificar se o URL já existe no histórico
    const existingIndex = historyItems.value.findIndex(
      item => item.url === url
    );
    
    const currentTime = Date.now();
    
    if (existingIndex >= 0) {
      // Atualiza o item existente
      const existingItem = historyItems.value[existingIndex];
      const updatedItem: HistoryItem = {
        ...existingItem,
        title: title || existingItem.title, // Mantém o título antigo se o novo for vazio
        favicon: favicon || existingItem.favicon, // Mantém o favicon antigo se o novo for vazio
        lastVisitedAt: currentTime,
        visitCount: existingItem.visitCount + 1
      };
      
      // Cria um novo array para garantir reatividade
      const newHistoryItems = [...historyItems.value];
      newHistoryItems[existingIndex] = updatedItem;
      historyItems.value = newHistoryItems;
    } else {
      // Adiciona um novo item
      const newItem: HistoryItem = {
        id: `hist-${currentTime}-${Math.random().toString(36).substring(2, 9)}`,
        url,
        title: title || 'Sem título',
        favicon,
        visitedAt: currentTime,
        lastVisitedAt: currentTime,
        visitCount: 1
      };
      
      // Adiciona ao início do array para manter ordem cronológica inversa
      historyItems.value = [newItem, ...historyItems.value];
    }
  };

  // Remove um item do histórico pelo ID
  const removeFromHistory = (id: string): void => {
    historyItems.value = historyItems.value.filter(item => item.id !== id);
  };

  // Remove um item do histórico pela URL
  const removeByUrl = (url: string): void => {
    historyItems.value = historyItems.value.filter(item => item.url !== url);
  };

  // Limpa todo o histórico
  const clearHistory = (): void => {
    historyItems.value = [];
  };

  // Obtém todo o histórico ordenado por data mais recente
  const getHistory = (): HistoryItem[] => {
    return [...historyItems.value].sort(
      (a, b) => b.lastVisitedAt - a.lastVisitedAt
    );
  };

  // Obtém o histórico em um intervalo de datas
  const getHistoryByDate = (start: Date, end: Date): HistoryItem[] => {
    const startTime = start.getTime();
    const endTime = end.getTime();
    
    return historyItems.value.filter(
      item => item.lastVisitedAt >= startTime && item.lastVisitedAt <= endTime
    ).sort((a, b) => b.lastVisitedAt - a.lastVisitedAt);
  };

  // Pesquisa no histórico por título ou URL
  const searchHistory = (query: string): HistoryItem[] => {
    if (!query) return getHistory();
    
    const lowerQuery = query.toLowerCase();
    return historyItems.value.filter(
      item => 
        item.title.toLowerCase().includes(lowerQuery) || 
        item.url.toLowerCase().includes(lowerQuery)
    ).sort((a, b) => b.lastVisitedAt - a.lastVisitedAt);
  };

  return {
    historyItems,
    addToHistory,
    removeFromHistory,
    removeByUrl,
    clearHistory,
    getHistory,
    getHistoryByDate,
    searchHistory
  };
};
