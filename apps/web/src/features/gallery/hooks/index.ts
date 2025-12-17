/**
 * Centralized hooks exports for the Gallery feature domain
 *
 * This barrel export provides a single import point for all hooks
 * related to catalogues, collections, and photos.
 */

// Catalogue hooks
export {
    useCataloguesQuery,
    useCatalogueQuery,
    usePublicCatalogueQuery,
    useCreateCatalogueMutation,
    useUpdateCatalogueMutation,
    useDeleteCatalogueMutation,
    useSetCatalogueCoverMutation,
    useUpdateCatalogueStatusMutation
} from './useCatalogues';

// Collection hooks
export {
    useCollectionsQuery,
    useCollectionQuery,
    useCreateCollectionMutation,
    useUpdateCollectionMutation,
    useDeleteCollectionMutation,
    useCreateDeliveryCollectionMutation,
} from './useCollections';

// Photo hooks
export {
    usePhotosQuery,
    usePublicPhotosQuery,
    useUploadPhotoMutation,
    useDeletePhotoMutation,
} from './usePhotos';

// Photo upload management hook
export { usePhotoUpload } from './usePhotoUpload';

// Client favourites hooks
export { useCatalogueFavouritesQuery } from './useCatalogueFavourites';
export type { ClientFavouriteSession } from './useCatalogueFavourites';
export { useSessionFavouritesQuery } from './useSessionFavourites';

// Public access hooks
export {
    usePublicAccess,
    getPublicAccessToken,
    setPublicAccessToken,
    clearPublicAccessToken,
} from './usePublicAccess';
