import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';

import { catalogue } from './catalogues.schema';

export const clientSession = pgTable('clientSession', {
    id: text('id').primaryKey(),
    email: text('email').notNull(),
    clientName: text('clientName'),
    clientAddressStreet: text('clientAddressStreet'),
    clientAddressCity: text('clientAddressCity'),
    clientAddressPostalCode: text('clientAddressPostalCode'),
    clientAddressCountry: text('clientAddressCountry'),
    clientPhoneNumber: text('clientPhoneNumber'),
    clientNotes: text('clientNotes'),
    catalogueId: text('catalogueId')
        .notNull()
        .references(() => catalogue.id, { onDelete: 'cascade' }),
    createdAt: timestamp('createdAt').notNull(),
    updatedAt: timestamp('updatedAt').notNull(),
});
