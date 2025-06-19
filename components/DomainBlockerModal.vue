<template>
  <div class="domain-blocker-modal">
    <div class="blocker-header">
      <h2>Gerenciar Bloqueador de Anúncios</h2>
      <p>{{ activeDomainsCount }} domínios ativos</p>

      <div class="blocker-actions">
        <input
          v-model="newDomain"
          type="text"
          placeholder="Adicionar domínio (ex: ads.example.com)"
          class="domain-input"
          @keyup.enter="addDomain"
        >
        <button class="add-domain-btn" @click="addDomain">Adicionar</button>
      </div>

      <div class="search-container">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Buscar domínios"
          class="search-input"
        >
      </div>
    </div>

    <div class="domains-container">
      <div v-if="filteredDomains.length === 0" class="empty-list">
        <p v-if="searchQuery">
          Nenhum resultado encontrado para "{{ searchQuery }}"
        </p>
        <p v-else>Nenhum domínio bloqueado</p>
      </div>

      <div v-else class="domains-list">
        <div
          v-for="domain in filteredDomains"
          :key="domain.id"
          class="domain-item"
          :class="{ disabled: !domain.enabled }"
        >
          <div class="domain-toggle">
            <input
              :id="`domain-${domain.id}`"
              type="checkbox"
              :checked="domain.enabled"
              @change="() => toggleDomain(domain.id)"
            >
            <label :for="`domain-${domain.id}`" />
          </div>

          <div class="domain-name" :title="domain.domain">
            {{ domain.domain }}
          </div>

          <button
            class="remove-domain-btn"
            title="Remover domínio"
            @click="removeDomain(domain.id)"
          >
            ×
          </button>
        </div>
      </div>
    </div>

    <div class="blocker-footer">
      <button class="import-btn" @click="importPopularList">
        Importar Lista Popular
      </button>
      <button class="close-btn" @click="$emit('close')">Fechar</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useBlockedDomains } from "../composables/useBlockedDomains";

// Props do componente
defineProps<{
  isDarkMode: boolean;
}>();

// Emits
defineEmits(["close"]);

// Estado local
const newDomain = ref("");
const searchQuery = ref("");

// Usar o composable de domínios bloqueados
const {
  blockedDomains,
  addBlockedDomain,
  removeBlockedDomain,
  toggleDomainStatus,
  importBlocklist,
  getBlockedDomainsCount,
} = useBlockedDomains();

// Computed para domínios filtrados com base na pesquisa
const filteredDomains = computed(() => {
  if (!searchQuery.value) return blockedDomains.value;

  const query = searchQuery.value.toLowerCase();
  return blockedDomains.value.filter((domain) =>
    domain.domain.toLowerCase().includes(query)
  );
});

// Contagem de domínios ativos
const activeDomainsCount = computed(() => getBlockedDomainsCount());

// Adicionar novo domínio
function addDomain(): void {
  if (!newDomain.value.trim()) return;

  addBlockedDomain(newDomain.value);
  newDomain.value = "";
}

// Remover domínio
function removeDomain(id: string): void {
  removeBlockedDomain(id);
}

// Alternar status do domínio
function toggleDomain(id: string): void {
  toggleDomainStatus(id);
}

// Lista popular de bloqueio de anúncios
const popularBlocklist = [
  "ads.google.com",
  "adservice.google.com",
  "pagead2.googlesyndication.com",
  "googleadservices.com",
  "ad.doubleclick.net",
  "static.doubleclick.net",
  "www.googleadservices.com",
  "securepubads.g.doubleclick.net",
  "analytics.google.com",
  "google-analytics.com",
  "ssl.google-analytics.com",
  "www.google-analytics.com",
  "adwords.google.com",
  "tpc.googlesyndication.com",
  "ads-twitter.com",
  "ads.linkedin.com",
  "ads.yahoo.com",
  "ads.amazon.com",
  "tracking.amazon.com",
  "analytics.facebook.com",
  "ads.facebook.com",
  "an.facebook.com",
  "ads.pinterest.com",
  "analytics.pinterest.com",
  "ads.reddit.com",
  "analytics.reddit.com",
  "ads.youtube.com",
  "ads.tiktok.com",
  "analytics.tiktok.com",
  "bat.bing.com",
  "linkedin.com/analytics",
  "metrics.apple.com",
];

// Importar lista popular de domínios bloqueados
function importPopularList(): void {
  importBlocklist(popularBlocklist);
}
</script>

<style scoped>
.domain-blocker-modal {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: white;
  color: #333;
}

.blocker-header {
  padding: 16px;
  border-bottom: 1px solid #eee;
}

.blocker-header h2 {
  margin: 0 0 8px 0;
  font-size: 20px;
}

.blocker-header p {
  margin: 0 0 16px 0;
  color: #666;
  font-size: 14px;
}

.blocker-actions {
  display: flex;
  margin-bottom: 16px;
}

.domain-input {
  flex-grow: 1;
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 4px 0 0 4px;
  font-size: 14px;
}

.add-domain-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 0 4px 4px 0;
  background-color: #1a73e8;
  color: white;
  cursor: pointer;
}

.add-domain-btn:hover {
  background-color: #1558b3;
}

.search-container {
  margin-bottom: 8px;
}

.search-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
}

.domains-container {
  flex-grow: 1;
  overflow-y: auto;
  padding: 0 16px;
}

.empty-list {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100px;
  color: #666;
}

.domain-item {
  display: flex;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid #eee;
}

.domain-item.disabled {
  opacity: 0.6;
}

.domain-toggle {
  margin-right: 12px;
}

.domain-toggle input[type="checkbox"] {
  display: none;
}

.domain-toggle label {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 2px solid #ccc;
  border-radius: 4px;
  position: relative;
  cursor: pointer;
}

.domain-toggle input[type="checkbox"]:checked + label::after {
  content: "✓";
  position: absolute;
  top: -2px;
  left: 4px;
  color: #1a73e8;
  font-weight: bold;
}

.domain-name {
  flex-grow: 1;
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.remove-domain-btn {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  font-size: 18px;
  color: #666;
  cursor: pointer;
  border-radius: 50%;
  opacity: 0.7;
}

.remove-domain-btn:hover {
  background-color: #f0f0f0;
  opacity: 1;
}

.blocker-footer {
  padding: 16px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: space-between;
}

.import-btn {
  padding: 8px 16px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: white;
  color: #333;
  cursor: pointer;
}

.import-btn:hover {
  background-color: #f5f5f5;
}

.close-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  background-color: #1a73e8;
  color: white;
  cursor: pointer;
}

.close-btn:hover {
  background-color: #1558b3;
}

/* Estilos para tema escuro */
:global(.dark-mode) .domain-blocker-modal {
  background-color: #292a2d;
  color: #e4e4e4;
}

:global(.dark-mode) .blocker-header {
  border-bottom-color: #3c4043;
}

:global(.dark-mode) .blocker-header p {
  color: #9aa0a6;
}

:global(.dark-mode) .domain-input,
:global(.dark-mode) .search-input {
  background-color: #3c4043;
  border-color: #5f6368;
  color: #e4e4e4;
}

:global(.dark-mode) .add-domain-btn,
:global(.dark-mode) .close-btn {
  background-color: #8ab4f8;
  color: #202124;
}

:global(.dark-mode) .add-domain-btn:hover,
:global(.dark-mode) .close-btn:hover {
  background-color: #aecbfa;
}

:global(.dark-mode) .domain-item {
  border-bottom-color: #3c4043;
}

:global(.dark-mode) .domain-toggle label {
  border-color: #5f6368;
}

:global(.dark-mode)
  .domain-toggle
  input[type="checkbox"]:checked
  + label::after {
  color: #8ab4f8;
}

:global(.dark-mode) .remove-domain-btn {
  color: #9aa0a6;
}

:global(.dark-mode) .remove-domain-btn:hover {
  background-color: #3c4043;
}

:global(.dark-mode) .blocker-footer {
  border-top-color: #3c4043;
}

:global(.dark-mode) .import-btn {
  background-color: #3c4043;
  border-color: #5f6368;
  color: #e4e4e4;
}

:global(.dark-mode) .import-btn:hover {
  background-color: #4a4c50;
}
</style>
