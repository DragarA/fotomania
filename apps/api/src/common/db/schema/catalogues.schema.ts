import { pgEnum, pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core';

import { user } from './users.schema';

export const catalogueStatusEnum = pgEnum('catalogue_status', [
    'draft',
    'published',
    'deleted',
]);

export const catalogue = pgTable('catalogue', {
    id: text('id').primaryKey(),
    title: text('title').notNull(),
    description: text('description'),
    coverImage: text('coverImage'),
    password: text('password'),
    status: catalogueStatusEnum('status').notNull().default('draft'),
    publicUrlSlug: varchar('publicUrlSlug', { length: 255 }).notNull().unique(),
    ownerId: text('ownerId')
        .notNull()
        .references(() => user.id),
    createdAt: timestamp('createdAt').notNull(),
    updatedAt: timestamp('updatedAt').notNull(),
});
