import {
  integer,
  pgTable,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';

import { collection } from './collections.schema';

export const photo = pgTable('photo', {
  id: text('id').primaryKey(),
  originalFileName: varchar('originalFileName', { length: 255 }).notNull(),
  storagePath: varchar('storagePath', { length: 500 }).notNull().unique(),
  mimeType: varchar('mimeType', { length: 100 }).notNull(),
  thumbnailPath: varchar('thumbnailPath', { length: 500 }),
  width: integer('width'),
  height: integer('height'),
  size: integer('size'),
  collectionId: text('collectionId')
    .notNull()
    .references(() => collection.id, { onDelete: 'cascade' }),
  createdAt: timestamp('createdAt').notNull(),
  updatedAt: timestamp('updatedAt').notNull(),
});
