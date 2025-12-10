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
} from './useCatalogues';

// Collection hooks
export {
  useCollectionsQuery,
  useCollectionQuery,
  useCreateCollectionMutation,
  useUpdateCollectionMutation,
  useDeleteCollectionMutation,
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
