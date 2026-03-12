import { NextRequest, NextResponse } from 'next/server';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';
import { query } from '@/lib/db';

/**
 * GET /api/platform/status
 * Get current platform health status
 */
export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request);

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);

    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const result = await query(
      `SELECT * FROM platform_components ORDER BY id ASC`
    );

    const components = result.rows.map((comp) => ({
      id: comp.id,
      label: comp.label,
      state: comp.status,
      note: comp.note,
    }));

    // Calculate overall health
    const hasOutage = components.some((c) => c.state === 'outage');
    const hasDegraded = components.some((c) => c.state === 'degraded');

    let overallState = 'healthy';
    if (hasOutage) overallState = 'critical';
    else if (hasDegraded) overallState = 'warning';

    return NextResponse.json(
      {
        components,
        overallState,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Platform status fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
