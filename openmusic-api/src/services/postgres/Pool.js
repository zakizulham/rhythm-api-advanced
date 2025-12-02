// src/services/postgres/Pool.js
import pg from 'pg';
import 'dotenv/config';

const { Pool } = pg;

// Kredensial diambil dari environment variables
const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
});

export default pool;