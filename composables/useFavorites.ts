import { useState } from '#app';

export interface Favorite {
  id: string;
  title: string;
  url: string;
  favicon?: string;
  addedAt: number; // timestamp
}

export const useFavorites = () => {
  // Usando useState do Nuxt para persistência
  const favorites = useState<Favorite[]>('browser-favorites', () => []);

  // Funções para manipular os favoritos
  const addFavorite = (title: string, url: string, favicon?: string): Favorite => {
    const id = `fav-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newFavorite: Favorite = {
      id,
      title: title || 'Sem título',
      url,
      favicon,
      addedAt: Date.now()
    };

    // Verificar se o URL já existe como favorito
    const existingIndex = favorites.value.findIndex(fav => fav.url === url);
    
    if (existingIndex >= 0) {
      // Atualizar favorito existente
      favorites.value[existingIndex] = newFavorite;
    } else {
      // Adicionar novo favorito
      favorites.value = [...favorites.value, newFavorite];
    }
    
    return newFavorite;
  };

  const removeFavorite = (id: string): void => {
    favorites.value = favorites.value.filter(fav => fav.id !== id);
  };

  const isFavorite = (url: string): boolean => {
    return favorites.value.some(fav => fav.url === url);
  };

  const updateFavorite = (id: string, data: Partial<Favorite>): void => {
    favorites.value = favorites.value.map(fav => 
      fav.id === id ? { ...fav, ...data } : fav
    );
  };

  const getFavoriteByUrl = (url: string): Favorite | undefined => {
    return favorites.value.find(fav => fav.url === url);
  };

  return {
    favorites,
    addFavorite,
    removeFavorite,
    isFavorite,
    updateFavorite,
    getFavoriteByUrl
  };
};
