<template>
  <div class="favorites-bar" v-if="showFavorites">
    <div class="favorites-container">
      <div 
        v-for="favorite in favorites" 
        :key="favorite.id" 
        class="favorite-item"
        @click="handleFavoriteClick(favorite)"
      >
        <div class="favorite-icon">
          <img v-if="favorite.favicon" :src="favorite.favicon" alt="" />
          <span v-else>🌐</span>
        </div>
        <div class="favorite-title" :title="favorite.title">
          {{ favorite.title }}
        </div>
        <button 
          class="favorite-remove" 
          @click.stop="handleRemoveFavorite(favorite.id)"
          title="Remover dos favoritos"
        >
          ×
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';
import { useFavorites } from '../composables/useFavorites';
import type { Favorite } from '../composables/useFavorites';

const props = defineProps<{
  showFavorites: boolean;
}>();

const emit = defineEmits<{
  (e: 'navigate', url: string): void;
}>();

const { favorites, removeFavorite } = useFavorites();

function handleFavoriteClick(favorite: Favorite) {
  emit('navigate', favorite.url);
}

function handleRemoveFavorite(id: string) {
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
  transition: opacity 0.2s, background-color 0.2s;
}

.favorite-item:hover .favorite-remove {
  opacity: 1;
}

.favorite-remove:hover {
  background-color: rgba(0, 0, 0, 0.1);
}
</style>
