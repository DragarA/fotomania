/**
 * Catalogue entity type (based on database schema)
 * Represents a photo gallery container
 */
export interface Catalogue {
  id: string;
  title: string;
  description?: string | null;
  coverImage?: string | null;
  password?: string | null;
  publicUrlSlug: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  photoCount?: number;
}

/**
 * Response type for catalogue deletion
 */
export interface DeleteCatalogueResponse {
  message: string;
}
