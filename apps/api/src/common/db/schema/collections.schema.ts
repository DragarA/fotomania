import { pgEnum, pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core';

import { catalogue } from './catalogues.schema';
import { clientSession } from './client-session.schema';

export const collectionTypeEnum = pgEnum('collection_type', [
    'proofing',
    'delivery',
]);

export const collection = pgTable('collection', {
    id: text('id').primaryKey(),
    name: text('title').notNull(),
    catalogueId: text('catalogueId')
        .notNull()
        .references(() => catalogue.id),
    type: collectionTypeEnum('type').notNull().default('proofing'),
    clientSessionId: text('clientSessionId').references(() => clientSession.id),
    deliverySlug: varchar('deliverySlug', { length: 255 }).unique(),
    invoicePath: text('invoicePath'),
    createdAt: timestamp('createdAt').notNull(),
    updatedAt: timestamp('updatedAt').notNull(),
});
