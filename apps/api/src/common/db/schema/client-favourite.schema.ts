import { pgTable, text } from 'drizzle-orm/pg-core';

import { clientSession } from './client-session.schema';
import { photo } from './photos.schema';

export const clientFavourite = pgTable('clientFavourite', {
    id: text('id').primaryKey(),
    clientSessionId: text('clientSessionId')
        .notNull()
        .references(() => clientSession.id, { onDelete: 'cascade' }),
    photoId: text('photoId')
        .notNull()
        .references(() => photo.id, { onDelete: 'cascade' }),
});
