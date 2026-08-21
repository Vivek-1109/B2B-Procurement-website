import { Pool } from 'pg';
import { SCHEMA_SQL } from '../db/schema';

// ── Singleton pool ──────────────────────────────────────────
let pool: Pool | null = null;

export function getPool(): Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is not set');
    }

    pool = new Pool({
      connectionString,
      // Neon requires SSL; the connection string already carries ?sslmode=require
      // but we also set it explicitly as a fallback.
      ssl: { rejectUnauthorized: false },
      // Connection pool tuning — safe for Neon serverless
      max: 10,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 10_000,
    });

    pool.on('error', (err) => {
      console.error('❌ PostgreSQL pool error:', err);
    });
  }
  return pool;
}

// ── Schema initialisation ───────────────────────────────────
export async function initSchema(): Promise<void> {
  const client = await getPool().connect();
  try {
    await client.query(SCHEMA_SQL);
    console.log('✅ PostgreSQL schema initialised');
  } finally {
    client.release();
  }
}

// ── Connectivity check (replaces connectDB) ─────────────────
const connectDB = async (): Promise<void> => {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not set');
  }
  try {
    const client = await getPool().connect();
    const result = await client.query('SELECT current_database(), inet_server_addr()');
    const { current_database } = result.rows[0];
    client.release();
    console.log(`✅ PostgreSQL connected: ${current_database} (Neon)`);

    // Apply schema on every startup — all DDL statements are idempotent
    await initSchema();
  } catch (error) {
    console.error('❌ PostgreSQL connection error:', error);
    process.exit(1);
  }
};

export default connectDB;
