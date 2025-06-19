<template>
  <div v-if="showFavorites" class="favorites-bar">
    <div :class="{ 'dark-mode': isDarkMode }" class="favorites-container">
      <div
        v-for="favorite in favorites"
        :key="favorite.id"
        :class="{ 'dark-item': isDarkMode }"
        class="favorite-item"
        @click="handleFavoriteClick(favorite)"
      >
        <div class="favorite-icon">
          <img v-if="favorite.favicon" :src="favorite.favicon" alt="" >
          <span v-else>🌐</span>
        </div>
        <div class="favorite-title" :title="favorite.title">
          {{ favorite.title }}
        </div>
        <button
          title="Remover dos favoritos"
          class="favorite-remove"
          @click.stop="handleRemoveFavorite(favorite.id)"
        >
          ×
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useFavorites } from "../composables/useFavorites";
import type { Favorite } from "../composables/useFavorites";

// Definir corretamente as props com TypeScript
defineProps<{
  showFavorites: boolean;
  isDarkMode: boolean;
}>();

// Definir os emits com tipos corretos
const emit = defineEmits<{
  navigate: [url: string];
}>();

// Usar o composable de favoritos
const { favorites, removeFavorite } = useFavorites();

// Handler para clique em um favorito
function handleFavoriteClick(favorite: Favorite): void {
  emit("navigate", favorite.url);
}

// Handler para remover um favorito
function handleRemoveFavorite(id: string): void {
  removeFavorite(id);
}
</script>

<style scoped>
.favorites-bar {
  width: 100%;
  background-color: #f5f5f5;
  border-bottom: 1px solid #ddd;
  padding: 6px 10px;
}

.favorites-container {
  display: flex;
  overflow-x: auto;
  gap: 10px;
}

.favorite-item {
  display: flex;
  align-items: center;
  padding: 4px 8px;
  border-radius: 4px;
  background-color: #e8e8e8;
  cursor: pointer;
  white-space: nowrap;
  max-width: 160px;
  position: relative;
}

.favorite-item:hover {
  background-color: #d8d8d8;
}

.favorite-icon {
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 6px;
  flex-shrink: 0;
}

.favorite-icon img {
  width: 16px;
  height: 16px;
  object-fit: contain;
}

.favorite-title {
  font-size: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 120px;
}

.favorite-remove {
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  font-size: 14px;
  color: #666;
  cursor: pointer;
  margin-left: 4px;
  border-radius: 50%;
  opacity: 0;
  transition:
    opacity 0.2s,
    background-color 0.2s;
}

.favorite-item:hover .favorite-remove {
  opacity: 1;
}

.favorite-remove:hover {
  background-color: rgba(0, 0, 0, 0.1);
}

.dark-item {
  background-color: #3c4043;
  color: #e4e4e4;
}

.dark-item:hover {
  background-color: #4a4c50;
}

.dark-mode .favorites-bar {
  background-color: #292a2d;
  border-bottom-color: #3c4043;
}

/* Estilos para tema escuro */
:global(.dark-mode) .favorites-bar {
  background-color: #292a2d;
  border-bottom-color: #3c4043;
}

:global(.dark-mode) .favorite-item {
  background-color: #3c4043;
  color: #e4e4e4;
}

:global(.dark-mode) .favorite-item:hover {
  background-color: #4a4c50;
}

:global(.dark-mode) .favorite-remove {
  color: #8ab4f8;
}

:global(.dark-mode) .favorite-remove:hover {
  background-color: rgba(255, 255, 255, 0.1);
}
</style>
