<template>
  <div class="browser-container" :class="{ 'private-mode': activeTab?.isPrivate }">
    <!-- Container de tabs -->
    <TabsContainer />

    <div class="toolbar">
      <!-- Indicador de navegação privada -->
      <div v-if="activeTab?.isPrivate" class="private-mode-indicator">
        <span class="private-icon">🔒</span>
        <span class="private-text">Navegação privada</span>
      </div>
      
      <button :disabled="!activeTab?.canGoBack" @click="handleGoBack">←</button>
      <button :disabled="!activeTab?.canGoForward" @click="handleGoForward">→</button>
      <button @click="handleReload">⟳</button>
      <input
        class="url-bar"
        :value="urlBarText"
        @input="updateUrlBarText"
        @keyup.enter="handleNavigateToURLFromInput"
        :class="{ 'private-input': activeTab?.isPrivate }"
      >
      <button
        class="favorite-button"
        :class="{ 'active': isCurrentFavorite }"
        :title="isCurrentFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'"
        @click="toggleFavorite"
      >
        ★
      </button>
      <button
        class="history-button"
        title="Ver histórico"
        @click="showHistory = true"
      >
        ⌚
      </button>
      <button
        class="toggle-favorites-button"
        title="Mostrar/esconder favoritos"
        :class="{ 'active': showFavoritesBar }"
        @click="toggleFavoritesBar"
      >
        ☰
      </button>
    </div>

    <!-- Barra de favoritos -->
    <FavoritesBar
      :show-favorites="showFavoritesBar"
      @navigate="handleNavigateToURL"
    />

    <!-- Container de webviews (um para cada tab) -->
    <div class="webviews-container">
      <div
        v-for="tab in tabs"
        :key="tab.id"
        class="webview-wrapper"
        :class="{ hidden: !tab.isActive }"
      >
        <!-- Mostra página de erro quando houver erro -->
        <ErrorView
          v-if="tab.error"
          class="webview-content"
          :url="tab.error.url || tab.url"
          :error-code="tab.error.code"
          :title="`Não foi possível acessar este site`"
          @back="handleGoBack"
          @retry="() => handleRetry(tab.id)"
        />

        <!-- Mostra webview quando não há erro -->
        <webview
          v-else
          :id="`webview-${tab.id}`"
          ref="webviewRefs"
          class="webview-content"
          :src="tab.url"
          @dom-ready="(event: Event) => handleWebviewReady(event, tab.id)"
        />
      </div>
    </div>

    <!-- Modal de histórico -->
    <div
      v-if="showHistory"
      class="modal-overlay"
      @click.self="showHistory = false"
    >
      <div class="modal-content">
        <div class="modal-header">
          <button class="modal-close" @click="showHistory = false">×</button>
        </div>
        <History @navigate="handleNavigateToURL" @close="showHistory = false" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch, nextTick } from "vue";
import { WebViewManager } from "./components/WebViewManager";
import type { WebViewElement } from "./components/WebViewManager";
import TabsContainer from "./components/TabsContainer.vue";
import FavoritesBar from "./components/FavoritesBar.vue";
import ErrorView from "./components/ErrorView.vue";
import History from "./components/History.vue";
import { useTabs } from "./composables/useTabs";
import { useFavorites } from "./composables/useFavorites";
import type { Tab } from "./composables/useTabs";
// Estados reativos
const urlBarText = ref<string>("https://www.google.com");
const webviewRefs = ref<Array<HTMLElement>>([]);
const showFavoritesBar = ref<boolean>(false);
const isCurrentFavorite = ref<boolean>(false);
const showHistory = ref<boolean>(false);

// Obtém o gerenciador de tabs e favoritos
const tabsManager = useTabs();
const favoritesManager = useFavorites();

// Criação do gerenciador de WebView
const webViewManager = new WebViewManager(urlBarText);

// Computed properties
const tabs = computed<Tab[]>(() => tabsManager.getTabs());
const activeTab = computed<Tab | undefined>(() => tabsManager.getActiveTab());

// Atualiza a URL na barra de endereço e verifica se é favorito quando a tab ativa muda
watch(activeTab, (newActiveTab?: Tab) => {
  if (newActiveTab) {
    urlBarText.value = newActiveTab.url;
    nextTick(() => {
      updateFavoriteStatus(newActiveTab.url);
    });
  }
});

// Atualiza o status de favorito para a URL atual
function updateFavoriteStatus(url: string): void {
  isCurrentFavorite.value = favoritesManager.isFavorite(url);
}

// Função para atualizar o texto da barra de URL
function updateUrlBarText(event: Event): void {
  const input = event.target as HTMLInputElement;
  urlBarText.value = input.value;
}

// Toggle da barra de favoritos
function toggleFavoritesBar(): void {
  showFavoritesBar.value = !showFavoritesBar.value;
}

// Adiciona ou remove a página atual dos favoritos
function toggleFavorite(): void {
  const currentTab = activeTab.value;
  if (!currentTab) return;

  if (isCurrentFavorite.value) {
    const favorite = favoritesManager.getFavoriteByUrl(currentTab.url);
    if (favorite) {
      favoritesManager.removeFavorite(favorite.id);
      isCurrentFavorite.value = false;
    }
  } else {
    favoritesManager.addFavorite(
      currentTab.title,
      currentTab.url,
      currentTab.favicon
    );
    isCurrentFavorite.value = true;
  }
}

// Handler para quando um webview termina de carregar
function handleWebviewReady(event: Event, tabId: string): void {
  const webview = event.target as WebViewElement;
  if (!webview) return;

  webViewManager.initializeWebview(tabId, webview);

  // Se esta for a tab ativa, atualiza o status de favorito
  const activeTabId = tabsManager.getActiveTabId();
  if (activeTabId === tabId) {
    try {
      updateFavoriteStatus(webview.getURL());
    } catch (err) {
      console.error("Erro ao obter URL do webview:", err);
    }
  }
}

// Função específica para lidar com navegação a partir do input da barra de URL
function handleNavigateToURLFromInput(): void {
  webViewManager.navigateToURL(urlBarText.value);
}

// Função para lidar com a navegação a partir de diferentes fontes
function handleNavigateToURL(urlOrEvent: string | Event): void {
  // Verifica se o parâmetro recebido é uma string (URL) ou um evento
  if (typeof urlOrEvent === "string") {
    // É uma URL direta (da barra de favoritos)
    urlBarText.value = urlOrEvent;
    webViewManager.navigateToURL(urlOrEvent);
  } else {
    // É um evento, usamos o valor atual da barra de URL
    webViewManager.navigateToURL(urlBarText.value);
  }
}

function handleReload(): void {
  webViewManager.reload();
}

function handleGoBack(): void {
  webViewManager.goBack();
}

function handleGoForward(): void {
  webViewManager.goForward();
}

// Handler para tentar carregar novamente uma página com erro
function handleRetry(tabId: string): void {
  webViewManager.retryLoadingPage(tabId);
}

onMounted(() => {
  console.log("Componente montado");

  // Garantir que há pelo menos uma tab ativa
  tabsManager.ensureActiveTab();

  // Carregar preferências de UI, como mostrar favoritos
  showFavoritesBar.value = localStorage.getItem("showFavoritesBar") === "true";
});

watch(showFavoritesBar, (newValue: boolean) => {
  // Salva a preferência
  localStorage.setItem("showFavoritesBar", newValue.toString());
});
</script>

<style>
@font-face {
  font-family: "EchoBrowser";
  src:  url("./assets/fonts/OpenSans-Regular.ttf") format("truetype");
  font-display: swap;
  font-weight: normal;
  font-style: normal;
}

body,
html {
  margin: 0;
  padding: 0;
  height: 100%;
  overflow: hidden;
  font-family: "EchoBrowser", sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}
.browser-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
}
.toolbar {
  display: flex;
  padding: 8px;
  background-color: #f0f0f0;
}
.toolbar button {
  margin-right: 6px;
  padding: 6px 12px;
}
.url-bar {
  flex-grow: 1;
  padding: 6px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.favorite-button,
.toggle-favorites-button,
.history-button {
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #777;
  transition:
    color 0.2s,
    transform 0.1s;
}

.favorite-button:hover,
.toggle-favorites-button:hover,
.history-button:hover {
  color: #555;
  transform: scale(1.1);
}

.favorite-button.active {
  color: #ffab00;
}

.toggle-favorites-button.active {
  color: #1a73e8;
}

.history-button {
  font-size: 18px;
}

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

/* Estilos para o modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  width: 80%;
  height: 80%;
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: flex-end;
  padding: 8px;
  border-bottom: 1px solid #eee;
}

.modal-close {
  background: none;
  border: none;
  font-size: 24px;
  line-height: 1;
  color: #666;
  cursor: pointer;
  padding: 4px 8px;
}

.modal-close:hover {
  color: #000;
}

/* Estilos para modo privado */
.private-mode .toolbar {
  background-color: #37324A;
  color: #e0e0e0;
}

.private-mode .url-bar.private-input {
  background-color: #2C2640;
  border-color: #544D6B;
  color: #e0e0e0;
}

.private-mode-indicator {
  display: flex;
  align-items: center;
  padding: 0 10px;
  margin-right: 10px;
  border-radius: 4px;
  background-color: #544D6B;
  color: #e0e0e0;
}

.private-icon {
  margin-right: 6px;
  font-size: 14px;
}

.private-text {
  font-size: 12px;
  font-weight: 500;
}

.private-mode .favorite-button,
.private-mode .toggle-favorites-button,
.private-mode .history-button {
  color: #9C89B8;
}

.private-mode .favorite-button:hover,
.private-mode .toggle-favorites-button:hover,
.private-mode .history-button:hover {
  color: #BEAAE1;
}

.private-mode .favorite-button.active {
  color: #BEAAE1;
}

.private-mode button {
  background-color: #544D6B;
  color: #e0e0e0;
}

.private-mode button:disabled {
  background-color: #2C2640;
  color: #7A718F;
}
</style>
