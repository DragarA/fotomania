import {
  pgTable,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';
import { clientSession } from './client-session.schema';
import { photo } from './photos.schema';

export const clientFavourite = pgTable('clientFavourite', {
  id: text('id').primaryKey(),
  clientSessionId: text('clientSessionId').notNull().references(() => clientSession.id),
  photoId: text('photoId').notNull().references(() => photo.id),
});
