import { drizzle } from 'drizzle-orm/postgres-js';
import dotenv from 'dotenv';
dotenv.config();
// @ts-ignore
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL as string;
const client = postgres(connectionString)

export const db = drizzle(client, {
    schema: schema,
    logger: true,
});