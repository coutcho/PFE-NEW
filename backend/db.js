// backend/db.js
import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config({path: '../.env'});

const { Pool } = pkg;

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

console.log("DB password type:", typeof process.env.DB_PASSWORD);
console.log("DB password value:", process.env.DB_PASSWORD);

export default pool;
