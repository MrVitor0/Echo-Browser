<template>
  <div class="browser-container">
    <div class="toolbar">
      <button :disabled="!activeTab?.canGoBack" @click="handleGoBack">←</button>
      <button :disabled="!activeTab?.canGoForward" @click="handleGoForward">→</button>
      <button @click="handleReload">⟳</button>
      <input
        class="url-bar"
        :value="urlBarText"
        @input="updateUrlBarText"
        @keyup.enter="handleNavigateToURL"
      />
    </div>
    
    <!-- Container de tabs -->
    <TabsContainer />
    
    <!-- Container de webviews (um para cada tab) -->
    <div class="webviews-container">
      <div
        v-for="tab in tabs"
        :key="tab.id"
        class="webview-wrapper"
        :class="{ 'hidden': !tab.isActive }"
      >
        <webview
          :id="`webview-${tab.id}`"
          class="webview-content"
          :src="tab.url"
          ref="webviewRefs"
          @dom-ready="(event) => handleWebviewReady(event, tab.id)"
        ></webview>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { WebViewManager } from './components/WebViewManager';
import type { WebViewElement } from './components/WebViewManager';
import TabsContainer from './components/TabsContainer.vue';
import { useTabs } from './composables/useTabs';

// Estados reativos
const urlBarText = ref('https://www.google.com');
const webviewRefs = ref<Array<HTMLElement>>([]);

// Obtém o gerenciador de tabs
const tabsManager = useTabs();

// Criação do gerenciador de WebView
const webViewManager = new WebViewManager(urlBarText);

// Computed properties
const tabs = computed(() => tabsManager.getTabs());
const activeTab = computed(() => tabsManager.getActiveTab());

// Atualiza a URL na barra de endereço quando a tab ativa muda
watch(activeTab, (newActiveTab) => {
  if (newActiveTab) {
    urlBarText.value = newActiveTab.url;
  }
});

// Função para atualizar o texto da barra de URL
function updateUrlBarText(event: Event) {
  const input = event.target as HTMLInputElement;
  urlBarText.value = input.value;
}

// Handler para quando um webview termina de carregar
function handleWebviewReady(event: Event, tabId: string) {
  const webview = event.target as WebViewElement;
  webViewManager.initializeWebview(tabId, webview);
}

// Handlers de navegação que usam a classe WebViewManager
function handleNavigateToURL() {
  webViewManager.navigateToURL(urlBarText.value);
}

function handleReload() {
  // Tenta usar a API do Electron primeiro, senão usa o WebView diretamente
  if (window.electronAPI) {
    window.electronAPI.reload().catch(err => {
      console.error('Erro ao usar API do Electron para recarregar:', err);
      webViewManager.reload();
    });
  } else {
    webViewManager.reload();
  }
}

function handleGoBack() {
  if (window.electronAPI) {
    window.electronAPI.goBack().catch(err => {
      console.error('Erro ao usar API do Electron para voltar:', err);
      webViewManager.goBack();
    });
  } else {
    webViewManager.goBack();
  }
}

function handleGoForward() {
  if (window.electronAPI) {
    window.electronAPI.goForward().catch(err => {
      console.error('Erro ao usar API do Electron para avançar:', err);
      webViewManager.goForward();
    });
  } else {
    webViewManager.goForward();
  }
}

onMounted(() => {
  console.log('Componente montado');
  
  // Garantir que há pelo menos uma tab ativa
  tabsManager.ensureActiveTab();
});
</script>

<style>
body, html { margin: 0; padding: 0; height: 100%; overflow: hidden; }
.browser-container { display: flex; flex-direction: column; height: 100vh; }
.toolbar { display: flex; padding: 8px; background-color: #f0f0f0; }
.toolbar button { margin-right: 6px; padding: 6px 12px; }
.url-bar { flex-grow: 1; padding: 6px; border: 1px solid #ccc; border-radius: 4px; }

.webviews-container {
  flex-grow: 1;
  position: relative;
  background-color: #fff;
}

.webview-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.webview-wrapper.hidden {
  display: none;
}

.webview-content {
  width: 100%;
  height: 100%;
  border: none;
}
</style>