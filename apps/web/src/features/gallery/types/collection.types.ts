/**
 * Collection entity type
 * Represents a grouping of photos within a catalogue
 */
export interface Collection {
  id: string;
  name: string;
  photoCount?: number;
}
