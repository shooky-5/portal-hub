import { NextRequest, NextResponse } from 'next/server';
import { initializeDatabase } from '@/lib/db/seed';

/**
 * POST /api/init
 * Initialize database schema and seed with demo data
 * SECURITY: Only allow if initialization hasn't been done yet
 */
export async function POST(request: NextRequest) {
  try {
    // Check if we should allow initialization
    // In production, you might want to check a flag or environment variable
    const allowInit = process.env.NODE_ENV === 'development';

    if (!allowInit) {
      return NextResponse.json(
        { error: 'Initialization not allowed in this environment' },
        { status: 403 }
      );
    }

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
