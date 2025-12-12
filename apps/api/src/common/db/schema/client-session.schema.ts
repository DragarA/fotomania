import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';

import { catalogue } from './catalogues.schema';

export const clientSession = pgTable('clientSession', {
    id: text('id').primaryKey(),
    email: text('email').notNull(),
    catalogueId: text('catalogueId')
        .notNull()
        .references(() => catalogue.id),
    createdAt: timestamp('createdAt').notNull(),
    updatedAt: timestamp('updatedAt').notNull(),
});
