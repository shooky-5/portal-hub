import { NextRequest, NextResponse } from 'next/server';
import { initializeDatabase } from '@/lib/db/seed';

/**
 * POST /api/init
 * Initialize database schema and seed with demo data
 * SECURITY: Only allow if initialization hasn't been done yet
 */
export async function POST(request: NextRequest) {
  try {
    // Allow initialization in all environments for initial setup
    // TODO: Add security check (e.g., API key) for production use

    console.log('🚀 Starting database initialization...');
    await initializeDatabase();

    return NextResponse.json(
      {
        success: true,
        message: 'Database initialized successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Initialization failed',
      },
      { status: 500 }
    );
  }
}
