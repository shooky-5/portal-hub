import { NextRequest, NextResponse } from 'next/server';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';
import { query } from '@/lib/db';

/**
 * GET /api/apps
 * Get all apps with their status
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
      `SELECT * FROM apps ORDER BY
        CASE
          WHEN status = 'under_development' THEN 0
          WHEN status = 'active' THEN 1
          ELSE 2
        END ASC,
        CASE
          WHEN id = 'trizoning' THEN 0
          WHEN id = 'forecasting' THEN 1
          WHEN id = 'spycraft' THEN 2
          WHEN id = 'dios' THEN 3
          WHEN id = 'xrl' THEN 4
          ELSE 999
        END ASC`
    );

    const apps = result.rows.map((app) => ({
      id: app.id,
      name: app.name,
      fullName: app.full_name,
      description: app.description,
      status: app.status,
      url: app.url,
      color: app.color,
      icon: app.icon,
    }));

    return NextResponse.json(apps, { status: 200 });
  } catch (error) {
    console.error('Apps fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
