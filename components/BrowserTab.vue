<template>
  <div 
    class="browser-tab"
    :class="{ 
      'active': tab.isActive, 
      'private': tab.isPrivate, 
      'dark-mode-tab': isDarkMode 
    }"
    @click="handleTabClick"
  >
    <!-- Indicador de navegação privada -->
    <div v-if="tab.isPrivate" class="private-indicator" title="Navegação privada">
      <span>🔒</span>
    </div>
    
    <div class="favicon-container ">
      <img v-if="tab.favicon" :src="tab.favicon" alt="Favicon" class="favicon-img" />
      <span v-else class="default-icon">{{ tab.isPrivate ? '🕵️' : '🌐' }}</span>
    </div>
    
    <div class="tab-title" :title="tab.title">
      {{ tab.title }}
    </div>
    
    <div class="tab-loading" v-if="tab.isLoading">
      <span class="loading-spinner">⟳</span>
    </div>
    
    <button 
      class="tab-close" 
      @click.stop="handleCloseClick"
      :title="'Fechar ' + tab.title"
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
  isDarkMode: boolean;
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

/* Estilo para abas privadas */
.browser-tab.private {
  background-color: #37324A;
  color: #e0e0e0;
}

.browser-tab.private:hover {
  background-color: #433D5B;
}

.browser-tab.private.active {
  background-color: #544D6B;
}

.private-indicator {
  margin-right: 4px;
  font-size: 10px;
  color: #9C89B8;
}

.favicon-container {
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
  object-fit: contain;
}

.default-icon {
  font-size: 14px;
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
  color: inherit;
  opacity: 0.7;
  cursor: pointer;
  flex-shrink: 0;
}

.tab-close:hover {
  background-color: rgba(0, 0, 0, 0.1);
  opacity: 1;
}

.dark-mode-tab {
  background-color: #292a2d;
  color: #e4e4e4;
}
.browser-tab.active.dark-mode-tab {
  background-color: #3c4043;
}   
.browser-tab.private.dark-mode-tab {
  background-color: #37324A;
  color: #e0e0e0;
}

/* Estilos para tema escuro */
:global(.dark-mode) .browser-tab {
  background-color: #292a2d;
  color: #e4e4e4;
}

:global(.dark-mode) .browser-tab:hover {
  background-color: #3c4043;
}

:global(.dark-mode) .browser-tab.active {
  background-color: #3c4043;
}

:global(.dark-mode) .tab-close {
  color: #8ab4f8;
}

:global(.dark-mode) .tab-close:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

/* Manter os estilos da aba privada mesmo com tema escuro */
:global(.dark-mode) .browser-tab.private {
  background-color: #37324A;
  color: #e0e0e0;
}

:global(.dark-mode) .browser-tab.private:hover {
  background-color: #433D5B;
}

:global(.dark-mode) .browser-tab.private.active {
  background-color: #544D6B;
}

@keyframes spin {
  100% {
    transform: rotate(360deg);
  }
}
</style>
