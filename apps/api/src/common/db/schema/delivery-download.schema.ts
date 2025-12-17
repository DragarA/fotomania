import { pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core';

import { collection } from './collections.schema';

export const deliveryDownload = pgTable('deliveryDownload', {
    id: text('id').primaryKey(),
    collectionId: text('collectionId')
        .notNull()
        .references(() => collection.id, { onDelete: 'cascade' }),
    downloadedAt: timestamp('downloadedAt').notNull(),
    ipAddress: varchar('ipAddress', { length: 45 }), // Supports IPv6
});

