<template>
  <div 
    class="browser-tab" 
    :class="{ 'active': tab.isActive }"
    @click="handleTabClick"
  >
    <div v-if="tab.favicon" class="favorite-icon">
      <img :src="tab.favicon" alt="Favicon" class="favicon-img">
    </div>
    <div v-else class="favorite-icon default-icon">
      <span>🌐</span>
    </div>
    
    <div class="tab-title" :title="tab.title">
      {{ tab.title }}
    </div>
    
    <div v-if="tab.isLoading" class="tab-loading">
      <span class="loading-spinner">⟳</span>
    </div>
    
    <button 
      class="tab-close" 
      :title="'Fechar ' + tab.title"
      @click.stop="handleCloseClick"
    >
      ×
    </button>
  </div>
</template>

<script setup lang="ts">
import type { Tab } from '../composables/useTabs';

// Define props tipadas
defineProps<{
  tab: Tab;
}>();

// Define eventos com tipos
const emit = defineEmits<{
  activate: [];
  close: [];
}>();

// Handlers de eventos
function handleTabClick(): void {
  emit('activate');
}

function handleCloseClick(): void {
  emit('close');
}
</script>

<style scoped>
.browser-tab {
  display: flex;
  align-items: center;
  padding: 0 8px;
  height: 32px;
  background-color: #e4e4e4;
  border-radius: 8px 8px 0 0;
  margin-right: 2px;
  min-width: 100px;
  max-width: 180px;
  cursor: pointer;
  overflow: hidden;
  transition: background-color 0.2s;
}

.browser-tab:hover {
  background-color: #dadada;
}

.browser-tab.active {
  background-color: #f0f0f0;
  z-index: 2;
}

.favorite-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  margin-right: 6px;
  flex-shrink: 0;
}

.favicon-img {
  width: 16px;
  height: 16px;
}

.tab-title {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 12px;
}

.tab-loading {
  margin-right: 6px;
  flex-shrink: 0;
}

.loading-spinner {
  animation: spin 2s linear infinite;
  display: inline-block;
}

.tab-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: none;
  border: none;
  font-size: 14px;
  padding: 0;
  margin-left: 6px;
  color: #666;
  cursor: pointer;
  flex-shrink: 0;
}

.tab-close:hover {
  background-color: #ccc;
}

@keyframes spin {
  100% {
    transform: rotate(360deg);
  }
}
</style>
