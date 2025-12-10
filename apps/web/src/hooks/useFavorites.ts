import { useState, useEffect } from 'react';

const FAVORITES_KEY = 'fotomania_favorites';

export function useFavorites() {
  const [favorites, setFavorites] = useState<Set<string>>(() => {
    // Initialize from localStorage
    try {
      const stored = localStorage.getItem(FAVORITES_KEY);
      if (stored) {
        return new Set(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load favorites from localStorage:', error);
    }
    return new Set();
  });

  // Sync to localStorage whenever favorites change
  useEffect(() => {
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(Array.from(favorites)));
    } catch (error) {
      console.error('Failed to save favorites to localStorage:', error);
    }
  }, [favorites]);

  const toggleFavorite = (photoId: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(photoId)) {
        next.delete(photoId);
      } else {
        next.add(photoId);
      }
      return next;
    });
  };

  const isFavorite = (photoId: string) => favorites.has(photoId);

  const getFavoriteIds = () => Array.from(favorites);

  return {
    toggleFavorite,
    isFavorite,
    getFavoriteIds,
    favoritesCount: favorites.size,
  };
}
