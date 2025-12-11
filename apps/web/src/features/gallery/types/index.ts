/**
 * Centralized type definitions for the Gallery feature domain
 *
 * This barrel export provides a single source of truth for all types
 * related to catalogues, collections, and photos.
 */

export type {
  Catalogue,
  DeleteCatalogueResponse,
} from './catalogue.types';

export type {
  Collection,
} from './collection.types';

export type {
  Photo,
  UploadStatus,
  UploadingFile,
  UploadPhotoParams,
} from './photo.types';

export type {
  ClientFavouriteSession,
} from '../hooks/useCatalogueFavourites';
