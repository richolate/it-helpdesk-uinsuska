import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';
import * as dotenv from 'dotenv';

dotenv.config();

// Create a Postgres connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Initialize Drizzle ORM
export const db = drizzle(pool, { schema });
