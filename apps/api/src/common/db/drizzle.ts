import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

import * as schema from './schema';

export const DRIZZLE = Symbol('DRIZZLE');

export const createDrizzleConnection = (connectionString: string) => {
    const pool = new Pool({
        connectionString,
    });

    return drizzle(pool, { schema });
};

export type DrizzleDB = ReturnType<typeof createDrizzleConnection>;
