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
      
      <button class="new-tab-button" @click="handleNewTab" title="Nova aba">
        +
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import BrowserTab from './BrowserTab.vue';
import { tabsGetters, tabsActions } from '../store/tabsStore';

const tabs = computed(() => tabsGetters.getTabs());

function handleActivateTab(tabId: string) {
  tabsActions.activateTab(tabId);
}

function handleCloseTab(tabId: string) {
  tabsActions.closeTab(tabId);
}

function handleNewTab() {
  const newTabId = tabsActions.addTab();
  tabsActions.activateTab(newTabId);
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

.new-tab-button {
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

.new-tab-button:hover {
  background-color: #ccc;
}
</style>
