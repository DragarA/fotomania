import {
  pgTable,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';
import { collection } from './collections.schema';

export const photo = pgTable('photo', {
  id: text('id').primaryKey(),
  originalFileName: varchar('originalFileName', { length: 100 }).notNull(),
  storagePath: varchar('storagePath', { length: 255 }).notNull().unique(),
  mimeType: varchar('mimeType', { length: 50 }).notNull().unique(),
  thumbnailPath: varchar('thumbnailPath', { length: 255 }).notNull().unique(),
  collectionId: text('collectionId')
    .notNull()
    .references(() => collection.id),
  createdAt: timestamp('createdAt').notNull(),
  updatedAt: timestamp('updatedAt').notNull(),
});
