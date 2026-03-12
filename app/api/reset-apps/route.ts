import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

/**
 * POST /api/reset-apps
 * Reset apps to only DIOS, xRL Compass, and TriZoning
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Resetting apps configuration...');

    // Delete all existing apps
    await query('DELETE FROM apps');

    // Insert the 3 apps
    const apps = [
      {
        id: 'dios',
        name: 'DIOS',
        full: 'Decision Intelligence Operating System',
        desc: 'Selects, executes, and adversarially challenges analytical frameworks through structured agent panels.',
        status: 'active',
        url: 'https://dios.analyticarmory.com',
        color: '#3B82F6',
        icon: 'layers',
      },
      {
        id: 'xrl',
        name: 'xRL Compass',
        full: 'xRL Compass',
        desc: 'Advanced red team and adversarial analysis platform.',
        status: 'active',
        url: 'https://compass.analyticarmory.com/',
        color: '#EF4444',
        icon: 'shield',
      },
      {
        id: 'trizoning',
        name: 'TriZoning',
        full: 'TriZoning Consensus Framework',
        desc: 'Three-zone analytical consensus building and debate resolution.',
        status: 'under_development',
        url: '#',
        color: '#EC4899',
        icon: 'network',
      },
    ];

    for (const app of apps) {
      await query(
        `INSERT INTO apps
         (id, name, full_name, description, status, url, color, icon)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          app.id,
          app.name,
          app.full,
          app.desc,
          app.status,
          app.url,
          app.color,
          app.icon,
        ]
      );
    }

    console.log('✅ Apps reset successfully');

    return NextResponse.json(
      {
        success: true,
        message: 'Apps reset to DIOS, xRL Compass, and TriZoning',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Reset failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Reset failed',
      },
      { status: 500 }
    );
  }
}
