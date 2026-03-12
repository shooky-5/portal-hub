import { Pool, QueryResult } from 'pg';

/**
 * PostgreSQL connection pool for Portal Hub
 * Manages connections to the database
 */

let pool: Pool | null = null;

export function getPool(): Pool {
  if (!pool) {
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
      throw new Error('DATABASE_URL environment variable is not set');
    }

    pool = new Pool({
      connectionString: databaseUrl,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
    });
  }

  return pool;
}

export async function query<T = any>(
  text: string,
  values?: any[]
): Promise<QueryResult<T>> {
  const pool = getPool();
  return pool.query<T>(text, values);
}

export async function getConnection() {
  const pool = getPool();
  return pool.connect();
}

export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
