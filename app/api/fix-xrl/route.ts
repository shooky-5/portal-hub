import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

/**
 * POST /api/fix-xrl
 * Fix XRL app name and URL
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Fixing XRL app configuration...');

    // Update XRL app
    await query(
      `UPDATE apps
       SET name = $1, full_name = $2, url = $3
       WHERE id = $4`,
      ['XRL Compass', 'XRL Compass — Adversarial Analysis', 'https://compass.analyticarmory.com/', 'xrl']
    );

    console.log('✅ XRL app updated');

    return NextResponse.json(
      {
        success: true,
        message: 'XRL app configuration updated',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Fix failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Fix failed',
      },
      { status: 500 }
    );
  }
}
