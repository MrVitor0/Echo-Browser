<template>
  <div
    v-show="showSuggestions"
    class="suggestions-dropdown"
    :class="{ private: isPrivateMode }"
  >
    <div v-if="loading" class="suggestions-loading">
      <div class="loading-spinner" />
    </div>
    <ul v-else class="suggestions-list">
      <li
        v-for="(suggestion, index) in suggestions"
        :key="index"
        class="suggestion-item"
        :class="{ selected: index === selectedIndex }"
        @click="handleSuggestionClick(suggestion)"
        @mouseenter="$emit('highlight', index)"
      >
        <div class="suggestion-icon">🔍</div>
        <div class="suggestion-text">
          <!-- Destaca o texto digitado -->
          <span>
            <template
              v-for="(part, i) in highlightParts(suggestion, currentQuery)"
              :key="i"
            >
              <span v-if="part.highlight" class="highlight">{{
                part.text
              }}</span>
              <span v-else>{{ part.text }}</span>
            </template>
          </span>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
// Props do componente
defineProps<{
  suggestions: string[];
  selectedIndex: number;
  showSuggestions: boolean;
  loading: boolean;
  isPrivateMode: boolean;
  currentQuery: string;
}>();

// Define os emits
const _emit = defineEmits<{
  select: [suggestion: string];
  highlight: [index: number];
}>();

/**
 * Lida com o clique em uma sugestão
 */
function handleSuggestionClick(suggestion: string) {
  _emit("select", suggestion);
}

/**
 * Divide a sugestão em partes destacadas e não destacadas
 */
function highlightParts(
  suggestion: string,
  query: string
): Array<{ text: string; highlight: boolean }> {
  if (!query || query.trim().length < 1)
    return [{ text: suggestion, highlight: false }];
  try {
    const safeQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(safeQuery, "gi");
    const parts: Array<{ text: string; highlight: boolean }> = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = regex.exec(suggestion)) !== null) {
      if (match.index > lastIndex) {
        parts.push({
          text: suggestion.slice(lastIndex, match.index),
          highlight: false,
        });
      }
      parts.push({ text: match[0], highlight: true });
      lastIndex = regex.lastIndex;
    }
    if (lastIndex < suggestion.length) {
      parts.push({ text: suggestion.slice(lastIndex), highlight: false });
    }
    return parts;
  } catch (error) {
    console.error("Erro ao destacar texto:", error);
    return [{ text: suggestion, highlight: false }];
  }
}
</script>

<style scoped>
.suggestions-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  max-height: 300px;
  overflow-y: auto;
  background-color: white;
  border-radius: 0 0 4px 4px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  z-index: 100;
  border: 1px solid #ddd;
  border-top: none;
}

.suggestions-dropdown.private {
  background-color: #2c2640;
  border-color: #544d6b;
}

.suggestions-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.suggestion-item {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  cursor: pointer;
}

.suggestions-dropdown:not(.private) .suggestion-item:hover,
.suggestions-dropdown:not(.private) .suggestion-item.selected {
  background-color: #f5f5f5;
}

.suggestions-dropdown.private .suggestion-item {
  color: #e0e0e0;
}

.suggestions-dropdown.private .suggestion-item:hover,
.suggestions-dropdown.private .suggestion-item.selected {
  background-color: #433d5b;
}

.suggestion-icon {
  margin-right: 10px;
  font-size: 14px;
  opacity: 0.6;
}

.suggestion-text {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.suggestions-loading {
  display: flex;
  justify-content: center;
  padding: 15px;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.suggestions-dropdown.private .loading-spinner {
  border: 2px solid #37324a;
  border-top: 2px solid #9c89b8;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

:deep(.highlight) {
  font-weight: bold;
  color: #1a73e8;
}

.suggestions-dropdown.private :deep(.highlight) {
  color: #beaae1;
}

/* Atualizar os estilos para tema escuro */
:global(.dark-mode) .suggestions-dropdown:not(.private) {
  background-color: #292a2d;
  border-color: #3c4043;
}

:global(.dark-mode) .suggestions-dropdown:not(.private) .suggestion-item {
  color: #e4e4e4;
}

:global(.dark-mode) .suggestions-dropdown:not(.private) .suggestion-item:hover,
:global(.dark-mode)
  .suggestions-dropdown:not(.private)
  .suggestion-item.selected {
  background-color: #3c4043;
}

:global(.dark-mode) .suggestions-dropdown:not(.private) .loading-spinner {
  border-color: #3c4043;
  border-top-color: #8ab4f8;
}

:global(.dark-mode) .suggestions-dropdown:not(.private) :deep(.highlight) {
  color: #8ab4f8;
}
</style>
