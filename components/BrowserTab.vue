<template>
  <div 
    class="browser-tab" 
    :class="{ 'active': tab.isActive }"
    @click="handleTabClick"
  >
    <div class="tab-favicon" v-if="tab.favicon">
      <img :src="tab.favicon" alt="Favicon" class="favicon-img" />
    </div>
    <div v-else class="tab-favicon default-icon">
      <span>🌐</span>
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
import { defineProps, defineEmits } from 'vue';
import type { Tab } from '../composables/useTabs';

const props = defineProps<{
  tab: Tab
}>();

const emit = defineEmits<{
  (e: 'activate'): void,
  (e: 'close'): void
}>();

function handleTabClick() {
  emit('activate');
}

function handleCloseClick() {
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

.tab-favicon {
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
