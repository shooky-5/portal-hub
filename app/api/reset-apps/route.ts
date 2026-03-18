import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

const APPS = [
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
    status: 'active',
    url: 'https://techradar.analyticarmory.com',
    color: '#10B981',
    icon: 'radio',
  },
  {
    id: 'prophetic',
    name: 'Prophetic',
    full: 'Geopolitical Forecasting Engine',
    desc: 'Multi-agent LLM pipeline that forecasts geopolitical events against prediction market prices with automated scoring.',
    status: 'active',
    url: 'https://prophetic.analyticarmory.com',
    color: '#F97316',
    icon: 'activity',
  },
  {
    id: 'spycraft',
    name: 'Spycraft',
    full: 'Adversarial Scenario Simulation',
    desc: 'Structured red cell exercises to stress-test conclusions and surface cognitive blind spots.',
    status: 'under_development',
    url: '#',
    color: '#8B5CF6',
    icon: 'triangle',
  },
];

async function resetApps() {
  console.log('🔧 Resetting apps configuration...');

  // Delete dependent records first, then apps
  await query('DELETE FROM user_app_last_run');
  await query('DELETE FROM user_app_sessions');
  await query('DELETE FROM apps');

  for (const app of APPS) {
    await query(
      `INSERT INTO apps
       (id, name, full_name, description, status, url, color, icon)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [app.id, app.name, app.full, app.desc, app.status, app.url, app.color, app.icon]
    );
  }

  console.log('✅ Apps reset successfully');
  return {
    success: true,
    message: 'Apps reset: DIOS & xRL Compass (Active), TRIZoning, Agent Sourcing, Tech Radar, Spycraft (Under Development)',
    apps: APPS.map((a) => ({ id: a.id, name: a.name, status: a.status })),
  };
}

/**
 * GET /api/reset-apps — browser-friendly reset
 */
export async function GET() {
  try {
    const result = await resetApps();
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('❌ Reset failed:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Reset failed' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/reset-apps — programmatic reset
 */
export async function POST() {
  try {
    const result = await resetApps();
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('❌ Reset failed:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Reset failed' },
      { status: 500 }
    );
  }
}
