import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

/**
 * POST /api/reset-apps
 * Reset apps with final configuration: DIOS & xRL Compass (active), TRIZoning, Agent Sourcing, Tech Radar (under development)
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Resetting apps configuration...');

    // Delete all existing apps
    await query('DELETE FROM apps');

    // Insert the apps (active first, under development second)
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
        full: 'Technology Assessment Intelligence',
        desc: 'Structured evaluation of emerging technologies against strategic and operational criteria.',
        status: 'active',
        url: 'https://compass.analyticarmory.com/',
        color: '#EF4444',
        icon: 'shield',
      },
      {
        id: 'trizoning',
        name: 'TRIZoning',
        full: 'Technology Dependency Mapping',
        desc: 'Identifies cascade risks between tech domains before they manifest as strategic surprises.',
        status: 'under_development',
        url: '#',
        color: '#EC4899',
        icon: 'network',
      },
      {
        id: 'agent-sourcing',
        name: 'Agent Sourcing',
        full: 'Probabilistic Assessment Engine',
        desc: 'Multiple AI models plus invited human experts generate calibrated forecasts.',
        status: 'under_development',
        url: '#',
        color: '#F59E0B',
        icon: 'barchart',
      },
      {
        id: 'tech-radar',
        name: 'Tech Radar',
        full: 'Emerging Technology Early Warning',
        desc: 'Continuous identification of high-signal trends with structured opportunity and risk assessments.',
        status: 'under_development',
        url: '#',
        color: '#10B981',
        icon: 'radio',
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
        message: 'Apps reset: DIOS & xRL Compass (Active), TRIZoning, Agent Sourcing, Tech Radar (Under Development)',
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
