<template>
  <div class="history-container">
    <div class="history-header">
      <h2>Histórico</h2>
      <div class="history-search-container">
        <input 
          v-model="searchQuery"
          type="text" 
          placeholder="Pesquisar no histórico"
          class="history-search"
        >
        <button 
          class="clear-history-btn" 
          title="Limpar todo o histórico"
          @click="clearHistory" 
        >
          Limpar histórico
        </button>
      </div>
    </div>
    
    <div v-if="filteredHistory.length === 0" class="empty-history">
      <p>{{ searchQuery ? 'Nenhum resultado encontrado.' : 'Seu histórico está vazio.' }}</p>
    </div>
    
    <div v-else class="history-items">
      <div v-for="(group, date) in groupedHistory" :key="date" class="history-group">
        <h3 class="history-date">{{ date }}</h3>
        <div v-for="item in group" :key="item.id" class="history-item">
          <div class="history-item-icon">
            <img v-if="item.favicon" :src="item.favicon" alt="" class="favicon">
            <span v-else class="default-icon">🌐</span>
          </div>
          <div 
            class="history-item-content" 
            @click="navigateToUrl(item.url)"
          >
            <div class="history-item-title">{{ item.title }}</div>
            <div class="history-item-url">{{ item.url }}</div>
            <div class="history-item-time">
              Visitado em: {{ formatTime(item.lastVisitedAt) }}
            </div>
          </div>
          <button 
            class="remove-item-btn"
            title="Remover do histórico"
            @click="removeItem(item.id)" 
          >
            ×
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useHistory } from '../composables/useHistory';
import type { HistoryItem } from '../composables/useHistory';

//component name
defineOptions({
  name: 'HistoryPage'
});

// Props e emits
const emit = defineEmits<{
  navigate: [url: string];
  close: [];
}>();

// Estado local
const searchQuery = ref('');

// Usar o composable de histórico
const { 
  getHistory, 
  removeFromHistory, 
  clearHistory: clearAllHistory,
  searchHistory 
} = useHistory();

// História filtrada com base na pesquisa
const filteredHistory = computed(() => {
  return searchQuery.value 
    ? searchHistory(searchQuery.value)
    : getHistory();
});

// Agrupar histórico por data
const groupedHistory = computed(() => {
  const groups: Record<string, HistoryItem[]> = {};
  
  for (const item of filteredHistory.value) {
    const date = formatDate(item.lastVisitedAt);
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(item);
  }
  
  return groups;
});

// Navegar para uma URL
function navigateToUrl(url: string): void {
  emit('navigate', url);
  emit('close');
}

// Remover um item do histórico
function removeItem(id: string): void {
  removeFromHistory(id);
}

// Limpar todo o histórico
function clearHistory(): void {
  if (confirm('Tem certeza que deseja limpar todo o histórico?')) {
    clearAllHistory();
  }
}

// Formatação de data
function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  
  if (isSameDay(date, today)) {
    return 'Hoje';
  } else if (isSameDay(date, yesterday)) {
    return 'Ontem';
  } else {
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }
}

// Verifica se duas datas são o mesmo dia
function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  );
}

// Formata a hora
function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  });
}
</script>

<style scoped>
.history-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: white;
  padding: 16px;
  overflow-y: auto;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.history-header h2 {
  margin: 0;
  font-size: 24px;
  color: #202124;
}

.history-search-container {
  display: flex;
  align-items: center;
  gap: 16px;
}

.history-search {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 20px;
  font-size: 14px;
  width: 250px;
}

.clear-history-btn {
  background-color: #f1f3f4;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  color: #5f6368;
  font-size: 14px;
  cursor: pointer;
}

.clear-history-btn:hover {
  background-color: #e8eaed;
}

.empty-history {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: #5f6368;
  font-size: 16px;
}

.history-items {
  display: flex;
  flex-direction: column;
}

.history-group {
  margin-bottom: 24px;
}

.history-date {
  font-size: 14px;
  color: #5f6368;
  margin-bottom: 8px;
  padding-bottom: 4px;
  border-bottom: 1px solid #f1f3f4;
}

.history-item {
  display: flex;
  align-items: center;
  padding: 10px 8px;
  border-radius: 8px;
  margin-bottom: 4px;
}

.history-item:hover {
  background-color: #f1f3f4;
}

.history-item-icon {
  width: 20px;
  height: 20px;
  margin-right: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.favicon {
  width: 16px;
  height: 16px;
  object-fit: contain;
}

.default-icon {
  font-size: 16px;
}

.history-item-content {
  flex: 1;
  min-width: 0;
  cursor: pointer;
}

.history-item-title {
  font-size: 14px;
  color: #202124;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.history-item-url {
  font-size: 12px;
  color: #5f6368;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.history-item-time {
  font-size: 12px;
  color: #70757a;
}

.visit-count {
  font-style: italic;
}

.remove-item-btn {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: none;
  font-size: 18px;
  color: #5f6368;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s;
  border-radius: 50%;
}

.history-item:hover .remove-item-btn {
  opacity: 1;
}

.remove-item-btn:hover {
  background-color: rgba(0, 0, 0, 0.08);
  color: #202124;
}
</style>
