import 'dotenv/config';
import { Pool } from 'pg';

const db = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const createTables = `
  CREATE TABLE IF NOT EXISTS users (
    id         SERIAL PRIMARY KEY,
    email      VARCHAR(255) UNIQUE NOT NULL,
    password   VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
  );
`;

async function migrate() {
  await db.query(createTables);
  console.log('tables are created');
  await db.end();
}

migrate();
