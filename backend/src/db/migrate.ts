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
    bio        TEXT,
    profile_picture     TEXT,
    created_at TIMESTAMP DEFAULT NOW()
  );

  ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;
  ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_picture  TEXT;

  CREATE TABLE IF NOT EXISTS products (
    id          SERIAL PRIMARY KEY,
    user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name        VARCHAR(255) NOT NULL,
    description TEXT,
    price       NUMERIC(10,2) NOT NULL,
    image_url   TEXT,
    created_at  TIMESTAMP DEFAULT NOW()
  );

`;

async function migrate() {
  await db.query(createTables);
  console.log('tables are created');
  await db.end();
}

migrate();
