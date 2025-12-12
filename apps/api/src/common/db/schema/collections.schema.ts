import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';

import { catalogue } from './catalogues.schema';

export const collection = pgTable('collection', {
    id: text('id').primaryKey(),
    name: text('title').notNull(),
    catalogueId: text('catalogueId')
        .notNull()
        .references(() => catalogue.id),
    createdAt: timestamp('createdAt').notNull(),
    updatedAt: timestamp('updatedAt').notNull(),
});
