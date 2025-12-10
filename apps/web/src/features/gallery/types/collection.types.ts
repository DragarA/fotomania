/**
 * Collection entity type
 * Represents a grouping of photos within a catalogue
 */
export interface Collection {
  id: string;
  name: string;
  catalogueId: string;
  photoCount: number;
  createdAt: string;
  updatedAt: string;
}
