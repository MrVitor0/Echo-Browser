<template>
  <div class="tabs-container">
    <div class="tabs-list">
      <BrowserTab
        v-for="tab in tabs"
        :key="tab.id"
        :tab="tab"
        @activate="() => handleActivateTab(tab.id)"
        @close="() => handleCloseTab(tab.id)"
      />
      
      <div class="tabs-actions">
        <button 
          class="new-tab-button" 
          @click="handleNewTab" 
          title="Nova aba"
        >
          +
        </button>
        <button 
          class="new-private-tab-button" 
          @click="handleNewPrivateTab" 
          title="Nova aba privada"
        >
          🔒
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import BrowserTab from './BrowserTab.vue';
import { useTabs } from '../composables/useTabs';
import type { Tab } from '../composables/useTabs';

// Usa o composable para gerenciar as tabs
const tabsManager = useTabs();

// Computed property para as tabs
const tabs = computed<Tab[]>(() => tabsManager.getTabs());

// Handlers dos eventos
function handleActivateTab(tabId: string): void {
  tabsManager.activateTab(tabId);
}

function handleCloseTab(tabId: string): void {
  tabsManager.closeTab(tabId);
}

function handleNewTab(): void {
  const newTabId = tabsManager.addTab();
  tabsManager.activateTab(newTabId);
}

// Novo handler para criar aba privada
function handleNewPrivateTab(): void {
  const newTabId = tabsManager.addPrivateTab();
  tabsManager.activateTab(newTabId);
}
</script>

<style scoped>
.tabs-container {
  width: 100%;
  background-color: #dadada;
  overflow-x: auto;
  white-space: nowrap;
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  height: 36px;
  border-bottom: 1px solid #ccc;
}

.tabs-list {
  display: flex;
  flex-direction: row;
  align-items: center;
  height: 100%;
  padding-left: 4px;
  min-width: min-content;
}

.tabs-actions {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.new-tab-button, .new-private-tab-button {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: transparent;
  border: none;
  border-radius: 50%;
  font-size: 18px;
  cursor: pointer;
  margin: 0 4px;
  color: #555;
  transition: background-color 0.2s;
}

.new-tab-button:hover, .new-private-tab-button:hover {
  background-color: #ccc;
}

.new-private-tab-button {
  font-size: 14px;
  color: #464066;
}
</style>
