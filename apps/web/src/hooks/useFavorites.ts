import { useState, useEffect } from 'react';

const FAVORITES_KEY_PREFIX = 'fotomania_favorites:';

const getStorageKey = (slug: string) => `${FAVORITES_KEY_PREFIX}${slug}`;

function readFavoritesFromStorage(slug?: string) {
    if (!slug || typeof window === 'undefined') {
        return new Set<string>();
    }

    try {
        const stored = localStorage.getItem(getStorageKey(slug));
        if (stored) {
            return new Set<string>(JSON.parse(stored));
        }
    } catch (error) {
        console.error('Failed to load favorites from localStorage:', error);
    }

    return new Set<string>();
}

export function useFavorites(slug?: string) {
    const [favorites, setFavorites] = useState<Set<string>>(() =>
        readFavoritesFromStorage(slug)
    );

    // Reload favorites when slug changes
    useEffect(() => {
        setFavorites(readFavoritesFromStorage(slug));
    }, [slug]);

    // Sync to localStorage whenever favorites change
    useEffect(() => {
        if (!slug || typeof window === 'undefined') {
            return;
        }

        try {
            localStorage.setItem(
                getStorageKey(slug),
                JSON.stringify(Array.from(favorites))
            );
        } catch (error) {
            console.error('Failed to save favorites to localStorage:', error);
        }
    }, [favorites, slug]);

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
