// backend/db.js
import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config(); // Don't specify a path, use default `.env` in root

const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

export default pool;
