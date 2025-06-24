import 'dotenv/config';
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Client } from "pg";

// Configure PG client with Azure SSL (uses trusted public certs)
const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: true
    }
});

async function main() {
    await client.connect();

    await migrate(drizzle(client), {
        migrationsFolder: "./config/drizzle/migration",
    });

    await client.end();
    console.log("✅ Migration successful");
}

main().catch((err) => {
    console.error("❌ Migration failed:", err);
    process.exit(1);
});